import { LitElement, customElement, property } from 'lit-element';
import { HomeAssistant } from 'custom-card-helpers';
import { PDCConfigInternal } from './types';

@customElement('power-distribution-card-editor')
export class PowerDistributionCardEditor extends LitElement {
  @property() public hass?: HomeAssistant;
  @property() private _config?: PDCConfigInternal;
}
