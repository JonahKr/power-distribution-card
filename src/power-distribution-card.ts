import { LitElement, html, TemplateResult, PropertyValues, CSSResultGroup } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';

import {
  debounce,
  HomeAssistant,
  formatNumber,
  LovelaceCardEditor,
  LovelaceCard,
  LovelaceCardConfig,
  createThing,
  hasAction,
  ActionHandlerEvent,
  handleAction,
} from 'custom-card-helpers';

import { version } from '../package.json';

import { PDCConfig, EntitySettings, ArrowStates, BarSettings } from './types';
import { DefaultItem, DefaultConfig, PresetList, PresetObject, PresetType } from './presets';
import { styles, narrow_styles } from './styles';
import { localize } from './localize/localize';
import ResizeObserver from 'resize-observer-polyfill';
import { installResizeObserver } from './util';
import { actionHandler } from './action-handler';

import './editor/editor';

console.info(
  `%c POWER-DISTRIBUTION-CARD %c ${version} `,
  `font-weight: 500; color: white; background: #03a9f4;`,
  `font-weight: 500; color: #03a9f4; background: white;`,
);

window.customCards.push({
  type: 'power-distribution-card',
  name: 'Power Distribution Card',
  description: localize('common.description'),
});

@customElement('power-distribution-card')
export class PowerDistributionCard extends LitElement {
  /**
   * Linking to the visual Editor Element
   * @returns Editor DOM Element
   */
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor/editor');
    return document.createElement('power-distribution-card-editor') as LovelaceCardEditor;
  }

  /**
   * Function for creating the standard power-distribution-card
   * @returns Example Config for this Card
   */
  public static getStubConfig(): Record<string, unknown> {
    return {
      title: 'Title',
      entities: [],
      center: {
        type: 'bars',
        content: [
          { preset: 'autarky', name: localize('editor.settings.autarky') },
          { preset: 'ratio', name: localize('editor.settings.ratio') },
        ],
      },
    };
  }

  @property() public hass!: HomeAssistant;

  @state() private _config!: PDCConfig;

  @property() private _card!: LovelaceCard;

  private _resizeObserver?: ResizeObserver;
  @state() private _narrow = false;

  /**
   * Configuring all the passed Settings and Changing it to a more usefull Internal one.
   * @param config The Config Object configured via YAML
   */
  public async setConfig(config: PDCConfig): Promise<void> {
    //The Addition of the last object is needed to override the entities array for the preset settings
    const _config = Object.assign({}, DefaultConfig, config, { entities: [] });

    //Entities Preset Object Stacking
    if (!config.entities) throw new Error('You need to define Entities!');
    config.entities.forEach((item) => {
      if (item.preset && PresetList.includes(<PresetType>item.preset)) {
        const _item: EntitySettings = Object.assign({}, DefaultItem, PresetObject[item.preset], <EntitySettings>item);
        _config.entities.push(_item);
      } else {
        throw new Error('The preset `' + item.preset + '` is not a valid entry. Please choose a Preset from the List.');
      }
    });
    this._config = _config;

    //Setting up card if needed
    if (this._config.center.type == 'card') {
      this._card = this._createCardElement(this._config.center.content as LovelaceCardConfig);
    }
  }

  public firstUpdated(): void {
    const _config = this._config;
    //unit-of-measurement Auto Configuration from hass element
    _config.entities.forEach((item, index) => {
      if (!item.entity) return;
      const hass_uom = this._state({ entity: item.entity, attribute: 'unit_of_measurement' }) as string;
      if (!item.unit_of_measurement) this._config.entities[index].unit_of_measurement = hass_uom || 'W';
    });
    // Applying the same to bars
    if (_config.center.type == 'bars') {
      const content = (_config.center.content as BarSettings[]).map((item) => {
        let hass_uom = '%';
        if (item.entity) {
          hass_uom = this._state({ entity: item.entity, attribute: 'unit_of_measurement' }) as string;
        }
        return {
          ...item,
          unit_of_measurement: item.unit_of_measurement || hass_uom,
        };
      });
      this._config = {
        ...this._config,
        center: {
          ...this._config.center,
          content: content,
        },
      };
    }

    //Resize Observer
    this._adjustWidth();
    this._attachObserver();
    //This is needed to prevent Rendering without the unit_of_measurements
    this.requestUpdate();
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._card || (!changedProps.has('hass') && !changedProps.has('editMode'))) {
      return;
    }
    if (this.hass) {
      this._card.hass = this.hass;
    }
  }

  public static get styles(): CSSResultGroup {
    return styles;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.updateComplete.then(() => this._attachObserver());
  }

  public disconnectedCallback(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  private async _attachObserver(): Promise<void> {
    if (!this._resizeObserver) {
      await installResizeObserver();
      this._resizeObserver = new ResizeObserver(debounce(() => this._adjustWidth(), 250, false));
    }
    const card = this.shadowRoot?.querySelector('ha-card');
    // If we show an error or warning there is no ha-card
    if (!card) return;
    this._resizeObserver.observe(card);
  }

  private _adjustWidth(): void {
    const card = this.shadowRoot?.querySelector('ha-card');
    if (!card) return;
    this._narrow = card.offsetWidth < 400;
  }

  /**
   * Retrieving the sensor value of hass for a Item as a number
   * @param item a Settings object
   * @returns The current value from Homeassistant in Watts
   */
  private _val(item: EntitySettings | BarSettings): number {
    let modifier = item.invert_value ? -1 : 1;
    //Proper K Scaling e.g. 1kW = 1000W
    if (item.unit_of_measurement?.charAt(0) == 'k') modifier *= 1000;
    // If an entity exists, check if the attribute setting is entered -> value from attribute else value from entity
    let num = this._state(item as EntitySettings) as number;
    //Applying Threshold
    const threshold = (item as EntitySettings).threshold || null;
    num = threshold ? (Math.abs(num) < threshold ? 0 : num) : num;
    return num * modifier;
  }

  /**
   * Retrieving the raw state of an sensor/attribute
   * @param item A Settings object
   * @returns entitys/attributes state
   */
  private _state(item: EntitySettings): unknown {
    return item.entity && this.hass.states[item.entity]
      ? item.attribute
        ? this.hass.states[item.entity].attributes[item.attribute]
        : this.hass.states[item.entity].state
      : null;
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
      //Sorting the Items to either side
      if (index % 2 == 0) left_panel.push(_item);
      else right_panel.push(_item);
    });

    //Populating the Center Panel
    const center = this._config.center;
    switch (center.type) {
      case 'none':
        break;
      case 'card':
        if (this._card) center_panel.push(this._card);
        else console.warn('NO CARD');
        break;
      case 'bars':
        center_panel.push(this._render_bars(consumption, production));
        break;
    }

    return html` ${this._narrow ? narrow_styles : undefined}
      <ha-card .header=${this._config.title}>
        <div class="card-content">
          <div id="left-panel">${left_panel}</div>
          <div id="center-panel">${center_panel}</div>
          <div id="right-panel">${right_panel}</div>
        </div>
      </ha-card>`;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this._config && ev.detail.action) {
      handleAction(
        this,
        this.hass,
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          entity: (ev.currentTarget as any).entity,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tap_action: (ev.currentTarget as any).tap_action,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          double_tap_action: (ev.currentTarget as any).double_tap_action,
        },
        ev.detail.action,
      );
    }
  }

  /**
   * Creating a Item Element
   * @param value The Value of the Sensor
   * @param item The EntitySettings Object of the Item
   * @param index The index of the Item. This is needed for the Arrow Directions.
   * @returns Html for a single Item
   */
  private _render_item(value: number, item: EntitySettings, index: number): TemplateResult {
    //Placeholder item
    if (!item.entity) {
      return html`<item class="placeholder"></item>`;
    }
    let math_value = value;
    //Unit-Of-Display and Unit_of_measurement
    let unit_of_display = item.unit_of_display || 'W';
    const uod_split = unit_of_display.charAt(0);
    if (uod_split[0] == 'k') {
      math_value /= 1000;
    } else if (item.unit_of_display == 'adaptive') {
      //Using the uom suffix enables to adapt the initial unit to the automatic scaling naming
      let uom_suffix = 'W';
      if (item.unit_of_measurement) {
        uom_suffix =
          item.unit_of_measurement[0] == 'k' ? item.unit_of_measurement.substring(1) : item.unit_of_measurement;
      }
      if (Math.abs(math_value) > 999) {
        math_value /= 1000;
        unit_of_display = 'k' + uom_suffix;
      } else {
        unit_of_display = uom_suffix;
      }
    }

    //Decimal Precision
    const decFakTen = 10 ** (item.decimals || item.decimals == 0 ? item.decimals : 2);
    math_value = Math.round(math_value * decFakTen) / decFakTen;
    // Arrow directions
    const state = item.invert_arrow ? math_value * -1 : math_value;
    //Toggle Absolute Values
    math_value = item.display_abs ? Math.abs(math_value) : math_value;
    //Format Number
    const formatValue = formatNumber(math_value, this.hass.locale);

    // Secondary info
    let secondary_info: string | undefined;
    if (item.secondary_info_entity) {
      if (item.secondary_info_attribute) {
        secondary_info =
          this._state({ entity: item.secondary_info_entity, attribute: item.secondary_info_attribute }) + '';
      } else {
        secondary_info = `${this._state({ entity: item.secondary_info_entity })}${
          this._state({ entity: item.secondary_info_entity, attribute: 'unit_of_measurement' }) || ''
        }`;
      }
    }
    // Secondary info replace name
    if (item.secondary_info_replace_name) {
      item.name = secondary_info;
      secondary_info = undefined;
    }

    //Preset Features
    // 1. Battery Icon
    let icon = item.icon;
    if (item.preset === 'battery' && item.battery_percentage_entity) {
      const bat_val = this._val({ entity: item.battery_percentage_entity });
      if (!isNaN(bat_val)) {
        icon = 'mdi:battery';
        // mdi:battery-100 and -0 don't exist thats why we have to handle it seperately
        if (bat_val < 5) {
          icon = 'mdi:battery-outline';
        } else if (bat_val < 95) {
          icon = 'mdi:battery-' + (bat_val / 10).toFixed(0) + '0';
        }
      }
    }
    // 2. Grid Buy-Sell
    let nameReplaceFlag = false;
    let grid_buy_sell = html``;
    if (item.preset === 'grid' && (item.grid_buy_entity || item.grid_sell_entity)) {
      nameReplaceFlag = true;
      grid_buy_sell = html`
        <div class="buy-sell">
          ${item.grid_buy_entity
            ? html`<div class="grid-buy">
                B:
                ${this._val({ entity: item.grid_buy_entity })}${this._state({
                  entity: item.grid_buy_entity,
                  attribute: 'unit_of_measurement',
                }) || undefined}
              </div>`
            : undefined}
          ${item.grid_sell_entity
            ? html`<div class="grid-sell">
                S:
                ${this._val({ entity: item.grid_sell_entity })}${this._state({
                  entity: item.grid_sell_entity,
                  attribute: 'unit_of_measurement',
                }) || undefined}
              </div>`
            : undefined}
        </div>
      `;
    }

    // COLOR CHANGE
    const ct = item.color_threshold || 0;
    // Icon color dependant on state
    let icon_color: string | undefined;
    if (item.icon_color) {
      if (state > ct) icon_color = item.icon_color.bigger;
      if (state < ct) icon_color = item.icon_color.smaller;
      if (state == ct) icon_color = item.icon_color.equal;
    }
    // Arrow color
    let arrow_color: string | undefined;
    if (item.arrow_color) {
      if (state > ct) arrow_color = item.arrow_color.bigger;
      if (state < ct) arrow_color = item.arrow_color.smaller;
      if (state == ct) arrow_color = item.arrow_color.equal;
    }

    //NaNFlag for Offline Sensors for example
    const NanFlag = isNaN(math_value);

    return html`
      <item
        .entity=${item.entity}
        .tap_action=${item.tap_action}
        .double_tap_action=${item.double_tap_action}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasDoubleClick: hasAction(item.double_tap_action),
        })}
    ">
        <badge>
          <icon>
            <ha-icon icon="${icon}" style="${icon_color ? `color:${icon_color};` : ''}"></ha-icon>
            ${secondary_info ? html`<p class="secondary">${secondary_info}</p>` : null}
          </icon>
          ${nameReplaceFlag ? grid_buy_sell : html`<p class="subtitle">${item.name}</p>`}
        </badge>
        <value>
          <p>${NanFlag ? `` : formatValue} ${NanFlag ? `` : unit_of_display}</p>
          ${
            !item.hide_arrows
              ? this._render_arrow(
                  //This takes the side the item is on (index even = left) into account for the arrows
                  value == 0 || NanFlag
                    ? 'none'
                    : index % 2 == 0
                      ? state > 0
                        ? 'right'
                        : 'left'
                      : state > 0
                        ? 'left'
                        : 'right',
                  arrow_color,
                )
              : html``
          }
        <value
      </item>
    `;
  }

  /**
   * Render function for Generating Arrows (CSS Only)
   * @param direction One of three Options: none, right, left
   * @param index To detect which side the item is on and adapt the direction accordingly
   */
  private _render_arrow(direction: ArrowStates, color?: string): TemplateResult {
    const a = this._config.animation;
    if (direction == 'none') {
      return html` <div class="blank" style="${color ? `background-color:${color};` : ''}"></div> `;
    } else {
      return html`
        <div class="arrow-container ${direction}">
          <div class="arrow ${a} " style="border-left-color: ${color};"></div>
          <div class="arrow ${a} ${a == 'flash' ? 'delay-1' : ''}" style="border-left-color: ${color};"></div>
          <div class="arrow ${a} ${a == 'flash' ? 'delay-2' : ''}" style="border-left-color: ${color};"></div>
          <div class="arrow ${a}" style="border-left-color: ${color};"></div>
        </div>
      `;
    }
  }

  /**
   * Render Support Function Calculating and Generating the Autarky and Ratio Bars
   * @param consumption the total home consumption
   * @param production the total home production
   * @returns html containing the bars as Template Results
   */
  private _render_bars(consumption: number, production: number): TemplateResult {
    const bars: TemplateResult[] = [];
    if (!this._config.center.content || (this._config.center.content as BarSettings[]).length == 0) return html``;
    (this._config.center.content as BarSettings[]).forEach((element) => {
      let value = -1;

      switch (element.preset) {
        case 'autarky': //Autarky in Percent = Home Production(Solar, Battery)*100 / Home Consumption
          if (!element.entity)
            value = consumption != 0 ? Math.min(Math.round((production * 100) / Math.abs(consumption)), 100) : 0;
          break;
        case 'ratio': //Ratio in Percent = Home Consumption / Home Production(Solar, Battery)*100
          if (!element.entity)
            value = production != 0 ? Math.min(Math.round((Math.abs(consumption) * 100) / production), 100) : 0;
          break;
      }
      if (value < 0) value = Math.min(parseInt(this._val(element).toFixed(0), 10), 100);
      bars.push(html`
        <div
          class="bar-element"
          .entity=${element.entity}
          .tap_action=${element.tap_action}
          .double_tap_action=${element.double_tap_action}
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            hasDoubleClick: hasAction(element.double_tap_action),
          })}
          style="${element.tap_action || element.double_tap_action ? 'cursor: pointer;' : ''}"
        >
          <p class="bar-percentage">${value}${element.unit_of_measurement || '%'}</p>
          <div class="bar-wrapper" style="${element.bar_bg_color ? `background-color:${element.bar_bg_color};` : ''}">
            <bar style="height:${value}%; background-color:${element.bar_color};" />
          </div>
          <p>${element.name || ''}</p>
        </div>
      `);
    });
    return html`${bars.map((e) => html`${e}`)}`;
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
    if (this._card === cardElToReplace) this._card = newCardEl;
  }
}
