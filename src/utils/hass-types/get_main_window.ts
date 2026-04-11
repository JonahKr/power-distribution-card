// From: https://github.com/home-assistant/frontend/blob/dev/src/data/main_window.ts
export const MAIN_WINDOW_NAME = "ha-main-window";

// From: https://github.com/home-assistant/frontend/blob/dev/src/common/dom/get_main_window.ts
export const mainWindow = (() => {
  try {
    return window.name === MAIN_WINDOW_NAME
      ? window
      : parent.name === MAIN_WINDOW_NAME
        ? parent
        : top!;
  } catch {
    return window;
  }
})();