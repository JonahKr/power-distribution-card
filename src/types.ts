import { PresetType } from './presets';

export type PDCConfig = {
  title?: string;
  disable_animation?: boolean;
  animation?: 'none' | 'flash' | 'slide';
  entities: { [key: string]: EntitySettings | BarSettings | string }[];
};

export type PDCConfigInternal = {
  title?: string;
  animation?: 'none' | 'flash' | 'slide';
  entities: EntitySettings[];

  autarky?: BarSettings;
  ratio?: BarSettings;
};

export interface EntitySettings {
  calc_excluded?: boolean;
  consumer?: boolean;
  decimals?: number;
  display_abs?: boolean;
  entity?: string;
  icon?: string;
  invert_value?: boolean;
  invert_arrow?: boolean;
  name: string | undefined;
  preset?: PresetType;
  producer?: boolean;
  unit_of_display?: string;
  unit_of_measurement?: string;
}

export const BarList = ['autarky', 'ratio'];
export interface BarSettings {
  bar_color?: string;
  entity?: string;
  invert_value?: boolean;
  name?: string | undefined;
}

export type ArrowStates = 'right' | 'left' | 'none';
