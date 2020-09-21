import { PDCInternalConfig } from './types';

export const DefaultConfig: PDCInternalConfig = {
  solar: {
    _active: false,
    icon: 'mdi:solar-power',
  },
  grid: {
    _active: false,
    icon: 'mdi:transmission-tower',
  },
  battery: {
    _active: false,
    icon: 'mdi:battery-outline',
  },
  home: {
    _active: false,
    icon: 'mdi:home-assistant',
  },
};

export default DefaultConfig;
