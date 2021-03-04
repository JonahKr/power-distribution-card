import { LovelaceCardConfig } from 'custom-card-helpers';
import { PresetType } from './presets';

export interface PDCConfig extends LovelaceCardConfig {
  title?: string;
  animation?: 'none' | 'flash' | 'slide';
  entities: EntitySettings[];
  center: center;
}

export interface EntitySettings {
  attribute?: string;
  calc_excluded?: boolean;
  consumer?: boolean;
  decimals?: number;
  display_abs?: boolean;
  entity?: string;
  icon?: string;
  icon_color?: { bigger: string; equal: string; smaller: string };
  invert_value?: boolean;
  invert_arrow?: boolean;
  name?: string | undefined;
  preset?: PresetType;
  producer?: boolean;
  hide_arrows?: boolean;
  secondary_info_entity?: string;
  secondary_info_attribute?: string;
  unit_of_display?: string;
  unit_of_measurement?: string;
}

export interface center {
  type: 'none' | 'card' | 'bars';
  content?: LovelaceCardConfig | BarSettings[];
}
export interface BarSettings {
  bar_color?: string;
  bar_bg_color?: string;
  entity?: string;
  invert_value?: boolean;
  name?: string | undefined;
  preset?: 'autarky' | 'ratio' | '';
}

export type ArrowStates = 'right' | 'left' | 'none';

export interface CustomValueEvent {
  target?: {
    checked?: boolean;
    configValue?: string;
    index?: number;
    value?: string | EntitySettings[] | BarSettings[] | { bigger: string; equal: string; smaller: string };
  };
  currentTarget?: {
    index?: number;
    value?: string;
  };
}

export interface SubElementConfig {
  type: 'entity' | 'bars' | 'card';
  index?: number;
  element?: EntitySettings | LovelaceCardConfig | BarSettings[];
}

export interface HTMLElementValue extends HTMLElement {
  value: string;
}
declare global {
  interface Window {
    loadCardHelpers: () => void;
    customCards: { type?: string; name?: string; description?: string; preview?: boolean }[];
    ResizeObserver: { new (callback: ResizeObserverCallback): ResizeObserver; prototype: ResizeObserver };
  }

  interface Element {
    offsetWidth: number;
  }
}
