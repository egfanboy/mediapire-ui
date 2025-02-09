import { ActionIcon, Group, Slider, Tooltip } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useMediaStore } from "../state-machine/use-media-store";
import { mediaPlayerStore } from "../state-machine/media-player-store";
import {
  IconVolume,
  IconVolumeOff,
  IconVolume2,
  IconVolume3,
} from "@tabler/icons-react";
import mediaPlayerEvents, {
  MediaPlayerEventType,
} from "../../../events/media-player/media-player.events";

const mediapireVolumeKey = "mediapire_media_volume";
const mediapireVolumeMutedKey = "mediapire_media_volume_muted";

export const VolumeControl = () => {
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [volumeIconHovered, setVolumeIconHovered] = useState(false);

  const sliderRef = useRef(null);

  const volume = useMediaStore((state) => state.volume);
  const muted = useMediaStore((state) => state.muted);

  const handleChangeEnd = (value: number) => {
    setDragging(false);

    mediaPlayerEvents.dispatchEvent({
      type: MediaPlayerEventType.VolumeChange,
      data: { volume: value, finalChange: true },
    });
  };

  const handleDrag = (v: number) => {
    setDragging(true);

    mediaPlayerEvents.dispatchEvent({
      type: MediaPlayerEventType.VolumeChange,
      data: { volume: v },
    });
  };

  const handleMute = () => {
    mediaPlayerEvents.dispatchEvent({
      type: MediaPlayerEventType.Mute,
    });
  };

  const getVolumeIcon = () => {
    if (muted) {
      return IconVolumeOff;
    }

    if (volume > 0.3) {
      return IconVolume;
    } else if (volume === 0) {
      return IconVolume3;
    } else {
      return IconVolume2;
    }
  };

  const isActive = dragging || hovered || volumeIconHovered;

  const VolumeIcon = getVolumeIcon();
  return (
    <Group spacing={10}>
      <Tooltip label={muted ? "Unmute" : "Mute"}>
        <ActionIcon
          size="xs"
          color={isActive ? "" : "gray.4"}
          onClick={handleMute}
        >
          <VolumeIcon
            onMouseEnter={() => setVolumeIconHovered(true)}
            onMouseLeave={() => setVolumeIconHovered(false)}
          ></VolumeIcon>
        </ActionIcon>
      </Tooltip>
      <Slider
        ref={sliderRef}
        color={isActive ? "" : "gray.4"}
        label={null}
        size="xs"
        min={0}
        step={0.01}
        max={1}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onChange={handleDrag}
        onChangeEnd={handleChangeEnd}
        onKeyDown={() => {
          // fixes an issue where if the user uses arrow keys to change the volume it is always in the hovered state
          setTimeout(() => setDragging(false), 100);
        }}
        value={volume}
        style={{ width: "100px" }}
        styles={() => ({
          bar: {
            opacity: volume === 0 ? 0 : 1,
          },
          thumb: {
            opacity: isActive ? 1 : 0,
          },
        })}
      ></Slider>
    </Group>
  );
};
