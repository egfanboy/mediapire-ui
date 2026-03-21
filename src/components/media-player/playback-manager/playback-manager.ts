import {
  PlaybackQueueItem,
  PlaybackRepeatMode,
  playbackService,
} from '@/services/playback/playback';
import { setPlaybackSessionState } from '@/services/playback/playback-session-store';
import mediaPlayerEvents, {
  MediaPlayerEventType,
} from '../../../events/media-player/media-player.events';
import { mediaStore } from '../../../stores/media/media-store';
import { mediaPlayerStore } from '../state-machine/media-player-store';

// time tolerance in seconds when handling the previous media event
const PREVIOUS_TIME_TOLERANCE = 3;

// Localstorage defaults therefore represent a stringified version of their value
const VOLUME_DEFAULT = '0.75';
const MUTED_DEFAULT = 'false';

const localStoragePlaybackStateKey = 'mediapire_media_playback_state';
const localStorageVolumeStateKey = 'mediapire_playback_volume_state';
const localStorageVolumeMutedKey = 'mediapire_playback_volume_muted';
const PLAYBACK_DEFAULTS = '{"shuffling":false, "repeatMode": "none"}';

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

  getNextRepeatMode(): 'none' | 'all' | 'one' {
    const currentState = mediaPlayerStore.getSnapshot();
    const { repeatMode } = currentState;

    if (repeatMode === 'none') {
      return 'all';
    }

    if (repeatMode === 'all') {
      return 'one';
    }

    return 'none';
  }

  mapRepeatModeToApi(repeatMode: 'none' | 'all' | 'one'): PlaybackRepeatMode {
    if (repeatMode === 'none') {
      return 'off';
    }

    return repeatMode;
  }

  applyPlaybackSession = (session: Awaited<ReturnType<typeof playbackService.getSession>>) => {
    setPlaybackSessionState(session);
    this.updatePlaybackLocalStorage();
  };

  toggleRepeatMode() {
    const nextRepeatMode = this.getNextRepeatMode();

    void playbackService
      .submitCommand('set_repeat', {
        mode: this.mapRepeatModeToApi(nextRepeatMode),
      })
      .then((session) => {
        this.applyPlaybackSession(session);
      });
  }

  handleNext() {
    void playbackService.submitCommand('next').then((session) => {
      this.applyPlaybackSession(session);
    });
  }

  handlePrevious() {
    const currentState = mediaPlayerStore.getSnapshot();

    if (currentState.playbackTime < PREVIOUS_TIME_TOLERANCE) {
      void playbackService.submitCommand('previous').then((session) => {
        this.applyPlaybackSession(session);
      });
    } else {
      // keeping the same item, put the playback time to 0
      mediaPlayerStore.setState((state) => ({
        ...state,
        playbackTime: 0,
      }));
    }
  }

  handlePlay() {
    const currentState = mediaPlayerStore.getSnapshot();

    if (currentState.currentTrack) {
      mediaPlayerStore.setState((state) => ({
        ...state,
        paused: false,
      }));
    } else {
      const mediaState = mediaStore.getSnapshot();

      if (mediaState.playbackSource) {
        void playbackService
          .startSession({
            ...mediaState.playbackSource,
            shuffleEnabled: currentState.shuffling,
            repeatMode: this.mapRepeatModeToApi(currentState.repeatMode),
          })
          .then((session) => {
            this.applyPlaybackSession(session);

            if (session.currentMedia) {
              mediaPlayerStore.setState((state) => ({
                ...state,
                paused: false,
                playbackTime: 0,
              }));
            }
          });
      } else if (mediaState.media.length) {
        void this.setMedia({ media: mediaState.media, autoplay: true });
      }
    }
  }

  handlePause() {
    mediaPlayerStore.setState((state) => ({
      ...state,
      paused: true,
    }));
  }

  async setMedia(data?: { [key: string]: any }) {
    if (!data?.media?.length) {
      return;
    }

    const queue = data.media.reduce((acc: PlaybackQueueItem[], item: any) => {
      if (item?.id && item?.nodeId) {
        acc.push({ mediaId: item.id, nodeId: item.nodeId });
      }

      return acc;
    }, []);

    if (!queue.length) {
      return;
    }

    const session = await playbackService.replaceQueue(queue);

    this.applyPlaybackSession(session);

    if (data.autoplay && session.currentMedia) {
      mediaPlayerStore.setState((state) => ({
        ...state,
        paused: false,
        playbackTime: 0,
      }));
    }
  }

  toggleShuffle() {
    const currentState = mediaPlayerStore.getSnapshot();

    void playbackService
      .submitCommand('set_shuffle', {
        enabled: !currentState.shuffling,
      })
      .then((session) => {
        this.applyPlaybackSession(session);
      });
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
    localStorage.setItem(localStorageVolumeStateKey, JSON.stringify(currentState.volume));
  }

  updateVolumeMutedLocalStorage() {
    const currentState = mediaPlayerStore.getSnapshot();
    localStorage.setItem(localStorageVolumeMutedKey, JSON.stringify(currentState.muted));
  }

  readFromLocalStorage() {
    const playbackValue = JSON.parse(
      localStorage.getItem(localStoragePlaybackStateKey) || PLAYBACK_DEFAULTS
    );

    const mutedValue = localStorage.getItem(localStorageVolumeMutedKey) || MUTED_DEFAULT;

    const muted = mutedValue === 'true';

    const volumeValue = localStorage.getItem(localStorageVolumeStateKey) || VOLUME_DEFAULT;

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

    if (currentState.repeatMode === 'one') {
      mediaPlayerStore.setState((state) => ({
        ...state,
        playbackTime: 0,
        paused: false,
      }));

      return;
    }

    void playbackService.submitCommand('next').then((session) => {
      this.applyPlaybackSession(session);
    });
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
      const volume = localStorage.getItem(localStorageVolumeStateKey) || VOLUME_DEFAULT;

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
