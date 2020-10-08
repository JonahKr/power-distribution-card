import { LitElement, html, customElement, property, CSSResult, TemplateResult } from 'lit-element';

import { HomeAssistant, fireEvent } from 'custom-card-helpers';

import { version } from '../package.json';

import { PDCConfig, PDCConfigInternal, EntitySettings, ArrowStates, BarList, BarSettings } from './types';
import { PresetList, PresetObject, PresetType } from './presets';
import styles from './styles';

console.info(
  `%c POWER-DISTRIBUTION-CARD %c ${version} `,
  `font-weight: 500; color: white; background: #03a9f4;`,
  `font-weight: 500; color: #03a9f4; background: white;`,
);

@customElement('power-distribution-card')
export class PowerDistributionCard extends LitElement {
  //TODO Write Card Editor
  /*
  private static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('boilerplate-card-editor') as LovelaceCardEditor;
  }
  */
  //TODO Write a stub config to enable the card type picker in Lovelace (return type Object -> needs interface)
  private static getStubConfig(): Record<string, unknown> {
    return {};
  }

  @property() public hass!: HomeAssistant;

  private _config!: PDCConfigInternal;

  private _configFinished!: boolean;

  static get styles(): CSSResult {
    return styles;
  }

  public setConfig(config: PDCConfig): void {
    //TODO warn if the same sensor has been configured twice
    const _config: PDCConfigInternal = { entities: [] };

    _config.title = config.title || undefined;
    _config.disable_animation = config.disable_animation || false;

    config.entities.forEach((item) => {
      // eslint-disable-next-line prefer-const
      for (let [preset, settings] of Object.entries(item)) {
        //TODO Warnings would be apropriate here
        if (!PresetList.includes(<PresetType>preset)) {
          if (BarList.includes(preset)) {
            typeof settings === 'string'
              ? (_config[preset] = { entity: settings })
              : (_config[preset] = <BarSettings>settings);
          }
          continue;
        }
        if (typeof settings === 'string') settings = { entity: settings } as EntitySettings;
        if (!settings.entity) continue;

        const _item: EntitySettings = Object.assign({}, PresetObject[preset], settings);

        _item.preset = <PresetType>preset;
        _item.display_abs == false ? undefined : (_item.display_abs = true);

        _config.entities.push(_item);
      }
    });
    this._config = _config;
  }

  public updated(): void {
    if (this._configFinished) return;

    this._config.entities.forEach((item, index) => {
      if (!item.entity) return;
      //unit-of-measurement Configuration
      !item.unit_of_measurement
        ? (this._config.entities[index].unit_of_measurement =
            this.hass.states[item.entity].attributes.unit_of_measurement || 'W')
        : undefined;
      !item.unit_of_display ? (this._config.entities[index].unit_of_measurement = 'W') : undefined;
    });
    this._configFinished = true;
  }

  private _val(item: EntitySettings | BarSettings): number {
    const inv = item.invert_value ? -1 : 1;
    return item.entity ? Number(this.hass.states[item.entity].state) * inv : 0;
  }

  protected render(): TemplateResult {
    const valueList: number[] = [];

    let consumption = 0;
    let production = 0;
    this._config.entities.forEach((item, index) => {
      let value = this._val(item);

      switch (item.unit_of_measurement) {
        case 'W':
          break;
        case 'kW':
          value *= 1000;
          break;
      }
      valueList[index] = value;
      if (!item.calc_excluded) {
        if (item.producer && valueList[index] > 0) {
          production += value;
        }
        if (item.consumer && valueList[index] < 0) {
          consumption -= value;
        }
      }
    });

    //Just to clarify. The formulas for this can differ widely, so i have decided to take the most suitable ones in my opinion
    let ratio;
    if (!this._config.ratio?.entity) {
      //Ratio in Percent = Home Consumption / Home Production(Solar, Battery)*100
      ratio = production != 0 ? Math.min(Math.round((Math.abs(consumption) * 100) / production), 100) : 0;
    } else {
      ratio = this._val(this._config.ratio);
    }
    let autarky;
    if (!this._config.autarky?.entity) {
      //Autarky in Percent = Home Production(Solar, Battery)*100 / Home Consumption
      autarky = consumption != 0 ? Math.min(Math.round((production * 100) / Math.abs(consumption)), 100) : 0;
    } else {
      autarky = this._val(this._config.autarky);
    }

    return html`
      <ha-card .header=${this._config.title}>
        <div class="card-content">
          <div class="grid-container">
            <div class="grid-header">custom header 123</div>
            ${this._render_bars(ratio, autarky)}
            ${this._config.entities?.map((item, index) => html`${this._render_item(valueList[index], item, index)}`)}
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Render Support Functions
   */

  _render_bars(ratio: number, autarky: number): TemplateResult {
    return html`
      <div class="bar-container">
        <div class="ratio-bar">
          <p id="ratio-percentage">${ratio}%</p>
          <div class="bar-wrapper">
            <bar style="height:${ratio}%; background-color:${this._config.ratio?.bar_color || 'var(--dark-color)'};" />
          </div>
          <p id="ratio">${this._config.ratio?.name || 'ratio'}</p>
        </div>
        <div class="autarky-bar">
          <p id="autarky-percentage">${autarky}%</p>
          <div class="bar-wrapper">
            <bar
              style="height:${autarky}%; background-color:${this._config.autarky?.bar_color || 'var(--dark-color)'};"
            />
          </div>
          <p id="autarky">${this._config.autarky?.name || 'autarky'}</p>
        </div>
      </div>
    `;
  }

  private _moreInfo(ev: CustomEvent): void {
    fireEvent(this, 'hass-more-info', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entityId: (ev.currentTarget as any).entity,
    });
  }

  _render_item(value: number, item: EntitySettings, index: number): TemplateResult {
    const state = item.invert_arrow ? value * -1 : value;
    value = item.display_abs ? Math.abs(value) : value;
    return html`
      <item id="${item.name}" class="pointer" .entity=${item.entity} @click="${this._moreInfo}">
        <badge>
          <icon>
            <ha-icon data-state="${value == 0 ? 'unavaiable' : 'on'}" icon="${item.icon}"></ha-icon>
          </icon>
          <p class="subtitle">${item.name}</p>
        </badge>
        <value>
          <p>${value} ${item.unit_of_display}</p>
          ${this._render_arrow(
            //This takes the side the item is on (index even = left) into account for the arrows
            state == 0 ? 'none' : index % 2 == 0 ? (state > 0 ? 'right' : 'left') : state > 0 ? 'left' : 'right',
          )}
        <value
      </item>
    `;
  }

  //This generates Animated Arrows depending on the state
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
