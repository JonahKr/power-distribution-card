export type PDCConfig = {
  type?: string;
  title?: string;
  disable_animation?: boolean;
  entities?: EntitySettings[];
};

//TODO: enable top level entity settings

export interface EntitySettings {
  _active: boolean;
  bar_color?: string;
  entity?: string;
  icon?: string;
  invert_value?: boolean;
  invert_arrow?: boolean;
  name: string;
}

export type ArrowStates = 'right' | 'left' | 'none';
