// Partially from https://github.com/home-assistant/frontend/blob/dev/src/common/navigate.ts

import { fireEvent } from "./fire_event";
import { mainWindow } from "./get_main_window";


export interface NavigateOptions {
  replace?: boolean;
  data?: any;
}


export const navigate = (
  path: string,
  options?: NavigateOptions,
) => {
    const replace = options?.replace || false;

    if (replace) {
        history.replaceState(
        history.state?.root ? { root: true } : (options?.data ?? null),
        "",
        `${mainWindow.location.pathname}#${path}`
      );
    } else {
        history.pushState(null, "", path);
    }
    fireEvent(window, "location-changed", {
        replace
    });
};