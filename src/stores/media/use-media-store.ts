import { useSyncExternalStore } from 'react';
import { MediaState, mediaStore } from './media-store';

export const useMediaStore = <T>(selector: (s: MediaState) => T) =>
  useSyncExternalStore(mediaStore.subscribe, () => selector(mediaStore.getSnapshot()));
