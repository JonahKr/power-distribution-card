export type PDCConfig = {
  type: string;
  title?: string;
} & {
  [key in AcceptedEntities]?: string | EntitySettings;
};

export type AcceptedEntities = typeof AcceptedEntitiesList[number];

export const AcceptedDataEntities = ['solar', 'grid', 'battery', 'home'] as const;
export const AcceptedCalcEntities = ['autarky', 'ratio'] as const;
export const AcceptedEntitiesList = [...AcceptedDataEntities, ...AcceptedCalcEntities] as const;

export interface EntitySettings {
  _active: boolean;
  entity?: string;
  icon?: string;
  inverted?: boolean;
}

//Because of different setup methods, this is necessary to merge all possible options
export type PDCInternalConfig = {
  title?: string;
} & {
  [key in AcceptedEntities]?: EntitySettings;
};
