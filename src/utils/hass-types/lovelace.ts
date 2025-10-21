import { HomeAssistant } from "./homeassistant";

export type Condition =
  | LocationCondition
  | NumericStateCondition
  | StateCondition
  | ScreenCondition
  | UserCondition
  | OrCondition
  | AndCondition
  | NotCondition;

// Legacy conditional card condition
export interface LegacyCondition {
  entity?: string;
  state?: string | string[];
  state_not?: string | string[];
}

interface BaseCondition {
  condition: string;
}

export interface LocationCondition extends BaseCondition {
  condition: "location";
  locations?: string[];
}

export interface NumericStateCondition extends BaseCondition {
  condition: "numeric_state";
  entity?: string;
  below?: string | number;
  above?: string | number;
}

export interface StateCondition extends BaseCondition {
  condition: "state";
  entity?: string;
  state?: string | string[];
  state_not?: string | string[];
}

export interface ScreenCondition extends BaseCondition {
  condition: "screen";
  media_query?: string;
}

export interface UserCondition extends BaseCondition {
  condition: "user";
  users?: string[];
}

export interface OrCondition extends BaseCondition {
  condition: "or";
  conditions?: Condition[];
}

export interface AndCondition extends BaseCondition {
  condition: "and";
  conditions?: Condition[];
}

export interface NotCondition extends BaseCondition {
  condition: "not";
  conditions?: Condition[];
}


export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  /** @deprecated Use `grid_options` instead */
  layout_options?: LovelaceLayoutOptions;
  grid_options?: LovelaceGridOptions;
  type: string;
  [key: string]: any;
  visibility?: Condition[];
}

export interface LovelaceLayoutOptions {
  grid_columns?: number | "full";
  grid_rows?: number | "auto";
  grid_max_columns?: number;
  grid_min_columns?: number;
  grid_min_rows?: number;
  grid_max_rows?: number;
}

export interface LovelaceGridOptions {
  columns?: number | "full";
  rows?: number | "auto";
  max_columns?: number;
  min_columns?: number;
  min_rows?: number;
  max_rows?: number;
  fixed_rows?: boolean;
  fixed_columns?: boolean;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  preview?: boolean;
  layout?: string;
  connectedWhileHidden?: boolean;
  getCardSize(): number | Promise<number>;
  /** @deprecated Use `getGridOptions` instead */
  getLayoutOptions?(): LovelaceLayoutOptions;
  getGridOptions?(): LovelaceGridOptions;
  setConfig(config: LovelaceCardConfig): void;
}
