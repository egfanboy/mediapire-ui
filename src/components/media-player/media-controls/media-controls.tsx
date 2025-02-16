import React from "react";
import styles from "./media-controls.module.css";
import { ActionIcon, Group, Tooltip, useMantineTheme } from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconArrowsShuffle,
  IconRepeat,
  IconRepeatOnce,
} from "@tabler/icons-react";
import { useMediaStore } from "../state-machine/use-media-store";

import mediaPlayerEvents, {
  MediaPlayerEventType,
} from "../../../events/media-player/media-player.events";

export const MediaControls = () => {
  const repeatMode = useMediaStore((state) => state.repeatMode);
  const shuffling = useMediaStore((state) => state.shuffling);
  const paused = useMediaStore((state) => state.paused);
  const currentTrack = useMediaStore((state) => state.currentTrack);

  const theme = useMantineTheme();

  const getRepeatIcon = () => {
    if (repeatMode === "one") {
      return IconRepeatOnce;
    }

    return IconRepeat;
  };

  const getRepeatModeTooltip = () => {
    if (repeatMode === "one") {
      return "No repeat";
    }

    if (repeatMode === "none") {
      return "Repeat all";
    }

    if (repeatMode === "all") {
      return "Repeat current";
    }
  };

  const shouldPlay = () => paused || currentTrack === null;

  const getMainActionButtonIcon = () => {
    if (shouldPlay()) {
      return IconPlayerPlayFilled;
    } else {
      return IconPlayerPauseFilled;
    }
  };

  const handleMainActionClick = () => {
    mediaPlayerEvents.dispatchEvent({
      type: shouldPlay()
        ? MediaPlayerEventType.Play
        : MediaPlayerEventType.Pause,
    });
  };

  const RepeatIcon = getRepeatIcon();
  const MainActionButtonIcon = getMainActionButtonIcon();

  const makeEventFunction = (type: MediaPlayerEventType) => () =>
    mediaPlayerEvents.dispatchEvent({
      type,
    });

  return (
    <Group>
      <Tooltip label={shuffling ? "Unshuffle" : "Shuffle"}>
        <ActionIcon
          size="sm"
          onClick={makeEventFunction(MediaPlayerEventType.ToggleShuffle)}
          color={shuffling ? "" : "gray.4"}
        >
          <IconArrowsShuffle></IconArrowsShuffle>
        </ActionIcon>
      </Tooltip>
      <ActionIcon
        color={theme.primaryColor}
        size="lg"
        onClick={() =>
          mediaPlayerEvents.dispatchEvent({
            type: MediaPlayerEventType.Previous,
          })
        }
      >
        <IconPlayerSkipBackFilled></IconPlayerSkipBackFilled>
      </ActionIcon>
      <ActionIcon
        className={styles["play-button"]}
        color={theme.primaryColor}
        variant="filled"
        size="xl"
        onClick={handleMainActionClick}
      >
        <MainActionButtonIcon></MainActionButtonIcon>
      </ActionIcon>

      <ActionIcon
        color={theme.primaryColor}
        size="lg"
        onClick={() =>
          mediaPlayerEvents.dispatchEvent({
            type: MediaPlayerEventType.Next,
          })
        }
      >
        <IconPlayerSkipForwardFilled></IconPlayerSkipForwardFilled>
      </ActionIcon>
      <Tooltip label={getRepeatModeTooltip()}>
        <ActionIcon
          size="sm"
          onClick={makeEventFunction(MediaPlayerEventType.ToggleRepeatMode)}
          color={repeatMode === "none" ? "gray.4" : ""}
        >
          <RepeatIcon></RepeatIcon>
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};
