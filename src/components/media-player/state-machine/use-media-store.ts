import { useSyncExternalStore } from "react";
import { mediaPlayerStore, MediaPlayerState } from "./media-player-store";

export const useMediaStore = <T>(selector: (s: MediaPlayerState) => T) =>
  useSyncExternalStore(mediaPlayerStore.subscribe, () =>
    selector(mediaPlayerStore.getSnapshot())
  );
