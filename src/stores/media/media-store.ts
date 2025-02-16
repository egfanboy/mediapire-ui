export interface MediaState {
  media: MediaItemWithNodeId[];
}

const createStore = (initialState: MediaState) => {
  let state = initialState;
  const listeners = new Set<() => void>();

  const setState = (fn: (s: MediaState) => MediaState) => {
    const newState = fn(state);

    state = newState;

    listeners.forEach((listener) => listener());
  };

  const getSnapshot = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    setState,
    getSnapshot,
    subscribe,
  };
};

export const mediaStore = createStore({
  media: [],
});
