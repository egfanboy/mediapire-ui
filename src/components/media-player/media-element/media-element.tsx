import React from "react";

import { AudioControlElement } from "./audio/audio-media-element";
import { useMediaStore } from "../state-machine/use-media-store";

export const MediaElement = React.memo(() => {
  const currentTrack = useMediaStore((state) => state.currentTrack);

  if (currentTrack?.extension === "mp3") {
    return <AudioControlElement />;
  }

  return null;
});
