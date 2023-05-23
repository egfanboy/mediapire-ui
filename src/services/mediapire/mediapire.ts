const localStorageKey = "mediapire-ui-manager";
interface MediapireService {
  getManagerConfig: () => MediapireManageConfig | null;
  saveManagerConfig: (config: MediapireManageConfig) => void;
  deleteManagerConfig: () => void;
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

export const mediapireService: MediapireService = {
  getManagerConfig,
  saveManagerConfig,
  deleteManagerConfig,
};
