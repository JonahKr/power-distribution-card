import { LitElement, TemplateResult, html, css, CSSResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';

import { fireEvent } from '../util';
import { EditorTarget, EntitySettings } from '../types';
import { computeLabel, localize } from '../localize/localize';
import { PresetList } from '../presets';
import { actions } from '../action-handler';
import { HaFormSchema } from './ha-form';

const  SCHEMA: HaFormSchema[] = [
  {
    type: "grid",
    name: "",
    schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "entity", selector: { entity: { domain: "sensor"} } },
        { name: "attribute", selector: { attribute: {}}, context: { filter_entity: "entity" } },
        { name: "preset", selector: { select: { options: PresetList as any as string[], mode: 'dropdown' } } },
    ]
  },
  {
    name: "Value Settings",
    type: "expandable",
    title: localize('editor.settings.value', true) + " " +localize('editor.settings.settings', true),
    schema: [
      {
        type: "grid",
        name: "",
        schema: [
            { name: "unit_of_display", selector: { text: {} } },
            { name: "decimals", selector: { number: { step: 1} } },
            { name: "invert_value", type: "boolean"},
            { name: "display_abs", type: "boolean"},
            { name: "calc_excluded", type: "boolean"},
            { name: "threshold", selector: { number: { } } },
        ]
      }
    ]
  },
  {
    name: "Secondary Info",
    type: "expandable",
    title: localize('editor.settings.secondary_info', true),
    schema: [
      {
        type: "grid",
        name: "",
        schema: [
            { name: "secondary_info_entity", selector: { entity: { domain: "sensor"} } },
            { name: "secondary_info_attribute", selector: { attribute: {}}, context: { filter_entity: "secondary_info_entity" } },
            { name: "secondary_info_replace_name", type: "boolean"},
        ]
      }
    ]
  },
  {
    name: "Action Settings",
    type: "expandable",
    title: localize('editor.settings.action_settings', true),
    schema: [
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "tap_action",
            selector: { ui_action: {} },
        },
        {
            name: "double_tap_action",
            selector: { ui_action: {} },
        }
        ]
      }
    ]
  },
  {
    name: "Color Settings",
    type: "expandable",
    title: localize('editor.settings.color-settings', true),
    schema: [
      {
        type: "grid",
        name: "",
        schema: [
        ]
      }
    ]
  }
];

@customElement('power-distribution-card-item-editor')
export class ItemEditor extends LitElement {
  @property({ attribute: false }) config?: EntitySettings;

  @property({ attribute: false }) hass?: HomeAssistant;

  protected render() {
    // If its a placeholder, don't render anything
    if (!this.hass || !this.config || this.config.preset == 'placeholder') {
      return nothing;
    }
    const item = this.config;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${SCHEMA}
        .computeLabel=${computeLabel}
        @value-changed=${console.log}
      ></ha-form>
    `;

    return html`
      <div class="side-by-side">
        <ha-icon-picker
          .label="${localize('editor.settings.icon')}  (${localize('editor.optional')})"
          .value=${item.icon}
          .configValue=${'icon'}
          @value-changed=${this._valueChanged}
        ></ha-icon-picker>
        <ha-textfield
          label="${localize('editor.settings.name')} (${localize('editor.optional')})"
          .value=${item.name || undefined}
          .configValue=${'name'}
          @input=${this._valueChanged}
        ></ha-textfield>
      </div>
      <div class="side-by-side">
        <ha-entity-picker
          label="${localize('editor.settings.entity')} (${localize('editor.required')})"
          allow-custom-entity
          hideClearIcon
          .hass=${this.hass}
          .configValue=${'entity'}
          .value=${item.entity}
          @value-changed=${this._valueChanged}
        ></ha-entity-picker>
        <ha-select
          label="${localize('editor.settings.attribute')} (${localize('editor.optional')})"
          .configValue=${'attribute'}
          .value=${item.attribute || ''}
          @selected=${this._valueChanged}
          @closed=${(ev) => ev.stopPropagation()}
        >
          ${attributes.length > 0 ? html`<mwc-list-item></mwc-list-item>` : ''}
          ${attributes.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
        </ha-select>
      </div>
      <div class="side-by-side">
        <ha-select
          label="${localize('editor.settings.preset')}"
          .configValue=${'preset'}
          .value=${item.preset || PresetList[0]}
          @selected=${this._valueChanged}
          @closed=${(ev) => ev.stopPropagation()}
        >
          ${PresetList.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
        </ha-select>
        <div class="checkbox">
          <input
            type="checkbox"
            id="hide-arrows"
            .checked="${item.hide_arrows || false}"
            .configValue=${'hide_arrows'}
            @change=${this._valueChanged}
          />
          <label for="hide-arrows"> ${localize('editor.settings.hide-arrows')}</label>
        </div>
      </div>
      <div class="side-by-side">${this._renderPresetFeatures()}</div>
      <br /><br />
      <h3>${localize('editor.settings.value', true)} ${localize('editor.settings.settings', true)}</h3>
      <div class="side-by-side">
        <ha-textfield
          label="${localize('editor.settings.unit_of_display')}"
          .value=${item.unit_of_display || ''}
          .configValue=${'unit_of_display'}
          @input=${this._valueChanged}
        ></ha-textfield>
        <ha-textfield
          auto-validate
          pattern="[0-9]"
          label="${localize('editor.settings.decimals')}"
          .value=${item.decimals || ''}
          .configValue=${'decimals'}
          @input=${this._valueChanged}
        ></ha-textfield>
      </div>
      <div class="side-by-side">
        <div class="checkbox">
          <input
            type="checkbox"
            id="invert-value"
            .checked="${item.invert_value || false}"
            .configValue=${'invert_value'}
            @change=${this._valueChanged}
          />
          <label for="invert-value"> ${localize('editor.settings.invert-value')}</label>
        </div>
        <div class="checkbox">
          <input
            type="checkbox"
            id="display-abs"
            .checked="${item.display_abs == false ? false : true}"
            .configValue=${'display_abs'}
            @change=${this._valueChanged}
          />
          <label for="display-abs"> ${localize('editor.settings.display-abs')} </label>
        </div>
      </div>
      <div class="side-by-side">
        <div class="checkbox">
          <input
            type="checkbox"
            id="calc_excluded"
            .checked="${item.calc_excluded}"
            .configValue=${'calc_excluded'}
            @change=${this._valueChanged}
          />
          <label for="calc_excluded"> ${localize('editor.settings.calc_excluded')} </label>
        </div>
        <ha-textfield
          label="${localize('editor.settings.threshold')}"
          .value=${item.threshold || ''}
          .configValue=${'threshold'}
          @input=${this._valueChanged}
        ></ha-textfield>
      </div>
      <br />
      <h3>${localize('editor.settings.secondary-info', true)}</h3>
      <div class="side-by-side">
        <ha-entity-picker
          label="${localize('editor.settings.entity')}"
          allow-custom-entity
          hideClearIcon
          .hass=${this.hass}
          .configValue=${'secondary_info_entity'}
          .value=${item.secondary_info_entity}
          @value-changed=${this._valueChanged}
        ></ha-entity-picker>
        <ha-select
          allow-custom-entity
          label="${localize('editor.settings.attribute')} (${localize('editor.optional')})"
          .value=${item.secondary_info_attribute || ''}
          .configValue=${'secondary_info_attribute'}
          @value-changed=${this._valueChanged}
          @closed=${(ev) => ev.stopPropagation()}
        >
          ${secondary_info_attributes.length > 0 ? html`<mwc-list-item></mwc-list-item>` : undefined}
          ${secondary_info_attributes.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
        </ha-select>
      </div>
      <div class="checkbox">
        <input
          type="checkbox"
          id="secondary_info_replace_name"
          .checked="${item.secondary_info_replace_name || false}"
          .configValue=${'secondary_info_replace_name'}
          @change=${this._valueChanged}
        />
        <label for="secondary_info_replace_name"> ${localize('editor.settings.replace_name')}</label>
      </div>
      <br />
      <h3>${localize('editor.settings.color-settings', true)}</h3>
      <ha-textfield
        label="${localize('editor.settings.color_threshold')}"
        .value=${item.color_threshold || 0}
        .configValue=${'color_threshold'}
        @input=${this._valueChanged}
      ></ha-textfield>
      <table>
        <tr>
          <th>Element</th>
          <th>&gt; ${item.color_threshold || 0}</th>
          <th>= ${item.color_threshold || 0}</th>
          <th>&lt; ${item.color_threshold || 0}</th>
        </tr>
        <tr>
          <th>icon</th>
          <td>
            <ha-textfield
              label="${localize('editor.settings.bigger')}"
              .value=${item.icon_color?.bigger || ''}
              .configValue=${'icon_color.bigger'}
              @input=${this._colorChanged}
            ></ha-textfield>
          </td>
          <td>
            <ha-textfield
              label="${localize('editor.settings.equal')}"
              .value=${item.icon_color?.equal || ''}
              .configValue=${'icon_color.equal'}
              @input=${this._colorChanged}
            ></ha-textfield>
          </td>
          <td>
            <ha-textfield
              label="${localize('editor.settings.smaller')}"
              .value=${item.icon_color?.smaller || ''}
              .configValue=${'icon_color.smaller'}
              @input=${this._colorChanged}
            ></ha-textfield>
          </td>
        </tr>
        <tr>
          <th>arrows</th>
          <td>
            <ha-textfield
              label="${localize('editor.settings.bigger')}"
              .value=${item.arrow_color?.bigger || ''}
              .configValue=${'arrow_color.bigger'}
              @input=${this._colorChanged}
            ></ha-textfield>
          </td>
          <td>
            <ha-textfield
              label="${localize('editor.settings.equal')}"
              .value=${item.arrow_color?.equal || ''}
              .configValue=${'arrow_color.equal'}
              @input=${this._colorChanged}
            ></ha-textfield>
          </td>
          <td>
            <ha-textfield
              label="${localize('editor.settings.smaller')}"
              .value=${item.arrow_color?.smaller || ''}
              .configValue=${'arrow_color.smaller'}
              @input=${this._colorChanged}
            ></ha-textfield>
          </td>
        </tr>
      </table>
      <br />
      <h3>${localize('editor.settings.action_settings')}</h3>
      <div class="side-by-side">
        <ha-selector
          label="${localize('editor.settings.tap_action')}"
          .hass=${this.hass}
          .selector=${{ 'ui-action': { actions: actions } }}
          .value=${item.tap_action || { action: 'more-info' }}
          .configValue=${'tap_action'}
          @value-changed=${this._valueChanged}
        >
        </ha-selector>
        <ha-selector
          label="${localize('editor.settings.double_tap_action')}"
          .hass=${this.hass}
          .selector=${{ 'ui-action': { actions: actions } }}
          .value=${item.double_tap_action}
          .configValue=${'double_tap_action'}
          @value-changed=${this._valueChanged}
        >
        </ha-selector>
      </div>
    `;
  }

  private _renderPresetFeatures(): TemplateResult {
    if (!this.config || !this.hass) return html``;

    const preset = this.config.preset;
    switch (preset) {
      case 'battery':
        return html`
          <ha-entity-picker
            label="${localize('editor.settings.battery_percentage')} (${localize('editor.optional')})"
            allow-custom-entity
            hideClearIcon
            .hass=${this.hass}
            .configValue=${'battery_percentage_entity'}
            .value=${this.config.battery_percentage_entity || ''}
            @value-changed=${this._valueChanged}
          ></ha-entity-picker>
        `;
      case 'grid':
        return html`
          <ha-entity-picker
            label="${localize('editor.settings.grid-buy')} (${localize('editor.optional')})"
            allow-custom-entity
            hideClearIcon
            .hass=${this.hass}
            .configValue=${'grid_buy_entity'}
            .value=${this.config.grid_buy_entity || ''}
            @value-changed=${this._valueChanged}
          ></ha-entity-picker>
          <ha-entity-picker
            label="${localize('editor.settings.grid-sell')} (${localize('editor.optional')})"
            allow-custom-entity
            hideClearIcon
            .hass=${this.hass}
            .configValue=${'grid_sell_entity'}
            .value=${this.config.grid_sell_entity || ''}
            @value-changed=${this._valueChanged}
          ></ha-entity-picker>
        `;
      default:
        return html``;
    }
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this.config || !this.hass) {
      return;
    }

    const target = ev.target! as EditorTarget;

    const value = target.checked !== undefined ? target.checked : ev.detail.value || target.value || ev.detail.config;
    const configValue = target.configValue;
    // Skip if no configValue or value is the same
    if (!configValue || this.config[configValue] === value) {
      return;
    }

    fireEvent<EntitySettings>(this, 'config-changed', { ...this.config, [configValue]: value });
  }

  private _colorChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this.config || !this.hass) {
      return;
    }

    const target = ev.target! as EditorTarget;

    const value = target.value;
    const configValue = target.configValue;
    if (!configValue) return;
    // Split configvalue
    const [thing, step] = configValue.split('.');

    const color_set = { ...this.config[thing] };
    color_set[step] = value;

    // Skip if no configValue or value is the same
    if (!configValue || this.config[thing] === color_set) return;

    fireEvent<EntitySettings>(this, 'config-changed', { ...this.config, [thing]: color_set });
  }

  static get styles(): CSSResult {
    return css`
      .checkbox {
        display: flex;
        align-items: center;
        padding: 8px 0;
      }
      .checkbox input {
        height: 20px;
        width: 20px;
        margin-left: 0;
        margin-right: 8px;
      }
      h3 {
        margin-bottom: 0.5em;
      }
      .row {
        margin-bottom: 12px;
        margin-top: 12px;
        display: block;
      }
      .side-by-side {
        display: flex;
      }
      .side-by-side > * {
        flex: 1 1 0%;
        padding-right: 4px;
      }
    `;
  }
}
