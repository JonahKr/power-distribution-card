import { LitElement, TemplateResult, html, css, CSSResultGroup, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';


import { mdiClose, mdiPencil } from '@mdi/js';

import { fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import {
  PDCConfig,
  SubElementConfig,
  BarSettings,
  HassCustomElement,
  EntitySettings,
  CustomValueEvent,
} from '../types';
import { computeLabel, localize } from '../localize/localize';

import './item-editor';
import './items-editor';
import './bar-editor';

import { loadHaComponents } from '../utils/ha-component-loader';
import { HaFormSchema } from './ha-form';

/**
 * Editor Settings
 */
const animation = ['none', 'flash', 'slide'];
const center = ['none', 'card', 'bars'];

const actions = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'none'];

type EditorType = 'main' | 'item' | 'bars' | 'card';

type Editor = {
  type: EditorType;
  index?: number;
}

const SCHEMA: HaFormSchema[] = [
  { name: 'title', selector: { text: {} } },
  { name: 'animation', selector: { select: { options: animation, mode: 'dropdown' } }, required: true },
];

@customElement('power-distribution-card-editor')
export class PowerDistributionCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config!: PDCConfig;
  @state() private _activeEditor: Editor = { type: 'main' };

  public setConfig(config: PDCConfig) {
    this._config = config;
  }

  protected firstUpdated() {
    loadHaComponents();
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;

    if (this._activeEditor.type === 'main') {
      return this._renderMainEditor();
    }

    // All Subpages get an additional header
    const content: (TemplateResult | typeof nothing)[] = [
      html`
        <div class="header">
          <div class="back-title">
            <mwc-icon-button @click=${this._goBack}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </mwc-icon-button>
          </div>
        </div>`,
    ];

    switch (this._activeEditor.type) {
      case 'item':
        content.push(this._renderItemEditor());
        break;
      case 'bars':
        content.push(this._renderBarEditor());
        break;
      case 'card':
        return this._renderCardEditor();
    }
    return html`${content}`;
  }

  protected _enableCenterEditor(ev: any): void {
    ev.stopPropagation();

    this._activeEditor = { type: ev.currentTarget.value };
  }

  protected _enableItemEditor(ev: any): void {
    ev.stopPropagation();

    this._activeEditor = {
      type: 'item',
      index: ev.detail,
    };
  }

  protected _goBack(): void {
    this._activeEditor = { type: 'main' };
  }

  protected _valueChanged(ev: CustomValueEvent<unknown>) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const detail = ev.detail;
    if (target && detail) {
      if (target.configValue) {
        let value: any = detail;

        // Specific Case
        if (target.configValue == 'center.type') {
          value = target.value;
        }

        // We split the target configValue by '.' to allow for nested config values of depth 1
        const configValues = target.configValue.split('.');

        this._config = {
          ...this._config,
          [configValues[0]]: configValues.length > 1 ? {
            ...this._config[configValues[0]],
            [configValues[1]]: value,
          } : value,
        };

      } else {
        // Assuming a return from ha-form
        this._config = detail.value as PDCConfig;
      }
      console.log("New Config:");
      console.log(this._config);

      fireEvent(this, 'config-changed', { config: this._config });
    }
  }


  protected _renderMainEditor(): TemplateResult {

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>

      <br />
      <div class="entity row">
        <ha-select
          label="${localize('editor.settings.center')}"
          .configValue=${'center.type'}
          @selected=${this._valueChanged}
          @closed=${(ev) => ev.stopPropagation()}
          .value=${this._config?.center?.type || 'none'}
        >
          ${center.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
        </ha-select>
        ${this._config?.center?.type != 'none'
        ? html`<ha-icon-button
              class="edit-icon"
              .value=${this._config?.center?.type}
              .path=${mdiPencil}
              @click="${this._enableCenterEditor}"
            ></ha-icon-button>`
        : ''}
        </div>
        <br />
        <power-distribution-card-items-editor
          .hass=${this.hass}
          .entities=${this._config.entities}
          .configValue=${'entities'}
          @edit-item=${this._enableItemEditor}
          @config-changed=${this._valueChanged}
        >
        </power-distribution-card-items-editor>
      </div>
    `;
  }

  protected _renderItemEditor() {
    const index = this._activeEditor.index;
    if (index == undefined) {
      return nothing;
    }

    return html`
      <power-distribution-card-item-editor
        .hass=${this.hass}
        .config=${this._config.entities[index]}
        @config-changed=${this._itemChanged}
      >
      </power-distribution-card-item-editor>
    `;
  }

  /**
   * Bar Editor
   * -------------------
   * This Bar Editor allows the user to easily add and remove new bars.
   */
  protected _renderBarEditor() {
    return html`
      <power-distribution-card-bar-editor
        .hass=${this.hass}
        .config=${this._config.center.content as BarSettings[]}
        .configValue=${'center.content'}
        @config-changed=${this._valueChanged}
      >
      </power-distribution-card-bar-editor>
    `;
  }

  protected log(ev) {
    console.log("PRTN", ev);
    console.log(ev.target);
    console.log(ev.detail);
    console.log(ev.target.configValue);
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
            .config=${this._config.entities[this._subElementEditor?.index || 0]}
            @config-changed=${this._itemChanged}
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

  private _itemChanged(ev: CustomEvent<EntitySettings>) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const index = this._subElementEditor?.index;
    if (index != undefined) {
      const entities = [...this._config.entities];
      entities[index] = ev.detail;
      fireEvent(this, 'config-changed', { config: { ...this._config, entities: entities } });
    }
  }

  /**
   * TODO: Get rid of duplicated Updating functions
   * Custom handeling for Center panel
   */
  private _centerChanged(ev: any): void {
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
