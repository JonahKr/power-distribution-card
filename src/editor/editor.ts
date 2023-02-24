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
        ${this._renderEntitiesEditor()}
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
      html`<div class="header">
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
    this._sortable?.destroy();
    this._sortable = undefined;
    this._sortable = this._createSortable();
  }

  /**
   * This enables support for changing the entity_ids using the ha-entity pickers in each row directly as well as the entity Editor itsself
   * @param ev Value Event containing the index and value of the changed element
   */
  private _itemEntityChanged(ev: CustomValueEvent): void {
    if (!ev.target) return;
    const target = ev.target;
    if (!target.configValue) return;

    // Extracting event Data
    const index = target.i || this._subElementEditor?.index || 0;
    const configValue = target.configValue.split('.');
    const value = target.checked != undefined ? target.checked : ev.detail?.value || target.value;

    const configItem = this._config.entities[index][configValue[0]] || undefined;

    if ((configItem ? (configValue[1] ? configItem[configValue[1]] : configItem) : undefined) == value) {
      return;
    }
    const configEntities = [...this._config.entities];

    configEntities[index] = {
      ...configEntities[index],
      [configValue[0]]: configValue[1] ? { ...configEntities[index][configValue[0]], [configValue[1]]: value } : value,
    };
    fireEvent(this, 'config-changed', { config: { ...this._config, entities: configEntities } });
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

  /**
   * Entities Row Editor
   * -------------------
   * This Row Editor is based on the hui-entities-card-row-editor in homeassistant. (Thanks Zack for your help)
   * If you are interested in using the Editor for your own card, i tried explaining everything with incode documentation
   */

  @state() private _renderEmptySortable = false;
  private _sortable?: Sortable;

  /**
   * Generator for all entities in the config.entities list
   * The Guard Function prevents unnecessary rendering
   * @returns HTML for the Entities Editor
   */
  private _renderEntitiesEditor(): TemplateResult {
    return html`
      <h3>
        ${localize('editor.settings.entities')}
      </h3>
      <div class="entities">
          ${guard([this._config.entities, this._renderEmptySortable], () =>
            this._renderEmptySortable
              ? ''
              : this._config.entities.map((settings, i) => {
                  return html`
                    <div class="entity">
                      <ha-icon class="handle" icon="mdi:drag"></ha-icon>

                      <ha-entity-picker
                        label="Entity - ${settings.preset}"
                        allow-custom-entity
                        hideClearIcon
                        .hass=${this.hass}
                        .configValue=${'entity'}
                        .value=${settings.entity}
                        .i=${i}
                        @value-changed=${this._itemEntityChanged}
                      ></ha-entity-picker>

                      <ha-icon-button
                        .label=${localize('editor.actions.remove')}
                        .path=${mdiClose}
                        class="remove-icon"
                        .i=${i}
                        @click=${this._removeRow}
                      ></ha-icon-button>

                      <ha-icon-button
                        .label=${localize('editor.actions.edit')}
                        .path=${mdiPencil}
                        class="edit-icon"
                        .i=${i}
                        @click="${this._editRow}"
                      ></ha-icon-button>
                    </div>
                  `;
                }),
          )}
        </div>
      </div>
      <div class="add-item row">
        <ha-select
          label="${localize('editor.settings.preset')}"
          name="preset"
          class="add-preset"
          naturalMenuWidth
          fixedMenuPosition
          @closed=${(ev) => ev.stopPropagation()}
          >
            ${PresetList.map((val) => html`<mwc-list-item .value=${val}>${val}</mwc-list-item>`)}
        </ha-select>

        <ha-entity-picker .hass=${this.hass} name="entity" class="add-entity"></ha-entity-picker>

        <ha-icon-button
          .label=${localize('editor.actions.add')}
          .path=${mdiPlusCircleOutline}
          class="add-icon"
          @click="${this._addEntity}"
          ></ha-icon-button>
      </div>
    `;
  }

  /**
   * This is for Checking if something relevant has changed and updating variables accordingly
   * @param changedProps The Changed Property Values
   */
  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    const entitiesChanged = changedProps.has('_config');
    if (!entitiesChanged) {
      return;
    }

    if (!this._sortable && this._config?.entities) {
      this._createSortable();
      return;
    }

    if (entitiesChanged && this._subElementEditor == undefined) {
      this._handleEntitiesChanged();
    }
  }
  /**
   * Since we have the guard function enabled to prevent unecessary renders, we need to handle switched rows seperately.
   */
  private async _handleEntitiesChanged(): Promise<void> {
    this._renderEmptySortable = true;
    await this.updateComplete;
    const container = this.shadowRoot?.querySelector('.entities') as HTMLElement;
    while (container.lastElementChild) {
      container.removeChild(container.lastElementChild);
    }
    this._renderEmptySortable = false;
  }

  /**
   * Creating the Sortable Element (https://github.com/SortableJS/sortablejs) used as a foundation
   */
  private _createSortable(): void {
    const element = this.shadowRoot?.querySelector('.entities') as HTMLElement;
    if (!element) return;
    this._sortable = new Sortable(element, {
      animation: 150,
      fallbackClass: 'sortable-fallback',
      handle: '.handle',
      onEnd: async (evt: SortableEvent) => this._rowMoved(evt),
    });
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
   * If you add an entity it needs to be appended to the Configuration!
   * In this particular Case the Entity Generation is a bit more complicated and involves Presets
   */
  private async _addEntity(): Promise<void> {
    // Fetching states from inpout fields
    let preset = (this.shadowRoot?.querySelector('.add-preset') as HTMLElementValue).value || null;
    let entity_id = (this.shadowRoot?.querySelector('.add-entity') as HTMLElementValue).value;
    // Adding an empty palceholder
    if (!preset || !entity_id) {
      preset = 'placeholder';
      entity_id = '';
    }
    const item = Object.assign({}, DefaultItem, PresetObject[preset], { entity: entity_id, preset: preset });
    const newEntities = this._config.entities.concat(item);
    //This basically fakes a event object
    this._valueChanged({ target: { configValue: 'entities', value: newEntities } });
  }

  /**
   * Handeling if the User drags elements to a different position in the list.
   * @param ev Event containing old index, new index
   */
  private _rowMoved(ev: SortableEvent): void {
    if (ev.oldIndex === ev.newIndex) return;

    const newEntities = [...this._config.entities];
    newEntities.splice(ev.newIndex, 0, newEntities.splice(ev.oldIndex, 1)[0]);

    this._valueChanged({ target: { configValue: 'entities', value: newEntities } });
  }
  /**
   * When the Row is removed:
   * @param ev Event containing a Target to remove
   */
  private _removeRow(ev: CustomValueEvent): void {
    const index = ev.currentTarget?.i || 0;
    const newEntities = [...this._config.entities];
    newEntities.splice(index, 1);

    this._valueChanged({ target: { configValue: 'entities', value: newEntities } });
  }
  /**
   * When the Row is edited:
   * @param ev Event containing a Target to remove
   */
  private _editRow(ev: CustomValueEvent): void {
    const index = ev.currentTarget?.i || 0;

    this._subElementEditor = {
      type: 'entity',
      index: index,
    };
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
        }
      `,
      css`
        #sortable a:nth-of-type(2n) paper-icon-item {
          animation-name: keyframes1;
          animation-iteration-count: infinite;
          transform-origin: 50% 10%;
          animation-delay: -0.75s;
          animation-duration: 0.25s;
        }
        #sortable a:nth-of-type(2n-1) paper-icon-item {
          animation-name: keyframes2;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          transform-origin: 30% 5%;
          animation-delay: -0.5s;
          animation-duration: 0.33s;
        }
        #sortable a {
          height: 48px;
          display: flex;
        }
        #sortable {
          outline: none;
          display: block !important;
        }
        .hidden-panel {
          display: flex !important;
        }
        .sortable-fallback {
          display: none;
        }
        .sortable-ghost {
          opacity: 0.4;
        }
        .sortable-fallback {
          opacity: 0;
        }
        @keyframes keyframes1 {
          0% {
            transform: rotate(-1deg);
            animation-timing-function: ease-in;
          }
          50% {
            transform: rotate(1.5deg);
            animation-timing-function: ease-out;
          }
        }
        @keyframes keyframes2 {
          0% {
            transform: rotate(1deg);
            animation-timing-function: ease-in;
          }
          50% {
            transform: rotate(-1.5deg);
            animation-timing-function: ease-out;
          }
        }
        .show-panel,
        .hide-panel {
          display: none;
          position: absolute;
          top: 0;
          right: 4px;
          --mdc-icon-button-size: 40px;
        }
        :host([rtl]) .show-panel {
          right: initial;
          left: 4px;
        }
        .hide-panel {
          top: 4px;
          right: 8px;
        }
        :host([rtl]) .hide-panel {
          right: initial;
          left: 8px;
        }
        :host([expanded]) .hide-panel {
          display: block;
        }
        :host([expanded]) .show-panel {
          display: inline-flex;
        }
        paper-icon-item.hidden-panel,
        paper-icon-item.hidden-panel span,
        paper-icon-item.hidden-panel ha-icon[slot='item-icon'] {
          color: var(--secondary-text-color);
          cursor: pointer;
        }
      `,
    ];
  }
}
