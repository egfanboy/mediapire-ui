import { useSyncExternalStore } from "react";
import { mediaStore, MediaState } from "./media-store";

export const useMediaStore = <T>(selector: (s: MediaState) => T) =>
  useSyncExternalStore(mediaStore.subscribe, () =>
    selector(mediaStore.getSnapshot())
  );
