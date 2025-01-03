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
