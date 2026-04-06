import { LitElement, html, css, CSSResult, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ITEM_EDITOR_TAG } from '../card-tags';

import { EntitySettings } from '../types';
import { localize } from '../localize/localize';
import { PresetList } from '../presets';
import { HaFormSchema } from './ha-form';
import { fireEvent, HomeAssistant } from '../utils';

const BASE_SCHEMA: HaFormSchema[] = [
  {
    name: "general",
    type: "expandable",
    flatten: true,
    expanded: true,
    title: localize('editor.settings.general_settings', true),
    schema: [
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
            { name: "hide_arrows", type: "boolean"},
            { name: "calc_excluded", type: "boolean"},
            { name: "threshold", selector: { number: { } } },
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
      { name: "secondary_info_attribute", selector: { attribute: {}}, context: { filter_entity: "secondary_info_entity" }},
      { name: "secondary_info_decimals", selector: { number: { step: 1 } } },
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
      { name: "color_threshold", selector: { number: { } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "icon_color_bigger", selector: { ui_color: {} } },
          { name: "arrow_color_bigger", selector: { ui_color: {} } },
          { name: "icon_color_equal", selector: { ui_color: {} } },
          { name: "arrow_color_equal", selector: { ui_color: {} } },
          { name: "icon_color_smaller", selector: { ui_color: {} } },
          { name: "arrow_color_smaller", selector: { ui_color: {} } },
        ]
      }
    ]
  }
];

const PRESET_LABEL_MAP: Record<string, string> = {
  battery_percentage_entity: 'battery_percentage',
  grid_buy_entity: 'grid_buy',
  grid_sell_entity: 'grid_sell',
  secondary_info_decimals: 'decimals',
};


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

  private get _schema(): HaFormSchema[] {
    const preset = this.config?.preset;
    const presetFields: HaFormSchema[] =
      preset === 'battery'
        ? [{ name: 'battery_percentage_entity', selector: { entity: {} } }]
        : preset === 'grid'
        ? [
            { name: 'grid_buy_entity', selector: { entity: {} } },
            { name: 'grid_sell_entity', selector: { entity: {} } },
          ]
        : [];

    if (presetFields.length === 0) return BASE_SCHEMA;

    const presetSection: HaFormSchema = {
      name: 'preset_section',
      type: 'expandable',
      flatten: true,
      title: localize('editor.settings.preset_settings', true),
      schema: presetFields,
    };
    return [BASE_SCHEMA[0], presetSection, ...BASE_SCHEMA.slice(1)];
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const key = PRESET_LABEL_MAP[schema.name] ?? schema.name;
    return `${localize('editor.settings.' + key)} ${!schema.required ? `(${localize('editor.optional')})` : ''}`;
  };

  protected render() {
    // If its a placeholder, don't render anything
    if (!this.hass || !this.config || this.config.preset == 'placeholder') {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._flatConfig}
        .schema=${this._schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._formValueChanged}
      ></ha-form>
    `;
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
