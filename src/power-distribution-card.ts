import { LitElement, html, customElement, property, CSSResult, TemplateResult, PropertyValues } from 'lit-element';

import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';

import './editor';

import { PDCConfig, PDCInternalConfig, AcceptedEntitiesList } from './types';
import { styles } from './styles';

@customElement('power-distribution-card')
export class PowerDistributionCard extends LitElement {
  //TODO Write Card Editor
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('boilerplate-card-editor') as LovelaceCardEditor;
  }
  //TODO Write a stub config to enable the card type picker in Lovelace (return type Object -> needs interface)
  public static getStubConfig(): any {
    return {};
  }

  @property() public hass!: HomeAssistant;

  @property() private _config?: PDCInternalConfig;

  private _initial_setup_complete = false;

  static get styles(): CSSResult {
    return styles;
  }

  public setConfig(config: PDCConfig): void {
    const _config: PDCInternalConfig = {};
    if (!config) {
      throw new Error('No Configuration passed!');
    }

    for (const key in config) {
      //This is to enable a simpler setup method by allowing the entityid directly
      if (config[key] in AcceptedEntitiesList && typeof config[key] === 'string') {
        _config[key].entity = config[key];
        continue;
      }
      _config[key] = config[key];
    }
    this._config = _config;
  }
}
