import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';
import { PresetType } from './presets';

export interface PDCConfig extends LovelaceCardConfig {
  title?: string;
  animation?: 'none' | 'flash' | 'slide';
  entities: EntitySettings[];
  center: center;
}

export interface EntitySettings extends presetFeatures {
  attribute?: string;
  arrow_color?: { bigger?: string; equal?: string; smaller?: string };
  calc_excluded?: boolean;
  consumer?: boolean;
  color_threshold?: number;
  decimals?: number;
  display_abs?: boolean;
  double_tap_action?: ActionConfig;
  entity?: string;
  hide_arrows?: boolean;
  icon?: string;
  icon_color?: { bigger?: string; equal?: string; smaller?: string };
  invert_value?: boolean;
  invert_arrow?: boolean;
  name?: string | undefined;
  preset?: PresetType;
  producer?: boolean;
  secondary_info_attribute?: string;
  secondary_info_entity?: string;
  secondary_info_replace_name?: boolean;
  tap_action?: ActionConfig;
  threshold?: number;
  unit_of_display?: string;
  unit_of_measurement?: string;
}

export interface center {
  type: 'none' | 'card' | 'bars';
  content?: LovelaceCardConfig | BarSettings[];
}

export interface presetFeatures {
  battery_percentage_entity?: string;
  grid_sell_entity?: string;
  grid_buy_entity?: string;
}
export interface BarSettings {
  bar_color?: string;
  bar_bg_color?: string;
  entity?: string;
  invert_value?: boolean;
  name?: string | undefined;
  preset?: 'autarky' | 'ratio' | '';
  tap_action?: ActionConfig;
  unit_of_measurement?: string;
  double_tap_action?: ActionConfig;
}

export type ArrowStates = 'right' | 'left' | 'none';

export interface Target extends EventTarget {
  checked?: boolean;
  configValue?: string;
  i?: number;
  value?: string | EntitySettings[] | BarSettings[] | { bigger: string; equal: string; smaller: string };
}

export interface CustomValueEvent<T> extends Event {
  target: Target;
  // currentTarget?: {
  //   i?: number;
  //   value?: string;
  // };
  detail?: {
    value?: T;
  };
}

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: HTMLInputElement['type'];
  config: ActionConfig;
}

export interface SubElementConfig {
  type: 'entity' | 'bars' | 'card';
  index?: number;
}

export interface HTMLElementValue extends HTMLElement {
  value: string;
}
declare global {
  interface Window {
    loadCardHelpers: () => Promise<void>;
    customCards: { type?: string; name?: string; description?: string; preview?: boolean }[];
    ResizeObserver: { new (callback: ResizeObserverCallback): ResizeObserver; prototype: ResizeObserver };
  }

  interface Element {
    offsetWidth: number;
  }
}

export interface HassCustomElement extends CustomElementConstructor {
  getConfigElement(): Promise<unknown>;
}
