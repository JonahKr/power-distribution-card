/**
 * Types are from the  original Homeassistant Repository:
 * https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace/action_handler.ts
 */

import { HASSDomEvent } from "./event";

export interface ActionHandlerOptions {
  hasTap?: boolean;
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

export interface ActionHandlerDetail {
  action: "hold" | "tap" | "double_tap";
}

export type ActionHandlerEvent = HASSDomEvent<ActionHandlerDetail>;