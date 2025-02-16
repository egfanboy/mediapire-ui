import React, { useCallback, useEffect, useRef } from "react";

import { useMediaStore } from "../../state-machine/use-media-store";
import { mediaPlayerStore } from "../../state-machine/media-player-store";
import mediaPlayerEvents, {
  MediaPlayerEventType,
} from "../../../../events/media-player/media-player.events";
import { mediaService } from "../../../../services/media/media-service";

export const AudioControlElement = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playbackTime = useMediaStore((state) => state.playbackTime);

  const volume = useMediaStore((state) => state.volume);

  const currentTrack = useMediaStore((state) => state.currentTrack);
  const paused = useMediaStore((state) => state.paused);

  const handleSongTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      mediaPlayerStore.setState((state) => ({
        ...state,
        playbackTime: audioRef.current?.currentTime || 0,
      }));
    }
  }, [audioRef.current]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // only control the audio element if it has a src (it has been loaded)
    if (audioRef.current?.src) {
      if (audioRef.current.paused && !paused) {
        audioRef.current.play();
      }

      if (!audioRef.current.paused && paused) {
        audioRef.current.pause();
      }
    }
  }, [paused]);

  useEffect(() => {
    if (audioRef.current) {
      // Since the playback time is constantly updated only change it if it surpases some tolerance (ie: user changed it by dragging)
      if (Math.abs(playbackTime - audioRef.current.currentTime) > 0.5) {
        audioRef.current.currentTime = playbackTime;
      }
    }
  }, [playbackTime]);

  const handleSongEnd = useCallback(() => {
    if (audioRef.current) {
      mediaPlayerEvents.dispatchEvent({
        type: MediaPlayerEventType.PlaybackEnded,
      });
    }
  }, [audioRef.current]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleSongTimeUpdate);
      audioRef.current.addEventListener("ended", handleSongEnd);
      audioRef.current.controls = false;
    }
    return () => {
      audioRef.current?.removeEventListener("timeupdate", handleSongTimeUpdate);
      audioRef.current?.removeEventListener("ended", handleSongEnd);
    };
  }, [audioRef.current]);

  useEffect(() => {
    if (currentTrack?.id) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }

      if (audioRef.current) {
        audioRef.current.src = mediaService.streamMediaStatic(
          currentTrack.id,
          currentTrack.nodeId
        );
        audioRef.current.play();
        audioRef.current.currentTime = 0;
      }
    }
  }, [currentTrack?.id]);

  return <audio ref={audioRef}></audio>;
};
