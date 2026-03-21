import { useSyncExternalStore } from 'react';
import {
  PlaybackSessionStoreState,
  playbackSessionStore,
} from './playback-session-store';

export const usePlaybackSessionStore = <T>(selector: (s: PlaybackSessionStoreState) => T) =>
  useSyncExternalStore(playbackSessionStore.subscribe, () =>
    selector(playbackSessionStore.getSnapshot())
  );
