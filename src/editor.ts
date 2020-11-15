import {
  LitElement,
  customElement,
  property,
  TemplateResult,
  html,
  internalProperty,
  PropertyValues,
  CSSResult,
  css,
} from 'lit-element';
import { guard } from 'lit-html/directives/guard';

import Sortable, { AutoScroll, OnSpill, SortableEvent } from 'sortablejs/modular/sortable.core.esm';

import { fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { PDCConfig, HTMLElementValue, CustomValueEvent } from './types';
import { localize } from './localize/localize';

import { DefaultItem, PresetList, PresetObject } from './presets';
/**
 * Editor Settings
 */
const animation = ['none', 'flash', 'slide'];

@customElement('power-distribution-card-editor')
export class PowerDistributionCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() private _config!: PDCConfig;

  public setConfig(config: PDCConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }
    return html`
      <div class="card-config">
        <paper-input
          .label="${localize('editor.title')} (${localize('editor.optional')})"
          .value=${this._config?.title || ''}
          .configValue=${'title'}
          @value-changed=${this._valueChanged}
        ></paper-input>
        <paper-dropdown-menu
          label="${localize('editor.animation')}"
          .configValue=${'animation'}
          @value-changed=${this._valueChanged}
        >
          <paper-listbox slot="dropdown-content" .selected=${animation.indexOf(this._config?.animation || 'flash')}>
            ${animation.map((val) => html`<paper-item>${val}</paper-item>`)}
          </paper-listbox>
        </paper-dropdown-menu>
        ${this._renderEntitiesEditor()}
      </div>
    `;
  }

  private _valueChanged(ev: CustomValueEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    if (ev.target) {
      const target = ev.target;
      if (target.configValue) {
        if (target.index) target.configValue = 'entities[' + target.index + ']' + target.configValue;
        if (target.value === '') {
          delete this._config[target.configValue];
        } else {
          this._config = {
            ...this._config,
            [target.configValue]: target.checked !== undefined ? target.checked : target.value,
          };
        }
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  /**
   * Entities Row Editor
   * -------------------
   * This Row Editor is based on the hui-entities-card-row-editor in homeassistant. (Thanks Zack for your help)
   * If you are interested in using the Editor for your own card, i tried explaining everything with incode documentation
   */

  @internalProperty() private _renderEmptySortable = false;
  private _sortable?: Sortable;

  @internalProperty() private _attached = false;

  /**
   * Generator for all entities in the config.entities list
   * The Guard Function prevents unnecessary rendering
   * @returns HTML for the Entities Editor
   */
  private _renderEntitiesEditor(): TemplateResult {
    return html`
      <h3>
        ${localize('editor.entities')} (${localize('editor.required')})
      </h3>
      <div class="entities">
          ${guard([this._config.entities, this._renderEmptySortable], () =>
            this._renderEmptySortable
              ? ''
              : this._config.entities.map((settings, index) => {
                  return html`
                    <div class="entity">
                      <ha-icon class="handle" icon="mdi:drag"></ha-icon>

                      <ha-entity-picker
                        label="Entity - ${settings.preset}"
                        allow-custom-entity
                        hideClearIcon
                        .configValue="entity"
                        .hass=${this.hass}
                        .value=${settings.entity}
                        .index=${index}
                        @value-changed=${this._valueChanged}
                      ></ha-entity-picker>

                      <mwc-icon-button
                        aria-label=${localize('editor.actions.remove')}
                        class="remove-icon"
                        .index=${index}
                        @click=${this._removeRow}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </mwc-icon-button>

                      <mwc-icon-button
                        aria-label=${localize('editor.actions.edit')}
                        class="edit-icon"
                        .index=${index}
                        @click="this._editRow"
                      >
                        <ha-icon icon="mdi:pencil"></ha-icon>
                      </mwc-icon-button>
                    </div>
                  `;
                }),
          )}
        </div>
      </div>
      <div class="add-item">
        <paper-dropdown-menu
          label="${localize('editor.preset')}"
          name="preset"
          class="add-preset"
          >
          <paper-listbox slot="dropdown-content" .selected=1>
            ${PresetList.map((val) => html`<paper-item>${val}</paper-item>`)}
          </paper-listbox>
        </paper-dropdown-menu>

        <ha-entity-picker .hass=${this.hass} name="entity" class="add-entity"></ha-entity-picker>

        <mwc-icon-button
          aria-label=${localize('editor.actions.add')}
          class="add-icon"
          @click="${this._addEntity}"
          >
          <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
        </mwc-icon-button>
      </div>
    `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this._attached = true;
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._attached = false;
  }

  protected firstUpdated(): void {
    Sortable.mount(OnSpill);
    Sortable.mount(new AutoScroll());
  }

  /**
   * This is for Checking if something relevant has changed and updating variables accordingly
   * @param changedProps The Changed Property Values
   */
  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    const attachedChanged = changedProps.has('_attached');
    const entitiesChanged = changedProps.has('_config');

    if (!entitiesChanged && !attachedChanged) {
      return;
    }

    if (attachedChanged && !this._attached) {
      // Tear down sortable, if available
      this._sortable?.destroy();
      this._sortable = undefined;
      return;
    }

    if (!this._sortable && this._config?.entities) {
      this._createSortable();
      return;
    }

    if (entitiesChanged) {
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

  /**
   * If you add an entity it needs to be appended to the Configuration!
   * In this particular Case the Entity Generation is a bit more complicated and involves Presets
   */
  private async _addEntity(): Promise<void> {
    const preset = (this.shadowRoot?.querySelector('.add-preset') as HTMLElementValue).value || null;
    const entity_id = (this.shadowRoot?.querySelector('.add-entity') as HTMLElementValue).value;
    if (!preset || !entity_id) return;

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
    console.log(newEntities);
    this._valueChanged({ target: { configValue: 'entities', value: newEntities } });
  }
  /**
   * When the Row is removed:
   * @param ev Event containing a Target to remove
   */
  private _removeRow(ev: CustomValueEvent): void {
    const index = ev.currentTarget?.index || 0;
    const newEntities = [...this._config.entities];
    newEntities.splice(index, 1);

    this._valueChanged({ target: { configValue: 'entities', value: newEntities } });
  }
  /**
   * The Second Part comes from here: https://github.com/home-assistant/frontend/blob/dev/src/resources/ha-sortable-style.ts
   * @returns Editor CSS
   */
  static get styles(): CSSResult[] {
    return [
      css`
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
