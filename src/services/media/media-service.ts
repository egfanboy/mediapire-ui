import api from '../../api/api';

type GetMediaParams = {
  sortBy?: string;
  mediaType?: string;
  page: number;
  limit?: number;
  nodeId?: string;
};

export type UpdateMediaItem = {
  mediaId: string;
  nodeId: string;
  change: { [key: string]: any };
};

interface MediaService {
  getMedia(p: GetMediaParams): Promise<PaginatedResponse<MediaItemWithNodeId>>;
  getMediaByIds(mediaIds: string[]): Promise<MediaItemWithNodeId[]>;
  downloadMedia(body: DownloadMediaRequest): Promise<any>;
  getDownload(downloadId: string): Promise<any>;
  getDownloadContent(downloadId: string): Promise<any>;
  deleteMedia(body: MediaItemMapping[]): Promise<any>;
  streamMedia(mediaId: string, nodeId: string): Promise<any>;
  streamMediaStatic(mediaId: string, nodeId: string): string;
  getMediaArtStatic(mediaId: string, nodeId: string): string;
  updateMedia(changes: UpdateMediaItem[]): Promise<any>;
}

const baseMediaUrl = '/api/v1/media';

const getMedia = ({
  mediaType,
  page,
  limit,
  sortBy,
  nodeId,
}: GetMediaParams): Promise<PaginatedResponse<MediaItemWithNodeId>> => {
  let url = `${baseMediaUrl}?page=${page}`;

  if (limit) {
    url = `${url}&limit=${limit}`;
  }

  if (mediaType) {
    url = `${url}&mediaType=${mediaType}`;
  }

  if (sortBy) {
    url = `${url}&sortBy=${sortBy}`;
  }

  if (nodeId) {
    url = `${url}&nodeId=${nodeId}`;
  }

  return api.get(url).then((r) => r.json());
};

const getMediaByIds = (mediaIds: string[]): Promise<MediaItemWithNodeId[]> =>
  api.get(`${baseMediaUrl}?mediaIds=${mediaIds.join(',')}`).then((r) => r.json());

const downloadMedia = (body: DownloadMediaRequest): Promise<any> => {
  return api.post('/api/v1/media/download', { body }).then((r) => r.json());
};

const getDownloadContent = (downloadId: string): Promise<any> =>
  api.get(`/api/v1/transfers/${downloadId}/download`).then((r) => r.blob());

const getDownload = (downloadId: string): Promise<any> => {
  return api.get(`/api/v1/transfers/${downloadId}`).then((r) => r.json());
};

const deleteMedia = (body: MediaItemMapping[]) =>
  api.delete('/api/v1/media', { body }).then((r) => r.json());

const streamMedia = (mediaId: string, nodeId: string): Promise<any> =>
  api.get(`/api/v1/media/stream?mediaId=${mediaId}&nodeId=${nodeId}`).then((r) => r.blob());

const streamMediaStatic = (mediaId: string, nodeId: string): string =>
  api.buildUrl(`/api/v1/media/stream?mediaId=${mediaId}&nodeId=${nodeId}`);

const getMediaArtStatic = (mediaId: string, nodeId: string) =>
  api.buildUrl(`${baseMediaUrl}/${mediaId}/art?nodeId=${nodeId}`);

const updateMedia = (changes: UpdateMediaItem[]): Promise<any> => {
  const body = new FormData();

  body.append('data', JSON.stringify({ action: 'update', changes }));
  return api.post('/api/v1/changesets', { body }).then((r) => r.json());
};

export const mediaService: MediaService = {
  getMedia,
  getMediaByIds,
  downloadMedia,
  getDownload,
  getDownloadContent,
  deleteMedia,
  streamMedia,
  getMediaArtStatic,
  streamMediaStatic,
  updateMedia,
};
