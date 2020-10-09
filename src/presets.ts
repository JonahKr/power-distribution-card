import { EntitySettings } from './types';

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
};
