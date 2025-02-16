export const debounce = (callback: Function, timeout: number = 500) => {
  let timeoutId: number | undefined = undefined;

  return (...args: any[]) => {
    timeoutId && window.clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, timeout);
  };
};
