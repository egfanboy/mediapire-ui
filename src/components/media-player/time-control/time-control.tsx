import React, { useState } from "react";

import { Group, Slider, Text, rem } from "@mantine/core";
import { useMediaStore } from "../state-machine/use-media-store";
import { mediaPlayerStore } from "../state-machine/media-player-store";

export function TimeControl() {
  const [dragValue, setDragValue] = useState<null | number>(null);
  const [hovered, setHovered] = useState(false);

  const currentTrack = useMediaStore((state) => state.currentTrack);
  const playbackTime = useMediaStore((state) => state.playbackTime);

  const handleChangeEnd = (value: number) => {
    setDragValue(null);

    mediaPlayerStore.setState((state) => ({ ...state, playbackTime: value }));
  };

  const isActive = dragValue !== null || hovered;

  const formatTime = (duration: number): string => {
    const timeInMinutes = Math.floor(duration / 60);

    const seconds = `${Math.floor(duration % 60)}`;

    return `${timeInMinutes}:${seconds.padStart(2, "0")}`;
  };

  const value = dragValue !== null ? dragValue : playbackTime;
  return (
    <Group style={{ flex: 1 }}>
      <Text style={{ width: rem(75) }} fz="sm" c="dimmed">
        {/* take the min between the current time and the length in case the time surpases the total time with rounding */}
        {formatTime(Math.min(value, currentTrack?.metadata?.length || 0))} /{" "}
        {formatTime(currentTrack?.metadata?.length || 0)}
      </Text>

      <Slider
        style={{ flex: 1 }}
        color={isActive ? "" : "gray.4"}
        label={null}
        size="xs"
        min={0}
        max={currentTrack?.metadata?.length || 0}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onChange={(v) => setDragValue(v)}
        onChangeEnd={handleChangeEnd}
        value={value}
        styles={() => ({
          // need to do this since when it is 0 this component still shows a small bar as progress
          bar: {
            opacity: value === 0 ? 0 : 1,
          },
          thumb: {
            opacity: isActive ? 1 : 0,
          },
        })}
      ></Slider>
    </Group>
  );
}
