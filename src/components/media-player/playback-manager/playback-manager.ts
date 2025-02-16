import mediaPlayerEvents, {
  MediaPlayerEventType,
} from "../../../events/media-player/media-player.events";
import { mediaStore } from "../../../stores/media/media-store";
import { mediaPlayerStore } from "../state-machine/media-player-store";
import { shuffleArray } from "./utils/shuffle-array";

// time tolerance in seconds when handling the previous media event
const PREVIOUS_TIME_TOLERANCE = 3;

// Localstorage defaults therefore represent a stringified version of their value
const VOLUME_DEFAULT = "75";
const MUTED_DEFAULT = "false";

const localStoragePlaybackStateKey = "mediapire_media_playback_state";
const localStorageVolumeStateKey = "mediapire_playback_volume_state";
const localStorageVolumeMutedKey = "mediapire_playback_volume_muted";

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
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleMute = this.handleMute.bind(this);

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
      [MediaPlayerEventType.VolumeChange]: this.handleVolumeChange,
      [MediaPlayerEventType.Mute]: this.handleMute,
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

      this.updatePlaybackLocalStorage();
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
    } else {
      /*
       ** gets the current media from the state and starts it.
       ** this assumes the user presses play without picking any media
       */

      const mediaState = mediaStore.getSnapshot();
      if (mediaState.media.length) {
        this.setMedia({ media: mediaState.media, autoplay: true });
      }
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

    this.updatePlaybackLocalStorage();
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

  updatePlaybackLocalStorage() {
    const currentState = mediaPlayerStore.getSnapshot();

    localStorage.setItem(
      localStoragePlaybackStateKey,
      JSON.stringify({
        shuffling: currentState.shuffling,
        repeatMode: currentState.repeatMode,
      })
    );
  }

  updateVolumeLocalStorage() {
    const currentState = mediaPlayerStore.getSnapshot();
    localStorage.setItem(
      localStorageVolumeStateKey,
      JSON.stringify(currentState.volume)
    );
  }

  updateVolumeMutedLocalStorage() {
    const currentState = mediaPlayerStore.getSnapshot();
    localStorage.setItem(
      localStorageVolumeMutedKey,
      JSON.stringify(currentState.muted)
    );
  }

  readFromLocalStorage() {
    const playbackValue = JSON.parse(
      localStorage.getItem(localStoragePlaybackStateKey) ||
        '{"shuffling":false, "repeatMode": "none"}'
    );

    const mutedValue =
      localStorage.getItem(localStorageVolumeMutedKey) || MUTED_DEFAULT;

    const muted = mutedValue === "true";

    const volumeValue =
      localStorage.getItem(localStorageVolumeStateKey) || VOLUME_DEFAULT;

    mediaPlayerStore.setState((state) => ({
      ...state,
      shuffling: playbackValue.shuffling,
      repeatMode: playbackValue.repeatMode,
      muted: muted,
      volume: muted ? 0 : +volumeValue,
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

  handleVolumeChange(event: { volume?: number; finalChange?: boolean }) {
    if (event.volume) {
      mediaPlayerStore.setState((state) => ({
        ...state,
        volume: event.volume || 0,
      }));
    }

    /*
     * if it is the final change set the value in localStorage, supports adjusting the volume as the user drags
     * casts to boolean since final change can be undefined
     */
    if (!!event.finalChange) {
      this.updateVolumeLocalStorage();
    }
  }

  handleMute() {
    const currentState = mediaPlayerStore.getSnapshot();

    if (currentState.muted) {
      // get user volume from localstorage
      const volume =
        localStorage.getItem(localStorageVolumeStateKey) || VOLUME_DEFAULT;

      mediaPlayerStore.setState((state) => ({
        ...state,
        muted: false,
        volume: +volume,
      }));
    } else {
      mediaPlayerStore.setState((state) => ({
        ...state,
        muted: true,
        volume: 0,
      }));
    }

    this.updateVolumeMutedLocalStorage();
  }
}

export default new _playbackManager();
