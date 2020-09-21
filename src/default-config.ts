import { PDCInternalConfig } from './types';

export const DefaultConfig: PDCInternalConfig = {
  title: null,
  solar: {
    _active: false,
    icon: 'mdi:solar-power',
    name: 'solar',
  },
  grid: {
    _active: false,
    icon: 'mdi:transmission-tower',
    name: 'grid',
  },
  battery: {
    _active: false,
    icon: 'mdi:battery-outline',
    name: 'battery',
  },
  home: {
    _active: false,
    icon: 'mdi:home-assistant',
    name: 'home',
  },
  autarky: {
    _active: false,
  },
  ratio: {
    _active: false,
  },
  autarky_calc: false,
  ratio_calc: false,
};

export default DefaultConfig;
