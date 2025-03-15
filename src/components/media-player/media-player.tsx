import React from 'react';
import { Flex } from '@mantine/core';
import { MediaControls } from './media-controls/media-controls';
import { MediaElement } from './media-element/media-element';
import { MediaInformation } from './media-information/media-information';
import { TimeControl } from './time-control/time-control';
import { VolumeControl } from './volume-control/volume-control';

export const MediaPlayer = () => {
  return (
    <Flex
      direction="row"
      align="center"
      gap="lg"
      style={{
        height: '100%',
        boxSizing: 'border-box',
        padding: '10px 20px',
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
