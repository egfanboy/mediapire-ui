import api from "../../api/api";

const localStorageKey = "mediapire-ui-manager";

type MediapireSettings = {
  fileTypes: string[];
};

interface MediapireService {
  getManagerConfig: () => MediapireManageConfig | null;
  saveManagerConfig: (config: MediapireManageConfig) => void;
  deleteManagerConfig: () => void;
  getSettings: () => Promise<MediapireSettings>;
}

const getManagerConfig = (): MediapireManageConfig | null => {
  const item = localStorage.getItem(localStorageKey);

  if (!item) {
    return null;
  }

  return JSON.parse(item);
};

const saveManagerConfig = (config: MediapireManageConfig): void =>
  localStorage.setItem(localStorageKey, JSON.stringify(config));

const deleteManagerConfig = (): void =>
  localStorage.removeItem(localStorageKey);

const getSettings = (): Promise<MediapireSettings> => {
  return api.get("/api/v1/settings").then((r) => r.json());
};

export const mediapireService: MediapireService = {
  getManagerConfig,
  saveManagerConfig,
  deleteManagerConfig,
  getSettings,
};
