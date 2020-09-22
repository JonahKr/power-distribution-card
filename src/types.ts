export type PDCConfig = {
  type: string;
  title?: string;
} & {
  [key in AcceptedEntities]?: string | EntitySettings;
};

export type AcceptedEntities = typeof AcceptedEntitiesList[number];
export type AcceptedDataEntities = typeof AcceptedDataEntitiesList[number];
export type AcceptedCalcEntities = typeof AcceptedCalcEntitiesList[number];

export const AcceptedDataEntitiesList = ['solar', 'grid', 'battery', 'home'] as const;
export const AcceptedCalcEntitiesList = ['autarky', 'ratio'] as const;
export const AcceptedEntitiesList = [...AcceptedDataEntitiesList, ...AcceptedCalcEntitiesList] as const;

export interface EntitySettings {
  _active: boolean;
  entity?: string;
  icon?: string;
  invert_value?: boolean;
  invert_arrow?: boolean;
  name?: string;
}

//Because of different setup methods, this is necessary to merge all possible options
export type PDCInternalConfig = {
  title?: string | null;
} & {
  [key in AcceptedEntities]: EntitySettings;
};

export type ArrowStates = 'right' | 'left' | 'none';
