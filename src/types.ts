import { PresetType } from './presets';

export type PDCConfig = {
  title?: string;
  disable_animation?: boolean;
  entities: { [key: string]: EntitySettings }[];
};

export type PDCConfigInternal = {
  title?: string;
  disable_animation?: boolean;
  entities: EntitySettings[];
};

//TODO: enable top level entity settings
export interface EntitySettings {
  bar_color?: string;
  calc_excluded?: boolean;
  consumer?: boolean;
  entity?: string;
  icon?: string;
  invert_value?: boolean;
  invert_arrow?: boolean;
  name: string | undefined;
  preset?: PresetType;
  producer?: boolean;
}

export type ArrowStates = 'right' | 'left' | 'none';
