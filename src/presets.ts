import { EntitySettings, PDCConfig } from './types';

export type PresetType = typeof PresetList[number];

export const PresetList = [
  'battery',
  'car_charger',
  'consumer',
  'grid',
  'home',
  'hydro',
  'pool',
  'producer',
  'solar',
  'wind',
  'heating',
  'placeholder',
] as const;

export const PresetObject: { [key: string]: EntitySettings } = {
  battery: {
    consumer: true,
    icon: 'mdi:battery-outline',
    name: 'battery',
    producer: true,
  },
  car_charger: {
    consumer: true,
    icon: 'mdi:car-electric',
    name: 'car',
  },
  consumer: {
    consumer: true,
    icon: 'mdi:lightbulb',
    name: 'consumer',
  },
  grid: {
    icon: 'mdi:transmission-tower',
    name: 'grid',
  },
  home: {
    consumer: true,
    icon: 'mdi:home-assistant',
    name: 'home',
  },
  hydro: {
    icon: 'mdi:hydro-power',
    name: 'hydro',
    producer: true,
  },
  pool: {
    consumer: true,
    icon: 'mdi:pool',
    name: 'pool',
  },
  producer: {
    icon: 'mdi:lightning-bolt-outline',
    name: 'producer',
    producer: true,
  },
  solar: {
    icon: 'mdi:solar-power',
    name: 'solar',
    producer: true,
  },
  wind: {
    icon: 'mdi:wind-turbine',
    name: 'wind',
    producer: true,
  },
  heating: {
    icon: 'mdi:radiator',
    name: 'heating',
    consumer: true,
  },
  placeholder: {
    name: 'placeholder',
  },
};

export const DefaultItem: EntitySettings = {
  decimals: 2,
  display_abs: true,
  name: '',
  unit_of_display: 'W',
};

export const DefaultConfig: PDCConfig = {
  type: '',
  title: undefined,
  animation: 'flash',
  entities: [],
  center: {
    type: 'none',
  },
};
