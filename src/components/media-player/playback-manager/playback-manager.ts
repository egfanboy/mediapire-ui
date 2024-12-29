import mediaPlayerEvents, {
  MediaPlayerEventType,
} from "../../../events/media-player/media-player.events";
import { mediaPlayerStore } from "../state-machine/media-player-store";
import { shuffleArray } from "./utils/shuffle-array";

// time tolerance in seconds when handling the previous media event
const PREVIOUS_TIME_TOLERANCE = 3;

const localStoragePlaybackStateKey = "mediapire_media_playback_state";

class _playbackManager {
  constructor() {
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.setMedia = this.setMedia.bind(this);
    this.toggleRepeatMode = this.toggleRepeatMode.bind(this);
    this.toggleShuffle = this.toggleShuffle.bind(this);
    this.handlePlaybackEnded = this.handlePlaybackEnded.bind(this);

    //  mapping of event type to callback, used to dynamically subscribe and unsubscribe
    this.eventHandlerMapping = {
      [MediaPlayerEventType.Play]: this.handlePlay,
      [MediaPlayerEventType.Pause]: this.handlePause,
      [MediaPlayerEventType.Next]: this.handleNext,
      [MediaPlayerEventType.Previous]: this.handlePrevious,
      [MediaPlayerEventType.SetMediaLibrary]: this.setMedia,
      [MediaPlayerEventType.ToggleRepeatMode]: this.toggleRepeatMode,
      [MediaPlayerEventType.ToggleShuffle]: this.toggleShuffle,
      [MediaPlayerEventType.PlaybackEnded]: this.handlePlaybackEnded,
    };
  }

  eventHandlerMapping = {};
  media: any[] = [];

  shuffledMedia = [];

  currentMediaId = "";

  init() {
    for (const key in this.eventHandlerMapping) {
      // @ts-ignore
      mediaPlayerEvents.subscribe(key as any, this.eventHandlerMapping[key]);
    }

    this.readFromLocalStorage();
  }

  destroy() {
    for (const key in this.eventHandlerMapping) {
      // @ts-ignore
      mediaPlayerEvents.unsubscribe(key as any, this.eventHandlerMapping[key]);
    }
  }

  toggleRepeatMode() {
    const currentState = mediaPlayerStore.getSnapshot();

    const { repeatMode } = currentState;
    let newRepeatMode = "";
    if (repeatMode === "none") {
      newRepeatMode = "all";
    }
    if (repeatMode === "all") {
      newRepeatMode = "one";
    }

    if (repeatMode === "one") {
      newRepeatMode = "none";
    }

    if (newRepeatMode) {
      mediaPlayerStore.setState((state) => ({
        ...state,
        repeatMode: newRepeatMode as any,
      }));

      this.updateLocalStorage();
    }
  }

  handleNext() {
    const targetList = this.shuffledMedia.length
      ? this.shuffledMedia
      : this.media;

    const currentMediaIndex = targetList.findIndex(
      (m) => m.id === this.currentMediaId
    );

    if (currentMediaIndex !== -1) {
      const isLast = currentMediaIndex === targetList.length - 1;

      const nextTrack = targetList[isLast ? 0 : currentMediaIndex + 1];
      if (nextTrack) {
        this.currentMediaId = nextTrack.id;
        mediaPlayerStore.setState((state) => ({
          ...state,
          currentTrack: nextTrack,
          playbackTime: 0,
        }));
      }
    }
  }

  handlePrevious() {
    const currentState = mediaPlayerStore.getSnapshot();
    if (currentState.playbackTime < PREVIOUS_TIME_TOLERANCE) {
      const targetList = this.shuffledMedia.length
        ? this.shuffledMedia
        : this.media;
      const currentMediaIndex = targetList.findIndex(
        (m) => m.id === this.currentMediaId
      );

      const isFirstItem = currentMediaIndex === 0;

      const nextIndex = isFirstItem
        ? this.media.length - 1
        : /**
           * Math.max is used here to cover for the scenario where currentIndex is -1 which
           * occurs when the item was most likely removed from the library.
           * Just restarts at the begining of the library (0 index)
           */
          Math.max(currentMediaIndex - 1, 0);

      const nextTrack = targetList[nextIndex];

      if (nextTrack) {
        this.currentMediaId = nextTrack.id;
        mediaPlayerStore.setState((state) => ({
          ...state,
          playbackTime: 0,
          currentTrack: nextTrack,
        }));
      }
    } else {
      // keeping the same item, put the playback time to 0
      mediaPlayerStore.setState((state) => ({
        ...state,
        playbackTime: 0,
      }));
    }
  }

  handlePlay() {
    if (this.currentMediaId) {
      mediaPlayerStore.setState((state) => ({
        ...state,
        paused: false,
      }));
    }
  }

  handlePause() {
    mediaPlayerStore.setState((state) => ({
      ...state,
      paused: true,
    }));
  }

  setMedia(data?: { [key: string]: any }) {
    if (data) {
      this.media = data.media;

      if (data.autoplay) {
        const currentState = mediaPlayerStore.getSnapshot();

        // play first song from the media list
        let mediaToPlay = this.media[0];

        // if we are shuffling take a random index as the starting point
        if (currentState.shuffling) {
          mediaToPlay =
            this.media[Math.floor(Math.random() * this.media.length)];
        }

        this.currentMediaId = mediaToPlay.id;
        mediaPlayerStore.setState((state) => ({
          ...state,
          currentTrack: mediaToPlay,
        }));

        // on autoplay respect the shuffle settings
        this.shuffleMedia(currentState.shuffling);
      }
    }
  }

  toggleShuffle() {
    const currentState = mediaPlayerStore.getSnapshot();

    const nextValue = !currentState.shuffling;

    this.shuffleMedia(nextValue);

    mediaPlayerStore.setState((state) => ({
      ...state,
      shuffling: !currentState.shuffling,
    }));

    this.updateLocalStorage();
  }

  shuffleMedia(shuffle: boolean) {
    if (shuffle && this.media.length) {
      const currentMediaIndex = this.media.findIndex(
        (m) => m.id === this.currentMediaId
      );

      const media = [...this.media];

      const currentMedia = media.splice(currentMediaIndex, 1);

      // @ts-ignore
      this.shuffledMedia = [currentMedia[0], ...shuffleArray(media)];
    } else {
      this.shuffledMedia = [];
    }
  }

  updateLocalStorage() {
    const currentState = mediaPlayerStore.getSnapshot();

    localStorage.setItem(
      localStoragePlaybackStateKey,
      JSON.stringify({
        shuffling: currentState.shuffling,
        repeatMode: currentState.repeatMode,
      })
    );
  }

  readFromLocalStorage() {
    const value = JSON.parse(
      localStorage.getItem(localStoragePlaybackStateKey) ||
        '{"shuffling":false, "repeatMode": "none"}'
    );

    mediaPlayerStore.setState((state) => ({
      ...state,
      shuffling: value.shuffling,
      repeatMode: value.repeatMode,
    }));
  }

  handlePlaybackEnded() {
    const currentState = mediaPlayerStore.getSnapshot();

    if (currentState.repeatMode === "one") {
      return mediaPlayerStore.setState((state) => ({
        ...state,
        playbackTime: 0,
      }));
    }

    const targetList = this.shuffledMedia.length
      ? this.shuffledMedia
      : this.media;

    const currentMediaIndex = targetList.findIndex(
      (m) => m.id === this.currentMediaId
    );

    const isLastSong = currentMediaIndex === targetList.length - 1;

    if (isLastSong) {
      // no repeat so stop playback
      if (currentState.repeatMode !== "all") {
        return mediaPlayerStore.setState((state) => ({
          ...state,
          playbackTime: 0,
          paused: true,
        }));
      }
    }

    // no special scenario just play next song
    this.handleNext();
  }
}

export default new _playbackManager();
