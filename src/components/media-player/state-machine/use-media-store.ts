import { useSyncExternalStore } from 'react';
import { MediaPlayerState, mediaPlayerStore } from './media-player-store';

export const useMediaStore = <T>(selector: (s: MediaPlayerState) => T) =>
  useSyncExternalStore(mediaPlayerStore.subscribe, () => selector(mediaPlayerStore.getSnapshot()));
