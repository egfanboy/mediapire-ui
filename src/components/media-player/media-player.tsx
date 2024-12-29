import React from "react";

import { TimeControl } from "./time-control/time-control";
import { MediaElement } from "./media-element/media-element";
import { VolumeControl } from "./volume-control/volume-control";
import { MediaControls } from "./media-controls/media-controls";
import { Group } from "@mantine/core";

export const MediaPlayer = () => {
  return (
    <Group
      style={{
        padding: "10px 20px",
      }}
    >
      <MediaElement />
      <MediaControls />
      <TimeControl></TimeControl>
      <VolumeControl></VolumeControl>
    </Group>
  );
};
