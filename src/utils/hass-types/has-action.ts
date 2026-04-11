// From: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/has-action.ts
import { ActionConfig } from "./action";

export function hasAction(config?: ActionConfig): boolean {
  return config !== undefined && config.action !== "none";
}