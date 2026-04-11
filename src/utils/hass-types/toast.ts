import { fireEvent } from "./fire_event";

declare global {
  // for fire event
  interface HASSDomEvents {
    "hass-notification": ShowToastParams;
  }
}

export interface ShowToastParams {
  // Unique ID for the toast. If a new toast is shown with the same ID as the previous toast, it will be replaced to avoid flickering.
  id?: string;
  message:
    | string
    | { translationKey: string; args?: Record<string, string> };
  action?: ToastActionParams;
  duration?: number;
  dismissable?: boolean;
}

export interface ToastActionParams {
  action: () => void;
  text:
    | string
    | { translationKey: string; args?: Record<string, string> };
}

export const showToast = (el: HTMLElement, params: ShowToastParams) =>
  fireEvent(el, "hass-notification", params);