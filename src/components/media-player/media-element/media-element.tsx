import React from 'react';
import { useMediaStore } from '../state-machine/use-media-store';
import { AudioControlElement } from './audio/audio-media-element';

export const MediaElement = React.memo(() => {
  const currentTrack = useMediaStore((state) => state.currentTrack);

  if (currentTrack?.extension === 'mp3') {
    return <AudioControlElement />;
  }

  return null;
});
