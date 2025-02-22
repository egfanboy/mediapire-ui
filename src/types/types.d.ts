type MediapireManageConfig = {
  scheme: string;
  host: string;
  port: number;
};

interface MediaItem {
  name: string;
  id: string;
  extension: string;
  metadata: { [key: string]: any };
}

// look into removing a dependance on nodeId
interface MediaItemWithNodeId extends MediaItem {
  nodeId: string;
}

interface Mp3MediaItem extends MediaItemWithNodeId {
  metadata: {
    album: string;
    artist: string;
    genre: string;
    length: number;
    title: string;
    trackIndex: number;
    trackOf: number;
  };
}

type MediaItemMapping = { nodeId: string; mediaId: string };
type DownloadMediaRequest = MediaItemMapping[];

type MediaHostNode = {
  host: string;
  port: string;
  scheme: string;
  isUp: boolean;
  id: string;
  name?: string;
};

type CreateTransferRequest = {
  inputs: MediaItemMapping[];
  targetId?: string;
};

type Transfer = {
  id: string;
  status: string;
  failureReason?: string;
  targetId?: string;
  expiry: string;
};
