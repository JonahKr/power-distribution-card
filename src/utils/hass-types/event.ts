/**
 * Types are from the  original Homeassistant Repository:
 * https://github.com/home-assistant/frontend/blob/dev/src/common/dom/fire_event.ts
 */

declare global {
  interface HASSDomEvents {}
}

export type ValidHassDomEvent = keyof HASSDomEvents;

export interface HASSDomEvent<T> extends Event {
  detail: T;
}