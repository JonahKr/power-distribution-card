import { LitElement, TemplateResult, html, css, CSSResult, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ITEM_EDITOR_TAG } from '../card-tags';

import { EditorTarget, EntitySettings } from '../types';
import { computeLabel, localize } from '../localize/localize';
import { PresetList } from '../presets';
import { actions } from '../action-handler';
import { HaFormSchema } from './ha-form';
import { fireEvent, HomeAssistant } from '../utils';

const  SCHEMA: HaFormSchema[] = [
  {
    name: "entity",
    selector: { entity: { domain: "sensor"} }
  },
  {
    type: "grid",
    name: "",
    schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "attribute", selector: { attribute: {}}, context: { filter_entity: "entity" } },
        { name: "preset", selector: { select: { options: PresetList as any as string[], mode: 'dropdown' } } },
    ]
  },
  {
    name: "Value Settings",
    type: "expandable",
    flatten: true,
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
            { name: "color_threshold", selector: { number: { } } },
        ]
      }
    ]
  },
  {
    name: "Secondary Info",
    type: "expandable",
    flatten: true,
    title: localize('editor.settings.secondary_info', true),
    schema: [
      { name: "secondary_info_entity",
        selector: { entity: { domain: "sensor"} } },
      {
        type: "grid",
        name: "",
        schema: [
            { name: "secondary_info_attribute", selector: { attribute: {}}},
        ]
      },
      { name: "secondary_info_replace_name", type: "boolean"},
    ]
  },
  {
    name: "Action Settings",
    type: "expandable",
    flatten: true,
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
    flatten: true,
    title: localize('editor.settings.color_settings', true),
    schema: [
      {
        type: "grid",
        name: "",
        schema: [
          { name: "icon_color_bigger", selector: { ui_color: {} } },
          { name: "icon_color_equal", selector: { ui_color: {} } },
          { name: "icon_color_smaller", selector: { ui_color: {} } },
          { name: "arrow_color_bigger", selector: { ui_color: {} } },
          { name: "arrow_color_equal", selector: { ui_color: {} } },
          { name: "arrow_color_smaller", selector: { ui_color: {} } },
        ]
      }
    ]
  }
];


export class ItemEditor extends LitElement {
  @property({ attribute: false }) config?: EntitySettings;

  @property({ attribute: false }) hass?: HomeAssistant;

  private get _flatConfig() {
    const c = this.config!;
    return {
      ...c,
      icon_color_bigger: c.icon_color?.bigger,
      icon_color_equal: c.icon_color?.equal,
      icon_color_smaller: c.icon_color?.smaller,
      arrow_color_bigger: c.arrow_color?.bigger,
      arrow_color_equal: c.arrow_color?.equal,
      arrow_color_smaller: c.arrow_color?.smaller,
    };
  }

  protected render() {
    // If its a placeholder, don't render anything
    if (!this.hass || !this.config || this.config.preset == 'placeholder') {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._flatConfig}
        .schema=${SCHEMA}
        .computeLabel=${computeLabel}
        @value-changed=${this._formValueChanged}
      ></ha-form>
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

  private _formValueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this.config || !this.hass) return;

    const {
      icon_color_bigger, icon_color_equal, icon_color_smaller,
      arrow_color_bigger, arrow_color_equal, arrow_color_smaller,
      ...rest
    } = ev.detail.value;

    const icon_color = (icon_color_bigger || icon_color_equal || icon_color_smaller)
      ? { bigger: icon_color_bigger || undefined, equal: icon_color_equal || undefined, smaller: icon_color_smaller || undefined }
      : undefined;
    const arrow_color = (arrow_color_bigger || arrow_color_equal || arrow_color_smaller)
      ? { bigger: arrow_color_bigger || undefined, equal: arrow_color_equal || undefined, smaller: arrow_color_smaller || undefined }
      : undefined;

    fireEvent<any>(this, 'config-changed', { ...rest, icon_color, arrow_color });
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

    fireEvent<any>(this, 'config-changed', { ...this.config, [configValue]: value });
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

    fireEvent<any>(this, 'config-changed', { ...this.config, [thing]: color_set });
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

customElements.define(ITEM_EDITOR_TAG, ItemEditor);
