import { LitElement, html, customElement, property, state } from 'lit-element';
import Sortable, { SortableEvent } from 'sortablejs/modular/sortable.core.esm';

import { fireEvent, HomeAssistant } from 'custom-card-helpers';
import { EditorTarget, EntitySettings, HTMLElementValue } from '../types';
import { localize } from '../localize/localize';
import { guard } from 'lit/directives/guard';
import { css, CSSResult, PropertyValues, TemplateResult } from 'lit';
import { mdiClose, mdiPencil, mdiPlusCircleOutline } from '@mdi/js';
import { DefaultItem, PresetList, PresetObject } from '../presets';

@customElement('power-distribution-card-items-editor')
export class ItemsEditor extends LitElement {

    @property({ attribute: false }) config?: EntitySettings[];

    @property({ attribute: false }) hass?: HomeAssistant;
    // Optional Callback called when the edit button is pressed
    @property({ attribute: false }) edit_callback?: (index: number) => void;

    @state() private _renderEmptySortable = false;
    private _sortable?: Sortable;

    protected async firstUpdated(): Promise<void> {
        await this.updateComplete;
        this._createSortable();
    }

    protected updated(changedProps: PropertyValues) : void {
        super.updated(changedProps);

        const entitiesChanged = changedProps.has('config');
        if (!entitiesChanged) {
        return;
        }

        if (!this._sortable && this.config) {
            this._createSortable();
            return;
        }

        if (entitiesChanged) {
            this._handleEntitiesChanged();
        }
    }

    protected render(): TemplateResult {
        if (!this.hass || !this.config) {
            return html``;
        }

        return html`
            <h3>
                ${localize('editor.settings.entities')}
            </h3>
            <div class="entities">
                ${guard([this.config, this._renderEmptySortable], () =>
                    this._renderEmptySortable || !this.config
                    ? ''
                    : this.config.map((settings, i) => {
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
                                @value-changed=${this._valueChanged}
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
            @click="${this._addRow}"
            ></ha-icon-button>
            </div>
        `;
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

    private _valueChanged(ev: CustomEvent): void {
        ev.stopPropagation();
        if (!this.config || !this.hass) {
            return;
        }

        const target = ev.target! as EditorTarget;

        const value = 
            target.checked !== undefined
                ? target.checked
                : target.value || ev.detail.config || ev.detail.value;
        
        const configValue = target.configValue;
        // Skip if no configValue or value is the same
        if (!configValue || this.config[configValue] === value) {
            return;
        }

        fireEvent(this, 'config-changed', { config: { ...this.config, [configValue]: value }});
    }

    private _removeRow(ev: CustomEvent): void {
        ev.stopPropagation();
        if (!this.config) {
            return;
        }

        const index = (ev.target as EditorTarget).index;
        if (index) {
            fireEvent(this, 'config-changed', { config: this.config.filter((_, i) => i !== index) });
        }
    }

    private _editRow(ev: CustomEvent): void {
        ev.stopPropagation();

        const index = (ev.target as EditorTarget).index;
        if (index && this.edit_callback) {
            this.edit_callback(index);
        }
    }

    private _addRow(ev: CustomEvent): void {
        ev.stopPropagation();
        if (!this.config || !this.hass) {
            return;
        }

        const preset = (this.shadowRoot!.querySelector('.add-preset') as  HTMLElementValue).value;
        const entity_id = (this.shadowRoot!.querySelector('.add-entity') as  HTMLElementValue).value;
        
        const item = Object.assign(
            {},
            DefaultItem,
            PresetObject[preset],
            { entity: entity_id, preset: entity_id == '' ? 'placeholder' : preset }
        );

        fireEvent(this, 'config-changed', { config: [...this.config, item] });
    }

    private _rowMoved(ev: SortableEvent): void {
        if (ev.oldIndex === ev.newIndex || !this.config) return;
        
        const newConfig = [...this.config];
        newConfig.splice(ev.newIndex, 0, newConfig.splice(ev.oldIndex, 1)[0]);
        fireEvent(this, 'config-changed', { config: newConfig });
    }

    static get styles():CSSResult {
        return css`
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
        `;
    }
}