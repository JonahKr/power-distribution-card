import { LitElement, html, customElement, property, CSSResult, TemplateResult } from 'lit-element';

import { HomeAssistant, fireEvent } from 'custom-card-helpers';

import { version } from '../package.json';

import { PDCConfig, PDCConfigInternal, EntitySettings, ArrowStates, BarList, BarSettings } from './types';
import { DefaultItem, PresetList, PresetObject, PresetType } from './presets';
import styles from './styles';

console.info(
  `%c POWER-DISTRIBUTION-CARD %c ${version} `,
  `font-weight: 500; color: white; background: #03a9f4;`,
  `font-weight: 500; color: #03a9f4; background: white;`,
);

@customElement('power-distribution')
export class PowerDistributionCard extends LitElement {
  //TODO Write Card Editor
  /*
  private static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('boilerplate-card-editor') as LovelaceCardEditor;
  }
  */
  public static getStubConfig(): Record<string, unknown> {
    return { entities: [{ solar: 'sensor.solar' }, { grid: 'sensor.grid' }, { home: 'sensor.home' }] };
  }

  @property() public hass!: HomeAssistant;

  @property() private _configFinished!: boolean;

  @property() private _config!: PDCConfigInternal;

  public setConfig(config: PDCConfig): void {
    const _config: PDCConfigInternal = { entities: [] };

    //General Card Settings
    _config.title = config.title || undefined;
    _config.disable_animation = config.disable_animation || false;

    //Warnings
    if (!config.entities) throw new Error('You need to set a entities attribute!');

    config.entities.forEach((item) => {
      for (const [preset, settings] of Object.entries(item)) {
        //This is for filtering the SimpleSetup items and converting it
        let setting: EntitySettings | BarSettings;
        if (typeof settings === 'string') {
          setting = { entity: settings };
        } else {
          setting = settings;
        }
        //Advanced Setup
        if (BarList.includes(preset)) {
          _config[preset] = <BarSettings>setting;
        } else if (PresetList.includes(<PresetType>preset)) {
          if (!setting.entity) throw new Error('You need to pass a entity_id to an item for it to work!');

          const _item: EntitySettings = Object.assign({}, DefaultItem, PresetObject[preset], <EntitySettings>setting);

          _item.preset = <PresetType>preset;

          _config.entities.push(_item);
        } else {
          throw new Error('The preset `' + preset + '` is not a valid entry. Please choose a Preset from the List.');
        }
      }
    });
    this._config = _config;
  }

  public updated(): void {
    if (this._configFinished) return;

    this._config.entities.forEach((item, index) => {
      if (!item.entity) return;
      //unit-of-measurement Configuration
      const hass_uom = this.hass.states[item.entity].attributes.unit_of_measurement;
      !item.unit_of_measurement ? (this._config.entities[index].unit_of_measurement = hass_uom || 'W') : undefined;
    });
    this._configFinished = true;
  }

  private showWarning(warning: string): TemplateResult {
    return html` <hui-warning>${warning}</hui-warning> `;
  }

  public static get styles(): CSSResult {
    return styles;
  }

  /**
   * Retrieving the sensor value of hass for a Item
   * @param item a Settings object
   * @returns The current value from Homeassistant in Watts
   */
  private _val(item: EntitySettings | BarSettings): number {
    let modifier = item.invert_value ? -1 : 1;
    if ((item as EntitySettings).unit_of_measurement == 'kW') modifier *= 1000;
    return item.entity ? Number(this.hass.states[item.entity].state) * modifier : 0;
  }

  /**
   * This is the main rendering function for this card
   * @returns html for the power-distribution-card
   */
  protected render(): TemplateResult {
    const left_panel: TemplateResult[] = [];
    const mid_panel: TemplateResult[] = [];
    const right_panel: TemplateResult[] = [];

    let consumption = 0;
    let production = 0;

    this._config.entities.forEach((item, index) => {
      const value = this._val(item);

      if (!item.calc_excluded) {
        if (item.producer && value > 0) {
          production += value;
        }
        if (item.consumer && value < 0) {
          consumption -= value;
        }
      }

      const _item = this._render_item(value, item, index);
      switch (index % 2) {
        case 0: //Even
          left_panel.push(_item);
          break;
        case 1: //Odd
          right_panel.push(_item);
          break;
      }
    });

    //Populating the Center Panel
    mid_panel.push(this._render_bars(consumption, production));

    return html`<ha-card .header=${this._config.title}>
      <div class="card-content">
        <div id="left-panel">${left_panel}</div>
        <div id="mid-panel">${mid_panel}</div>
        <div id="right-panel">${right_panel}</div>
      </div>
    </ha-card>`;
  }
  /**
   * Fires the Hass More Info Event
   * @param ev Event Object
   * @event hass-more-info
   */
  private _moreInfo(ev: CustomEvent): void {
    fireEvent(this, 'hass-more-info', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entityId: (ev.currentTarget as any).entity,
    });
  }

  private _render_item(value: number, item: EntitySettings, index: number): TemplateResult {
    const state = item.invert_arrow ? value * -1 : value;
    value = item.display_abs ? Math.abs(value) : value;

    return html`
      <item .entity=${item.entity} @click="${this._moreInfo}">
        <badge>
          <icon>
            <ha-icon data-state="${value == 0 ? 'unavaiable' : 'on'}" icon="${item.icon}"></ha-icon>
          </icon>
          <p class="subtitle">${item.name}</p>
        </badge>
        <value>
          <p>${item.unit_of_display === 'kW' ? value / 1000 : value} ${item.unit_of_display}</p>
          ${this._render_arrow(
            //This takes the side the item is on (index even = left) into account for the arrows
            state == 0 ? 'none' : index % 2 == 0 ? (state > 0 ? 'right' : 'left') : state > 0 ? 'left' : 'right',
          )}
        <value
      </item>
    `;
  }

  /**
   * Render function for Generating Arrows (CSS Only)
   * @param direction One of three Options: none, right, left
   */
  private _render_arrow(direction: ArrowStates): TemplateResult {
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
  /**
   * Render Support Function Calculating and Generating the Autarky and Ratio Bars
   * @param consumption the total home consumption
   * @param production the total home production
   * @returns html containing the bars
   */
  private _render_bars(consumption: number, production: number): TemplateResult {
    //Just to clarify. The formulas for this can differ widely, so i have decided to take the most suitable ones in my opinion
    let ratio: number;
    if (!this._config.ratio?.entity) {
      //Ratio in Percent = Home Consumption / Home Production(Solar, Battery)*100
      ratio = production != 0 ? Math.min(Math.round((Math.abs(consumption) * 100) / production), 100) : 0;
    } else {
      ratio = this._val(this._config.ratio);
    }
    let autarky: number;
    if (!this._config.autarky?.entity) {
      //Autarky in Percent = Home Production(Solar, Battery)*100 / Home Consumption
      autarky = consumption != 0 ? Math.min(Math.round((production * 100) / Math.abs(consumption)), 100) : 0;
    } else {
      autarky = this._val(this._config.autarky);
    }
    return html`
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
    `;
  }
}
