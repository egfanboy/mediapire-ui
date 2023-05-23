import api from "../../api/api";

interface MediaService {
  getMedia(): Promise<any[]>;
  downloadMedia(body: DownloadMediaRequest): Promise<any>;
}

type GetMediaResponse = { [key: string]: MediaItem[] };

const getMedia = (): Promise<any[]> => {
  return (
    api
      .get("/api/v1/media")
      .then((r) => r.json())
      // flatten media to a list
      .then((media: GetMediaResponse): MediaItemWithNodeId[] => {
        return Object.keys(media).reduce(
          (acc: MediaItemWithNodeId[], key: string) => {
            const itemsForKey = media[key];

            acc = [
              ...acc,
              ...itemsForKey.map((item) => ({ ...item, nodeId: key })),
            ];

            return acc;
          },
          []
        );
      })
  );
};

const downloadMedia = (body: DownloadMediaRequest): Promise<any> => {
  return api.post("/api/v1/media/download", { body }).then((r) => r.blob());
};

export const mediaService: MediaService = {
  getMedia,
  downloadMedia,
};
