import React from "react";

import { TimeControl } from "./time-control/time-control";
import { MediaElement } from "./media-element/media-element";
import { VolumeControl } from "./volume-control/volume-control";
import { MediaControls } from "./media-controls/media-controls";
import { Flex } from "@mantine/core";
import { MediaInformation } from "./media-information/media-information";

export const MediaPlayer = () => {
  return (
    <Flex
      direction="row"
      align="center"
      gap="lg"
      style={{
        height: "100%",
        boxSizing: "border-box",
        padding: "10px 20px",
      }}
    >
      <MediaInformation />
      <MediaElement />
      <MediaControls />
      <TimeControl></TimeControl>
      <VolumeControl></VolumeControl>
    </Flex>
  );
};
