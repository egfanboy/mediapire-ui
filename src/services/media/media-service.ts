import api from "../../api/api";

interface MediaService {
  getMedia(): Promise<any[]>;
  downloadMedia(body: DownloadMediaRequest): Promise<any>;
  getDownload(downloadId: string): Promise<any>;
  getDownloadContent(downloadId: string): Promise<any>;
  deleteMedia(body: MediaItemMapping[]): Promise<any>;
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
  return api.post("/api/v1/media/download", { body }).then((r) => r.json());
};

const getDownloadContent = (downloadId: string): Promise<any> =>
  api.get(`/api/v1/transfers/${downloadId}/download`).then((r) => r.blob());

const getDownload = (downloadId: string): Promise<any> => {
  return api.get(`/api/v1/transfers/${downloadId}`).then((r) => r.json());
};

const deleteMedia = (body: MediaItemMapping[]) =>
  api.delete("/api/v1/media", { body }).then((r) => r.json());

export const mediaService: MediaService = {
  getMedia,
  downloadMedia,
  getDownload,
  getDownloadContent,
  deleteMedia,
};
