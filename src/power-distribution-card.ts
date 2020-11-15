import { LitElement, html, customElement, property, CSSResult, TemplateResult } from 'lit-element';

import {
  HomeAssistant,
  fireEvent,
  LovelaceCardEditor,
  LovelaceCard,
  LovelaceCardConfig,
  createThing,
} from 'custom-card-helpers';

import { version } from '../package.json';

import './editor';

import { PDCConfig, EntitySettings, ArrowStates, BarSettings } from './types';
import { DefaultItem, DefaultConfig, PresetList, PresetObject, PresetType } from './presets';
import styles from './styles';

console.info(
  `%c POWER-DISTRIBUTION-CARD %c ${version}_b1`,
  `font-weight: 500; color: white; background: #03a9f4;`,
  `font-weight: 500; color: #03a9f4; background: white;`,
);

@customElement('power-distribution')
export class PowerDistributionCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('power-distribution-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): Record<string, unknown> {
    return { entities: [{ solar: 'sensor.solar' }, { grid: 'sensor.grid' }, { home: 'sensor.home' }] };
  }

  @property() public hass!: HomeAssistant;

  private _configFinished!: boolean;

  @property() private _config!: PDCConfig;

  @property() private _card!: LovelaceCard;

  /**
   * Configuring all the passed Settings and Changing it to a more usefull Internal one.
   * @param config The Config Object configured via YAML
   */
  public async setConfig(config: PDCConfig): Promise<void> {
    //General Card Settings
    if (config.disable_animation) {
      throw new Error(
        'DEPRACATION: The disable_animation setting is considered deprecated! Please use "animation: none" instead',
      );
    }
    //The Addition of the last object is needed to override the entities array for the preset settings
    const _config = Object.assign({}, DefaultConfig, config, { entities: [] });

    //Entities Preset Object Stacking
    if (!config.entities) throw new Error('You need to set a entities attribute!');
    config.entities.forEach((item) => {
      if (item.preset && PresetList.includes(<PresetType>item.preset)) {
        const _item: EntitySettings = Object.assign({}, DefaultItem, PresetObject[item.preset], <EntitySettings>item);
        _config.entities.push(_item);
      } else {
        throw new Error('The preset `' + item.preset + '` is not a valid entry. Please choose a Preset from the List.');
      }
    });

    this._config = _config;
  }
  public firstUpdated(): void {
    if (this._configFinished) return;

    const _config = this._config;

    _config.entities.forEach((item, index) => {
      if (!item.entity) return;
      //unit-of-measurement Auto Configuration
      const hass_uom = this.hass.states[item.entity].attributes.unit_of_measurement;
      !item.unit_of_measurement ? (this._config.entities[index].unit_of_measurement = hass_uom || 'W') : undefined;
    });

    //Setting up card if needed
    const center = this._config.center;
    if (center !== 'none' && typeof center === 'object' && center['type']) {
      this._card = this._createCardElement(center as LovelaceCardConfig);
    } else if (center !== 'none') {
      //Simple Setup Support... Seriously considering dropping it considering the added complexity
      const barlist: { [key: string]: BarSettings }[] = [];
      center?.forEach((element: { [key: string]: BarSettings | string }) => {
        const key = Object.keys(element)[0];
        if (key !== 'autarky' && key !== 'ratio') throw new Error('You cannot add Bar: ' + key);
        if (typeof element[key] === 'string' && _config.center) {
          barlist.push({ [key]: { entity: element[key] as string } });
        } else {
          barlist.push(element as { [key: string]: BarSettings });
        }
      });
      this._config.center = barlist;
    }
    this._configFinished = true;
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
    if ((item as EntitySettings).unit_of_measurement == ('kW' || 'kWh')) modifier *= 1000;
    const attr = (item as EntitySettings).attribute || null;
    const num = item.entity
      ? attr
        ? Number(this.hass.states[item.entity].attributes[attr])
        : Number(this.hass.states[item.entity].state)
      : 0;
    return item.entity ? num * modifier : 0;
  }

  /**
   * This is the main rendering function for this card
   * @returns html for the power-distribution-card
   */
  protected render(): TemplateResult {
    const left_panel: TemplateResult[] = [];
    const center_panel: (TemplateResult | LovelaceCard)[] = [];
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
    const center = this._config.center;
    if (center === 'none') undefined;
    else if (typeof center === 'object' && center['type']) {
      center_panel.push(this._createCardElement(center as LovelaceCardConfig));
    } else {
      center_panel.push(this._render_bars(consumption, production));
    }

    return html`<ha-card .header=${this._config.title}>
      <div class="card-content">
        <div id="left-panel">${left_panel}</div>
        <div id="center-panel">${center_panel}</div>
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

  /**
   * Creating a Item Element
   * @param value The Value of the Sensor
   * @param item The EntitySettings Object of the Item
   * @param index The index of the Item. This is needed for the Arrow Directions.
   * @returns Html for a single Item
   */
  private _render_item(value: number, item: EntitySettings, index: number): TemplateResult {
    const state = item.invert_arrow ? value * -1 : value;

    //Toggle Absolute Values
    value = item.display_abs ? Math.abs(value) : value;

    //Unit-Of-Display
    let unit_of_display = 'W';
    switch (item.unit_of_display) {
      case 'kW':
      case 'kWh':
        value /= 1000;
        unit_of_display = item.unit_of_display;
        break;
      case 'adaptive':
        if (value > 999) {
          value = value / 1000;
          unit_of_display = 'kW';
        } else {
          unit_of_display = 'W';
        }
        break;
    }

    //Decimal Precision
    const decFakTen = 10 ** (item.decimals || item.decimals == 0 ? item.decimals : 2);
    value = Math.round(value * decFakTen) / decFakTen;

    return html`
      <item .entity=${item.entity} @click="${this._moreInfo}">
        <badge>
          <icon>
            <ha-icon data-state="${value == 0 ? 'unavaiable' : 'on'}" icon="${item.icon}"></ha-icon>
          </icon>
          <p class="subtitle">${item.name}</p>
        </badge>
        <value>
          <p>${value} ${unit_of_display}</p>
          ${this._render_arrow(
            //This takes the side the item is on (index even = left) into account for the arrows
            state == 0 ? 'none' : index % 2 == 0 ? (state > 0 ? 'right' : 'left') : state > 0 ? 'left' : 'right',
            index,
          )}
        <value
      </item>
    `;
  }

  /**
   * Render function for Generating Arrows (CSS Only)
   * @param direction One of three Options: none, right, left
   * @param index To detect which side the item is on and adapt the direction accordingly
   */
  private _render_arrow(direction: ArrowStates, index: number): TemplateResult {
    const a = this._config.animation;
    if (direction == 'none') {
      return html` <div class="blank"></div> `;
    } else {
      return html`
        <svg width="57" height="18" class="arrow">
          <defs>
            <polygon id="arrow-right" points="0 0, 0 16, 16 8" />
            <polygon id="arrow-left" points="16 0, 16 16, 0 8" />
            <g id="slide-${index}" class="arrow-color">
              <use href="#arrow-${direction}" x="-36" />
              <use href="#arrow-${direction}" x="-12" />
              <use href="#arrow-${direction}" x="12" />
              <use href="#arrow-${direction}" x="36" />
            </g>
            <g id="flash-${index}">
              <use
                href="#arrow-${direction}"
                x="0"
                style="animation-delay: ${direction == 'right' ? 0 : 2}s;"
                id="a-flash"
              />
              <use href="#arrow-${direction}" x="20" style="animation-delay: 1s;" id="a-flash" />
              <use
                href="#arrow-${direction}"
                x="40"
                style="animation-delay: ${direction == 'right' ? 2 : 0}s;"
                id="a-flash"
              />
            </g>
            <g id="none-${index}" class="arrow-color">
              <use href="#arrow-${direction}" x="0" />
              <use href="#arrow-${direction}" x="20" />
              <use href="#arrow-${direction}" x="40" />
            </g>
          </defs>
          <use href="#${a}-${index}" id="a-${a}-${direction}" />
        </svg>
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
    if (this._config.center == 'none') return html``;

    let autarky_settings: BarSettings = {};
    let ratio_settings: BarSettings = {};
    this._config.center?.forEach((element: { [key: string]: BarSettings }) => {
      if (element.autarky) autarky_settings = element.autarky;
      if (element.ratio) ratio_settings = element.ratio;
    });
    //Just to clarify. The formulas for this can differ widely, so i have decided to take the most suitable ones in my opinion
    let ratio: number;
    if (!ratio_settings.entity) {
      //Ratio in Percent = Home Consumption / Home Production(Solar, Battery)*100
      ratio = production != 0 ? Math.min(Math.round((Math.abs(consumption) * 100) / production), 100) : 0;
    } else {
      ratio = this._val(ratio_settings);
    }
    let autarky: number;
    if (!autarky_settings.entity) {
      //Autarky in Percent = Home Production(Solar, Battery)*100 / Home Consumption
      autarky = consumption != 0 ? Math.min(Math.round((production * 100) / Math.abs(consumption)), 100) : 0;
    } else {
      autarky = this._val(autarky_settings);
    }
    return html`
      <div class="ratio-bar">
        <p id="ratio-percentage">${ratio}%</p>
        <div class="bar-wrapper">
          <bar style="height:${ratio}%; background-color:${ratio_settings.bar_color || 'var(--dark-color)'};" />
        </div>
        <p id="ratio">${ratio_settings.name || 'ratio'}</p>
      </div>
      <div class="autarky-bar">
        <p id="autarky-percentage">${autarky}%</p>
        <div class="bar-wrapper">
          <bar style="height:${autarky}%; background-color:${autarky_settings.bar_color || 'var(--dark-color)'};" />
        </div>
        <p id="autarky">${autarky_settings.name || 'autarky'}</p>
      </div>
    `;
  }

  private _createCardElement(cardConfig: LovelaceCardConfig) {
    const element = createThing(cardConfig) as LovelaceCard;
    if (this.hass) {
      element.hass = this.hass;
    }
    element.addEventListener(
      'll-rebuild',
      (ev) => {
        ev.stopPropagation();
        this._rebuildCard(element, cardConfig);
      },
      { once: true },
    );
    return element;
  }

  private _rebuildCard(cardElToReplace: LovelaceCard, config: LovelaceCardConfig): void {
    const newCardEl = this._createCardElement(config);
    if (cardElToReplace.parentElement) {
      cardElToReplace.parentElement.replaceChild(newCardEl, cardElToReplace);
    }
    this._card === cardElToReplace ? (this._card = newCardEl) : undefined;
  }
}
