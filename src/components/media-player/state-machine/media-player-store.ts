export interface MediaPlayerState {
  volume: number;
  muted: boolean;
  paused: boolean;
  shuffling: boolean;
  repeatMode: "none" | "all" | "one";
  currentTrack: null | { [key: string]: any };
  playbackTime: number;
}

const createStore = (initialState: MediaPlayerState) => {
  let state = initialState;
  const listeners = new Set<() => void>();

  const setState = (fn: (s: MediaPlayerState) => MediaPlayerState) => {
    const newState = fn(state);

    state = newState;

    listeners.forEach((listener) => listener());
  };

  const getSnapshot = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    setState,
    getSnapshot,
    subscribe,
  };
};

export const mediaPlayerStore = createStore({
  volume: 0,
  muted: false,
  paused: false,
  shuffling: false,
  repeatMode: "none",
  currentTrack: null,
  playbackTime: 0,
});
