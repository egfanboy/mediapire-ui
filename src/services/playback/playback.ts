import api from '@/api/api';

export type PlaybackQueueItem = {
  nodeId: string;
  mediaId: string;
};

export type PlaybackMediaItem = {
  nodeId: string;
  id: string;
  name: string;
  extension: string;
  metadata: any;
};

export type PlaybackRepeatMode = 'off' | 'one' | 'all';

export type PlaybackSessionState = {
  queue: PlaybackQueueItem[];
  playOrder: number[];
  currentPlayOrderIndex: number;
  currentItem?: PlaybackQueueItem;
  currentQueueIndex?: number;
  currentMedia?: PlaybackMediaItem;
  shuffleEnabled: boolean;
  repeatMode: PlaybackRepeatMode;
  updatedAt: string;
};

export type PlaybackCommand =
  | 'next'
  | 'previous'
  | 'play'
  | 'pause'
  | 'set_shuffle'
  | 'set_repeat';

export type PlaybackCommandPayloadMap = {
  next: Record<string, never>;
  previous: Record<string, never>;
  play: Record<string, never>;
  pause: Record<string, never>;
  set_shuffle: { enabled: boolean };
  set_repeat: { mode: PlaybackRepeatMode };
};

export type StartPlaybackSessionPayload = {
  mediaType?: string;
  filter?: string;
  sortBy?: string;
  nodeId?: string;
  shuffleEnabled?: boolean;
  repeatMode?: PlaybackRepeatMode;
};

interface PlaybackService {
  getSession(): Promise<PlaybackSessionState>;
  startSession(body?: StartPlaybackSessionPayload): Promise<PlaybackSessionState>;
  replaceQueue(queue: PlaybackQueueItem[], startIndex?: number): Promise<PlaybackSessionState>;
  submitCommand<T extends PlaybackCommand>(
    command?: T,
    payload?: PlaybackCommandPayloadMap[T]
  ): Promise<PlaybackSessionState>;
}

const baseSessionUrl = '/api/v1/playback/session';

const getSession = (): Promise<PlaybackSessionState> => {
  return api.get(baseSessionUrl).then((r) => r.json());
};

const startSession = (body: StartPlaybackSessionPayload = {}): Promise<PlaybackSessionState> => {
  return api.post(`${baseSessionUrl}/start`, { body }).then((r) => r.json());
};

const replaceQueue = (
  items: PlaybackQueueItem[],
  startIndex = 0
): Promise<PlaybackSessionState> => {
  return api.post(`${baseSessionUrl}/queue`, { body: { items, startIndex } }).then((r) => r.json());
};

const submitCommand = <T extends PlaybackCommand>(
  command: T = 'next' as T,
  payload?: PlaybackCommandPayloadMap[T]
): Promise<PlaybackSessionState> => {
  return api
    .post(`${baseSessionUrl}/commands`, {
      body: { command, payload: payload || {} },
    })
    .then((r) => r.json());
};

export const playbackService: PlaybackService = {
  getSession,
  startSession,
  replaceQueue,
  submitCommand,
};
