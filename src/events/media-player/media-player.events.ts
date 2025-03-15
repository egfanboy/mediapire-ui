export enum MediaPlayerEventType {
  Play,
  Pause,
  Next,
  Previous,
  ToggleShuffle,
  ToggleRepeatMode,
  SetMediaLibrary,
  PlaybackEnded,
  Mute,
  VolumeChange,
}

export type MediaPlayerEvent = {
  type: MediaPlayerEventType;
  data?: { [key: string]: any };
};

type eventListener = (data?: { [key: string]: any }) => void;

class _mediaPlayerEvents {
  eventListeners: { [key in MediaPlayerEventType]: Set<eventListener> } = {} as any;

  subscribe(type: MediaPlayerEventType, callback: eventListener) {
    if (this.eventListeners[type]) {
      this.eventListeners[type]?.add(callback);
    } else {
      this.eventListeners[type] = new Set<eventListener>([callback]);
    }
  }

  unsubscribe(type: MediaPlayerEventType, callback: eventListener) {
    this.eventListeners[type]?.delete(callback);
  }

  dispatchEvent(event: MediaPlayerEvent) {
    const eventSet = this.eventListeners[event.type];
    if (eventSet) {
      eventSet.forEach((listener) => listener(event.data));
    }
  }
}

export default new _mediaPlayerEvents();
