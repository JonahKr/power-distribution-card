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
  invert_value?: boolean;
  invert_arrow?: boolean;
  name?: string | undefined;
  preset?: PresetType;
  producer?: boolean;
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
  preset?: 'autarky' | 'ratio' | 'custom';
}

export type ArrowStates = 'right' | 'left' | 'none';

export interface CustomValueEvent {
  target?: {
    checked?: boolean;
    configValue?: string;
    index?: number;
    value?: string | EntitySettings[] | BarSettings[];
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
  }
}
