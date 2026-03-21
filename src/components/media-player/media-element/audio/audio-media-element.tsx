import React, { useCallback, useEffect, useRef } from 'react';
import mediaPlayerEvents, {
  MediaPlayerEventType,
} from '../../../../events/media-player/media-player.events';
import { mediaService } from '../../../../services/media/media-service';
import { mediaPlayerStore } from '../../state-machine/media-player-store';
import { useMediaStore } from '../../state-machine/use-media-store';

export const AudioControlElement = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playbackTime = useMediaStore((state) => state.playbackTime);

  const volume = useMediaStore((state) => state.volume);

  const currentTrack = useMediaStore((state) => state.currentTrack);
  const paused = useMediaStore((state) => state.paused);

  const syncPausedState = useCallback((nextPaused: boolean) => {
    mediaPlayerStore.setState((state) => ({
      ...state,
      paused: nextPaused,
    }));
  }, []);

  const attemptPlay = useCallback(async () => {
    if (!audioRef.current?.src) {
      return;
    }

    try {
      await audioRef.current.play();
    } catch {
      syncPausedState(true);
    }
  }, [syncPausedState]);

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
        void attemptPlay();
      }

      if (!audioRef.current.paused && paused) {
        audioRef.current.pause();
      }
    }
  }, [attemptPlay, paused]);

  useEffect(() => {
    if (audioRef.current) {
      // Since the playback time is constantly updated only change it if it surpases some tolerance (ie: user changed it by dragging)
      if (Math.abs(playbackTime - audioRef.current.currentTime) > 0.5) {
        audioRef.current.currentTime = playbackTime;
      }

      if (playbackTime === 0 && !paused && audioRef.current.paused && audioRef.current.src) {
        void attemptPlay();
      }
    }
  }, [attemptPlay, paused, playbackTime]);

  const handleSongEnd = useCallback(() => {
    if (audioRef.current) {
      mediaPlayerEvents.dispatchEvent({
        type: MediaPlayerEventType.PlaybackEnded,
      });
    }
  }, [audioRef.current]);

  const handleNativePlay = useCallback(() => {
    syncPausedState(false);
  }, [syncPausedState]);

  const handleNativePause = useCallback(() => {
    if (audioRef.current && !audioRef.current.ended) {
      syncPausedState(true);
    }
  }, [syncPausedState]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleSongTimeUpdate);
      audioRef.current.addEventListener('ended', handleSongEnd);
      audioRef.current.addEventListener('play', handleNativePlay);
      audioRef.current.addEventListener('pause', handleNativePause);
      audioRef.current.controls = false;
    }
    return () => {
      audioRef.current?.removeEventListener('timeupdate', handleSongTimeUpdate);
      audioRef.current?.removeEventListener('ended', handleSongEnd);
      audioRef.current?.removeEventListener('play', handleNativePlay);
      audioRef.current?.removeEventListener('pause', handleNativePause);
    };
  }, [audioRef.current, handleNativePause, handleNativePlay]);

  useEffect(() => {
    if (currentTrack?.id) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }

      const load = async () => {
        if (audioRef.current) {
          // Need to get blob and create a dynamic URL since backend does not support ranging
          const audioBytes = await mediaService.streamMedia(currentTrack.id, currentTrack.nodeId);

          audioRef.current.src = URL.createObjectURL(audioBytes);
          audioRef.current.currentTime = 0;
          void attemptPlay();
        }
      };

      load();
    }
  }, [attemptPlay, currentTrack?.id]);

  return <audio ref={audioRef}></audio>;
};
