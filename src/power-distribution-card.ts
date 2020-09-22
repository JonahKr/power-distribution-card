import { LitElement, html, customElement, property, CSSResult, TemplateResult } from 'lit-element';

import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';

import './editor';

import { PDCConfig, PDCInternalConfig, EntitySettings, ArrowStates } from './types';
import styles from './styles';
import DefaultConfig from './default-config';

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

  private _config!: PDCInternalConfig;

  private _initial_setup_complete = false;

  static get styles(): CSSResult {
    return styles;
  }
  //TODO: Allow custom consumers/producers
  public setConfig(config: PDCConfig): void {
    if (!config) {
      throw new Error('No Configuration passed!');
    }

    const _config: PDCInternalConfig = DefaultConfig;

    for (const key in config) {
      //TODO: To ensure the simple Setup with the Planned Expansion Feature, All Settings need to be typesafed
      if (key === 'title' || key === 'type') {
        _config[key] = config[key];
        continue;
      }
      //This is to enable the simpler setup method to pass the entityid directly instead of further details
      if (typeof config[key] === 'string') {
        _config[key].entity = config[key];
        _config[key]._active = true;
        continue;
      }
      //The Advanced Setup method
      if (typeof config[key].entity === 'string') {
        for (const setting in config[key]) {
          _config[key][setting] = config[key][setting];
        }
        _config[key]._active = config[key]._active ? config[key]._active : true;
      }
    }
    //TODO:Now we need to check if a calculation of autarky and/or ratio is possible

    this._config = _config;
  }

  get solar_val(): number {
    const inv = this._config.solar.invert_value ? -1 : 1;
    return this._config.solar._active && this._config.solar.entity
      ? Number(this.hass.states[this._config.solar.entity].state) * inv
      : 0;
  }
  get grid_val(): number {
    const inv = this._config.grid.invert_value ? -1 : 1;
    return this._config.grid._active && this._config.grid.entity
      ? Number(this.hass.states[this._config.grid.entity].state) * inv
      : 0;
  }
  get battery_val(): number {
    const inv = this._config.battery.invert_value ? -1 : 1;
    return this._config.battery._active && this._config.battery.entity
      ? Number(this.hass.states[this._config.battery.entity].state) * inv
      : 0;
  }
  get home_val(): number {
    const inv = this._config.home.invert_value ? -1 : 1;
    return this._config.home._active && this._config.home.entity
      ? Number(this.hass.states[this._config.home.entity].state) * inv
      : 0;
  }
  //General Value-Function  TODO: Generalize Value functions
  private val(name: string): number {
    const inv = this._config[name].invert_value ? -1 : 1;
    return this._config[name]._active && this._config[name].entity
      ? Number(this.hass.states[this._config[name].entity].state) * inv
      : 0;
  }
  //For the following two we need to differentiate because the values can be calculated aswell as passed from a sensor
  get autarky_val(): number {
    const inv = this._config.solar?.invert_value ? -1 : 1;
    if (this._config.autarky._active) {
      if (this._config.autarky.entity) {
        return Number(this.hass.states[this._config.autarky.entity].state) * inv;
      }
      return this._calculate_autarky() * 100;
    }
    return 0;
  }
  get ratio_val(): number {
    const inv = this._config.solar?.invert_value ? -1 : 1;
    if (this._config.ratio._active) {
      if (this._config.ratio.entity) {
        return Number(this.hass.states[this._config.ratio.entity].state) * inv;
      }
      return this._calculate_ratio() * 100;
    }
    return 0;
  }

  protected render(): TemplateResult {
    return html`
      <ha-card .header=${this._config.title}>
        <div class="card-content">
          <div class="grid-container">
            <div class="grid-header">custom header 123</div>
            ${this._render_bars()}
            ${this._config.solar._active ? this._render_item(this.solar_val, this._config.solar) : null}
            ${this._config.grid._active ? this._render_item(this.grid_val, this._config.grid) : null}
            ${this._config.battery._active ? this._render_item(this.battery_val, this._config.battery) : null}
            ${this._config.home._active ? this._render_item(this.home_val, this._config.home) : null}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _calculate_autarky(): number {
    //Formula: Autarky in % = Total Consumption / Production *100
    const consumption = (this.battery_val > 0 ? this.battery_val : 0) + this.home_val;
    const production = (this.battery_val < 0 ? Math.abs(this.battery_val) : 0) + this.solar_val;
    const autarky = production != 0 ? consumption / production : 0;
    //Because of very little power is consumed from/feeded into the grid, we need to adjust the 1% range
    return autarky >= 0.005 ? Math.min(+autarky.toFixed(2), 1) : autarky == 0 ? 0 : 0.01;
  }

  private _calculate_ratio(): number {
    //Formula: Autarky in % = Total Consumption / total usage *100
    const consumption = (this.battery_val > 0 ? this.battery_val : 0) + this.home_val;
    const total_usage = consumption + (this.grid_val < 0 ? Math.abs(this.grid_val) : 0);
    const ratio = total_usage != 0 ? consumption / total_usage : 0;
    return ratio >= 0.005 ? Math.min(+ratio.toFixed(2), 1) : ratio == 0 ? 0 : 0.01;
  }
  /**
   * Render Support Functions
   */

  _render_bars(): TemplateResult {
    const autarky = this.autarky_val;
    const ratio = this.ratio_val;

    return html`
      <div class="overview">
        <div class="bar-container">
          <div class="ratio-bar">
            <p id="ratio-percentage">${ratio}%</p>
            <div class="bar-wrapper">
              <bar style="height:${ratio}%; background-color:#555;" />
            </div>
            <p id="ratio">ratio</p>
          </div>
          <div class="autarky-bar">
            <p id="autarky-percentage">${autarky}%</p>
            <div class="bar-wrapper">
              <bar style="height:${autarky}%; background-color:#555;" />
            </div>
            <p id="autarky">autarky</p>
          </div>
        </div>
      </div>
    `;
  }

  _render_item(state: number, item: EntitySettings): TemplateResult {
    const name = item.name ? item.name : '';
    state *= item.invert_arrow ? -1 : 1;
    return html`
      <item id="${name}">
        <badge>
          <icon>
            <ha-icon icon="${item.icon}"></ha-icon>
          </icon>
          <p class="subtitle">${name}</p>
        </badge>
        <value>
          <p>${Math.abs(state)} W</p>
          ${
            state < 0
              ? this._render_arrow('left')
              : state == 0
              ? this._render_arrow('none')
              : this._render_arrow('right')
          }
        <value
      </item>
    `;
  }

  //This generates Animated Arrows depending on the state
  //0 is 0; 1 equals right; 2 equals left
  _render_arrow(direction: ArrowStates): TemplateResult {
    switch (direction) {
      case 'none': //Equals no Arrows at all
        return html` <div class="blank"></div> `;
      case 'right': //Right Moving Arrows
        return html`
          <div class="arrow">
            <div class="triangle-right animated" id="arrow_1"></div>
            <div class="triangle-right animated" id="arrow_2"></div>
            <div class="triangle-right animated" id="arrow_3"></div>
          </div>
        `;
      case 'left': //Left moving Arrows
        return html`
          <div class="arrow">
            <div class="triangle-left animated" id="arrow_3"></div>
            <div class="triangle-left animated" id="arrow_2"></div>
            <div class="triangle-left animated" id="arrow_1"></div>
          </div>
        `;
    }
  }
}
