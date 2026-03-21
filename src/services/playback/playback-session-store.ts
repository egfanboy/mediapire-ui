import { mediaPlayerStore } from '@/components/media-player/state-machine/media-player-store';
import { PlaybackRepeatMode, PlaybackSessionState } from './playback';

export type PlaybackSessionStatus = 'idle' | 'loading' | 'active' | 'none' | 'error';

export interface PlaybackSessionStoreState {
  session: PlaybackSessionState | null;
  status: PlaybackSessionStatus;
}

const createStore = (initialState: PlaybackSessionStoreState) => {
  let state = initialState;
  const listeners = new Set<() => void>();

  const setState = (fn: (s: PlaybackSessionStoreState) => PlaybackSessionStoreState) => {
    state = fn(state);
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

const mapRepeatMode = (repeatMode: PlaybackRepeatMode): 'none' | 'one' | 'all' => {
  if (repeatMode === 'off') {
    return 'none';
  }

  return repeatMode;
};

export const playbackSessionStore = createStore({
  session: null,
  status: 'idle',
});

export const setPlaybackSessionLoading = () => {
  playbackSessionStore.setState((state) => ({
    ...state,
    status: 'loading',
  }));
};

export const setPlaybackSessionState = (session: PlaybackSessionState | null) => {
  playbackSessionStore.setState(() => ({
    session,
    status: session ? 'active' : 'none',
  }));

  mediaPlayerStore.setState((state) => ({
    ...state,
    currentTrack: session?.currentMedia || null,
    shuffling: session?.shuffleEnabled ?? state.shuffling,
    repeatMode: session ? mapRepeatMode(session.repeatMode) : state.repeatMode,
  }));
};

export const setPlaybackSessionError = () => {
  playbackSessionStore.setState((state) => ({
    ...state,
    status: 'error',
  }));
};
