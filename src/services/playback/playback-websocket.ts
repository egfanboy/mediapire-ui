import api from '@/api/api';
import { PlaybackSessionState } from './playback';

type PlaybackSessionUpdatedMessage = {
  type: 'playback.session.updated';
  state?: PlaybackSessionState;
};

type PlaybackWebsocketMessage = PlaybackSessionUpdatedMessage | { type: string; [key: string]: any };

interface ConnectPlaybackWebsocketOptions {
  onSessionUpdated: (state?: PlaybackSessionState) => void;
  onReconnect?: () => void;
}

interface PlaybackWebsocketService {
  connect(options: ConnectPlaybackWebsocketOptions): () => void;
}

const RECONNECT_DELAY_MS = 1000;

const parseMessage = (payload: string): PlaybackWebsocketMessage | null => {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

const connect = ({ onSessionUpdated, onReconnect }: ConnectPlaybackWebsocketOptions) => {
  let socket: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let reconnectCount = 0;
  let closedByClient = false;

  const clearReconnectTimeout = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  const scheduleReconnect = () => {
    if (closedByClient || reconnectTimeout) {
      return;
    }

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      openSocket();
    }, RECONNECT_DELAY_MS);
  };

  const openSocket = () => {
    const isReconnect = reconnectCount > 0;

    socket = new WebSocket(api.buildUrl('/ws'));

    socket.onopen = () => {
      clearReconnectTimeout();
      reconnectCount += 1;

      if (isReconnect) {
        onReconnect?.();
      }
    };

    socket.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        return;
      }

      const message = parseMessage(event.data);

      if (!message) {
        return;
      }

      if (message.type === 'playback.session.updated') {
        onSessionUpdated(message.state);
      }
    };

    socket.onerror = () => {
      socket?.close();
    };

    socket.onclose = () => {
      socket = null;
      scheduleReconnect();
    };
  };

  openSocket();

  return () => {
    closedByClient = true;
    clearReconnectTimeout();
    socket?.close();
  };
};

export const playbackWebsocketService: PlaybackWebsocketService = {
  connect,
};
