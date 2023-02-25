import { LitElement, TemplateResult, html, PropertyValues, css, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { guard } from 'lit/directives/guard.js';

import { mdiClose, mdiPencil, mdiPlusCircleOutline } from '@mdi/js';
import Sortable, { SortableEvent } from 'sortablejs/modular/sortable.core.esm';

import { fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import {
  PDCConfig,
  HTMLElementValue,
  CustomValueEvent,
  SubElementConfig,
  BarSettings,
  HassCustomElement,
} from '../types';
import { localize } from '../localize/localize';

import { DefaultItem, PresetList, PresetObject } from '../presets';
import { DEV_FLAG } from '../util';
import './item-editor';

/**
 * Editor Settings
 */
const animation = ['none', 'flash', 'slide'];
const center = ['none', 'card', 'bars'];
const bar_presets = ['autarky', 'ratio', ''];
const actions = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'none'];

@customElement('power-distribution-card-editor' + DEV_FLAG)
export class PowerDistributionCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config!: PDCConfig;

  public async setConfig(config: PDCConfig): Promise<void> {
    this._config = config;
    await import('./item-editor')
  }

  /**
   * This Preloads all standard hass components which are not natively avaiable
   * https://discord.com/channels/330944238910963714/351047592588869643/783477690036125747 for more info
   * Update 2022-11-22 : Visual editors in homeassistant have primarily changed to use the ha-form component!
   */
  protected async firstUpdated(): Promise<void> {
    if (!customElements.get('ha-form') || !customElements.get('hui-action-editor')) {
      (customElements.get('hui-button-card') as HassCustomElement)?.getConfigElement();
    }

    if (!customElements.get('ha-entity-picker')) {
      (customElements.get('hui-entities-card') as HassCustomElement)?.getConfigElement();
    }
  }

  protected render(): TemplateResult | void {
    if (!this.hass) return html``;
    if (this._subElementEditor) return this._renderSubElementEditor();
    return html`
      <div class="card-config">
        <ha-textfield
          label="${localize('editor.settings.title')} (${localize('editor.optional')})"
          .value=${this._config?.title || ''}
          .configValue=${'title'}
          @input=${this._valueChanged}
        ></ha-textfield>
        <ha-select
          naturalMenuWidth
          fixedMenuPosition
          label="${localize('editor.settings.animation')}"
          .configValue=${'animation'}
          .value=${this._config?.animation || 'flash'}
          @selected=${this._valueChanged}
          @closed=${(ev: Event) => ev.stopPropagation()}
        >
          ${animation.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
        </ha-select>
        <br />
        <div class="entity row">
          <ha-select
            label="${localize('editor.settings.center')}"
            .configValue=${'type'}
            @selected=${this._centerChanged}
            @closed=${(ev) => ev.stopPropagation()}
            .value=${this._config?.center?.type || 'none'}
          >
            ${center.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
          </ha-select>
          ${this._config?.center?.type == 'bars' || this._config?.center?.type == 'card'
            ? html`<ha-icon-button
                class="edit-icon"
                .value=${this._config?.center?.type}
                .path=${mdiPencil}
                @click="${this._editCenter}"
              ></ha-icon-button>`
            : ''}
        </div>
        <br />
        <power-distribution-card-items-editor
          .hass=${this.hass}
          .config=${this._config.entities}
          @config-changed=${this._entitiesChanged}
        >
        </power-distribution-card-items-editor>
      </div>
    `;
  }
  /**
   * TODO: Get rid of duplicated Updating functions
   * Custom handeling for Center panel
   */
  private _centerChanged(ev: CustomValueEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    if (ev.target) {
      const target = ev.target;
      if (target.configValue) {
        this._config = {
          ...this._config,
          center: {
            ...this._config.center,
            [target.configValue]: target.checked !== undefined ? target.checked : target.value,
          },
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _editCenter(ev: CustomValueEvent): void {
    if (ev.currentTarget) {
      this._subElementEditor = {
        type: <'card' | 'bars'>ev.currentTarget.value,
      };
    }
  }

  /**
   * SubElementEditor
   */

  @state() private _subElementEditor: SubElementConfig | undefined = undefined;

  private _renderSubElementEditor(): TemplateResult {
    const subel: TemplateResult[] = [
      html`
        <div class="header">
          <div class="back-title">
            <mwc-icon-button @click=${this._goBack}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </mwc-icon-button>
          </div>
        </div>`,
    ];
    const index = this._subElementEditor?.index;
    switch (this._subElementEditor?.type) {
      case 'entity':
        subel.push(html`
          <power-distribution-card-item-editor
            .hass=${this.hass}
            .config=${ this._config.entities[this._subElementEditor?.index || 0]}
            @config-changed=${(ev: CustomEvent) => {console.log(ev)}}
          >
          </power-distribution-card-item-editor>
          `);
        break;
      case 'bars':
        subel.push(this._barEditor());
        break;
      case 'card':
        subel.push(this._cardEditor());
        break;
    }
    return html`${subel}`;
  }

  private _goBack(): void {
    this._subElementEditor = undefined;
    // Resetting the entities sortable list
    // this._sortable?.destroy();
    // this._sortable = undefined;
    // this._sortable = this._createSortable();
  }

  /**
   * Bar Editor
   * -------------------
   * This Bar Editor allows the user to easily add and remove new bars.
   */

  private _barChanged(ev: CustomValueEvent): void {
    if (!ev.target) return;
    const target = ev.target;
    if (!target.configValue) return;
    let content: BarSettings[];
    if (target.configValue == 'content') {
      content = target.value as BarSettings[];
    } else {
      content = [...(this._config.center.content as BarSettings[])];
      const index = target.i || this._subElementEditor?.index || 0;
      content[index] = {
        ...content[index],
        [target.configValue]: target.checked != undefined ? target.checked : target.value,
      };
    }

    this._config = { ...this._config, center: { type: 'bars', content: content } };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _removeBar(ev: CustomValueEvent): void {
    const index = ev.currentTarget?.i || 0;
    const newBars = [...(this._config.center.content as BarSettings[])];
    newBars.splice(index, 1);

    this._barChanged({ target: { configValue: 'content', value: newBars } });
  }

  private async _addBar(): Promise<void> {
    const item = Object.assign({}, { name: 'Name', preset: 'custom' });
    const newBars = [...((this._config.center.content as BarSettings[]) || []), <BarSettings>item];
    //This basically fakes a event object
    this._barChanged({ target: { configValue: 'content', value: newBars } });
  }

  private _barEditor(): TemplateResult {
    const editor: TemplateResult[] = [];
    if (this._config.center.content) {
      (this._config.center.content as BarSettings[]).forEach((e, i) =>
        editor.push(html`
        <div class="bar-editor">
          <h3 style="margin-bottom:6px;">Bar ${i + 1}
          <ha-icon-button
            label=${localize('editor.actions.remove')}
            class="remove-icon"
            .i=${i}
            .path=${mdiClose}
            @click=${this._removeBar}
            >
          </ha-icon-button>
          </h4>
          <div class="side-by-side">
            <ha-textfield
              label="${localize('editor.settings.name')} (${localize('editor.optional')})"
              .value=${e.name || ''}
              .configValue=${'name'}
              @input=${this._barChanged}
              .i=${i}
            ></ha-textfield>
            <ha-entity-picker
              label="${localize('editor.settings.entity')}"
              allow-custom-entity
              hideClearIcon
              .hass=${this.hass}
              .configValue=${'entity'}
              .value=${e.entity}
              @value-changed=${this._barChanged}
              .i=${i}
            ></ha-entity-picker>
          </div>
          <div class="side-by-side">
            <div class="checkbox">
              <input
                type="checkbox"
                id="invert-value"
                .checked="${e.invert_value || false}"
                .configValue=${'invert_value'}
                @change=${this._barChanged}
                .i=${i}
              />
              <label for="invert-value"> ${localize('editor.settings.invert-value')}</label>
            </div>
            <div>
            <ha-select
              label="${localize('editor.settings.preset')}"
              .configValue=${'preset'}
              .value=${e.preset || ''}
              @selected=${this._barChanged}
              @closed=${(ev) => ev.stopPropagation()}
              .i=${i}
            >
              ${bar_presets.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
            </ha-select>
          </div>
          </div>
          <div class="side-by-side">
            <ha-textfield
              label="${localize('editor.settings.color')}"
              .value=${e.bar_color || ''}
              .configValue=${'bar_color'}
              @input=${this._barChanged}
              .i=${i}
            ></ha-textfield>
            <ha-textfield
              .label="${localize('editor.settings.background_color')}"
              .value=${e.bar_bg_color || ''}
              .configValue=${'bar_bg_color'}
              @input=${this._barChanged}
              .i=${i}
            ></ha-textfield>
          </div>
          <h3>${localize('editor.settings.action_settings')}</h3>
      <div class="side-by-side">
        <hui-action-editor
          .hass=${this.hass}
          .config=${e.tap_action}
          .actions=${actions}
          .configValue=${'tap_action'}
          @value-changed=${this._barChanged}
          .i=${i}
        >
        </hui-action-editor>
        <hui-action-editor
          .hass=${this.hass}
          .config=${e.double_tap_action}
          .actions=${actions}
          .configValue=${'double_tap_action'}
          @value-changed=${this._barChanged}
          .i=${i}
        >
        </hui-action-editor>
      </div>
        </div>
        <br/>
      `),
      );
    }
    editor.push(html`
      <mwc-icon-button aria-label=${localize('editor.actions.add')} class="add-icon" @click="${this._addBar}">
        <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
      </mwc-icon-button>
    `);
    return html`${editor.map((e) => html`${e}`)}`;
  }

  /**
   * Card Editor
   * -----------
   * The Following is needed to implement the Card editor inside of the editor
   * <hui-card-element-editor
   *    .hass=${this.hass}
   *    .value=${card}
   *    .lovelace=${getLovelace()}
   *    @config-changed=${this._centerChanged}
   *  ></hui-card-element-editor>
   */

  //@query('hui-card-element-editor')
  //private _cardEditorEl?;

  private _cardEditor(): TemplateResult {
    //const card = this._subElementEditor?.element;
    return html`
      Sadly you cannot edit cards from the visual editor yet.
      <p />
      Check out the
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/JonahKr/power-distribution-card#cards-"
        >Readme</a
      >
      to check out the latest and best way to add it.
    `;
  }


  private _valueChanged(ev: CustomValueEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    if (ev.target) {
      const target = ev.target;
      if (target.configValue) {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  /**
   * The Second Part comes from here: https://github.com/home-assistant/frontend/blob/dev/src/resources/ha-sortable-style.ts
   * @returns Editor CSS
   */
  static get styles(): CSSResultGroup[] {
    return [
      css`
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
      `,
      css`
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
        .entity,
        .add-item {
          display: flex;
          align-items: center;
        }
        .entity .handle {
          padding-right: 8px;
          cursor: move;
        }
        .entity ha-entity-picker,
        .add-item ha-entity-picker {
          flex-grow: 1;
        }
        .add-preset {
          padding-right: 8px;
          max-width: 130px;
        }
        .remove-icon,
        .edit-icon,
        .add-icon {
          --mdc-icon-button-size: 36px;
          color: var(--secondary-text-color);
        }
        .secondary {
          font-size: 12px;
          color: var(--secondary-text-color);
        }`,
    ];
  }
}
