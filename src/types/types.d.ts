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
    Album: string;
    Artist: string;
    Genre: string;
    Length: number;
    Title: string;
    TrackIndex: number;
    TrackOf: number;
  };
}

type DownloadMediaRequest = { nodeId: string; mediaId: string }[];
