import { LitElement, html, customElement, property, CSSResult, TemplateResult } from 'lit-element';

import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';

import { version } from '../package.json';

import './editor';

import { PDCConfig, EntitySettings, ArrowStates } from './types';
import styles from './styles';

console.info(
  `%c POWER-DISTRIBUTION-CARD %c ${version} `,
  `font-weight: 500; color: white; background: #03a9f4;`,
  `font-weight: 500; color: #03a9f4; background: white;`,
);

@customElement('power-distribution-card')
export class PowerDistributionCard extends LitElement {
  //TODO Write Card Editor
  private static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('boilerplate-card-editor') as LovelaceCardEditor;
  }
  //TODO Write a stub config to enable the card type picker in Lovelace (return type Object -> needs interface)
  private static getStubConfig(): Record<string, unknown> {
    return {};
  }

  @property() public hass!: HomeAssistant;

  private _config!: PDCConfig;

  static get styles(): CSSResult {
    return styles;
  }

  public setConfig(config: PDCConfig): void {
    //TODO warn if the same sensor has been configured twice
    const _config: PDCConfig = { entities: [] };

    _config.title = config.title ? config.title : undefined;
    _config.disable_animation = config.disable_animation ? config.disable_animation : false;

    _config.entities = [];
    config.entities.forEach((item) => {
      const _item: EntitySettings = { name: '' };
      Object.assign(_item, item);

      _item.name ? undefined : (_item.name = '');

      _item._active = item.entity ? true : false;
      _item._active ? _config.entities.push(_item) : undefined;
    });

    this._config = _config;
  }

  private _val(item: EntitySettings): number {
    const inv = item.invert_value ? -1 : 1;
    return item.entity ? Number(this.hass.states[item.entity].state) * inv : 0;
  }

  protected render(): TemplateResult {
    const valueList = this._config.entities.map((item) => this._val(item));
    return html`
      <ha-card .header=${this._config.title}>
        <div class="card-content">
          <div class="grid-container">
            <div class="grid-header">custom header 123</div>
            ${this._render_bars(valueList)}
            ${this._config.entities?.map((item, index) => html`${this._render_item(valueList[index], item, index)}`)}
          </div>
        </div>
      </ha-card>
    `;
  }
  /*
  private _calculate_autarky(): number {
    //Formula: Autarky in % = Total Consumption / Production *100
    const consumption =
      (this.battery_val < 0 ? Math.abs(this.battery_val) : 0) + (this.home_val < 0 ? Math.abs(this.home_val) : 0);
    const production = (this.battery_val > 0 ? this.battery_val : 0) + (this.solar_val > 0 ? this.solar_val : 0);
    const autarky = production != 0 ? consumption / production : 0;
    //Because of very little power is consumed from/feeded into the grid, we need to adjust the 1% range
    return autarky >= 0.005 ? Math.min(+autarky.toFixed(2), 1) : autarky == 0 ? 0 : 0.01;
  }

  private _calculate_ratio(): number {
    //Formula: Autarky in % = Total Consumption / total usage *100
    const consumption =
      (this.battery_val < 0 ? Math.abs(this.battery_val) : 0) + (this.home_val < 0 ? Math.abs(this.home_val) : 0);
    const total_usage = consumption + (this.grid_val < 0 ? Math.abs(this.grid_val) : 0);
    const ratio = total_usage != 0 ? consumption / total_usage : 0;
    return ratio >= 0.005 ? Math.min(+ratio.toFixed(2), 1) : ratio == 0 ? 0 : 0.01;
  }
  */
  /**
   * Render Support Functions
   */

  _render_bars(valueList: number[]): TemplateResult {
    let production = 0;
    let consumption = 0;
    console.log(valueList);

    for (const item of valueList) {
      if (item > 0) {
        production += item;
      } else {
        //FIXME  plus minus addition !
        consumption -= item;
      }
    }
    console.log(production);
    console.log(consumption);
    //TODO fix Calculations
    const ratio = 1;
    const autarky = Math.min(+(consumption / production).toFixed(2), 2);
    console.log(autarky);

    return html`
      <div class="bar-container">
        <div class="ratio-bar">
          <p id="ratio-percentage">${ratio}%</p>
          <div class="bar-wrapper">
            <bar
              style="height:${ratio}%; background-color:${false //this._config.ratio.bar_color
                ? undefined //this._config.ratio.bar_color
                : 'var(--dark-color)'};"
            />
          </div>
          <p id="ratio">ratio</p>
        </div>
        <div class="autarky-bar">
          <p id="autarky-percentage">${autarky}%</p>
          <div class="bar-wrapper">
            <bar
              style="height:${autarky}%; background-color:${false //this._config.autarky.bar_color
                ? undefined //this._config.autarky.bar_color
                : 'var(--dark-color)'};"
            />
          </div>
          <p id="autarky">autarky</p>
        </div>
      </div>
    `;
  }

  private _moreInfo(ev: CustomEvent): void {
    fireEvent(this, 'hass-more-info', {
      entityId: (ev.currentTarget as any).entity,
    });
  }

  _render_item(state: number, item: EntitySettings, index: number): TemplateResult {
    state *= item.invert_arrow ? -1 : 1;

    return html`
      <item id="${item.name}" class="pointer" .entity=${item.entity} @click="${this._moreInfo}">
        <badge>
          <icon>
            <ha-icon data-state="${state == 0 ? 'unavaiable' : 'on'}" icon="${item.icon}"></ha-icon>
          </icon>
          <p class="subtitle">${item.name}</p>
        </badge>
        <value>
          <p>${Math.floor(Math.abs(state))} W</p>
          ${this._render_arrow(
            //I am so sorry... but you have to admit it's beautifull
            //Jokes aside: This takes the side the item is on (index even = left) into account for the arrows
            state == 0 ? 'none' : index % 2 == 0 ? (state > 0 ? 'right' : 'left') : state > 0 ? 'left' : 'right',
          )}
        <value
      </item>
    `;
  }

  //This generates Animated Arrows depending on the state
  //0 is 0; 1 equals right; 2 equals left
  _render_arrow(direction: ArrowStates): TemplateResult {
    const a = this._config.disable_animation;
    switch (direction) {
      case 'none': //Equals no Arrows at all
        return html` <div class="blank"></div> `;
      case 'right': //Right Moving Arrows
        return html`
          <div class="arrow">
            <div class="triangle-right ${a ? null : 'animated'}" id="arrow_1"></div>
            <div class="triangle-right ${a ? null : 'animated'}" id="arrow_2"></div>
            <div class="triangle-right ${a ? null : 'animated'}" id="arrow_3"></div>
          </div>
        `;
      case 'left': //Left moving Arrows
        return html`
          <div class="arrow">
            <div class="triangle-left ${a ? null : 'animated'}" id="arrow_3"></div>
            <div class="triangle-left ${a ? null : 'animated'}" id="arrow_2"></div>
            <div class="triangle-left ${a ? null : 'animated'}" id="arrow_1"></div>
          </div>
        `;
    }
  }
}
