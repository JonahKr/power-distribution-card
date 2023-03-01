import { LitElement, html, customElement, property, state } from 'lit-element';

import { fireEvent, HomeAssistant } from 'custom-card-helpers';
import { EditorTarget, EntitySettings, HTMLElementValue } from '../types';
import { localize } from '../localize/localize';
import { repeat } from "lit/directives/repeat.js";
import { css, CSSResult, PropertyValues, TemplateResult, nothing } from 'lit';
import { mdiClose, mdiPencil, mdiPlusCircleOutline } from '@mdi/js';
import { DefaultItem, PresetList, PresetObject } from '../presets';

import Sortable from "sortablejs";
import SortableCore, {
  OnSpill,
  AutoScroll,
  SortableEvent
} from "sortablejs/modular/sortable.core.esm";

SortableCore.mount(OnSpill, new AutoScroll());


@customElement('power-distribution-card-items-editor')
export class ItemsEditor extends LitElement {

  @property({ attribute: false }) entities?: EntitySettings[];

  @property({ attribute: false }) hass?: HomeAssistant;
  // Optional Callback called when the edit button is pressed
  @property({ attribute: false }) edit_callback?: (index: number) => void;

  private _sortable?: Sortable;

  private _entityKeys = new WeakMap<EntitySettings, string>();

  private _getKey(action: EntitySettings) {
    if (!this._entityKeys.has(action)) {
      this._entityKeys.set(action, Math.random().toString());
    }

    return this._entityKeys.get(action)!;
  }

  public disconnectedCallback() {
    this._destroySortable();
  }

  private _destroySortable() {
    this._sortable?.destroy();
    this._sortable = undefined;
  }

  protected async firstUpdated(): Promise<void> {
    this._createSortable();
  }

  /**
 * Creating the Sortable Element (https://github.com/SortableJS/sortablejs) used as a foundation
 */
  private _createSortable(): void {
    this._sortable = new Sortable(
      this.shadowRoot!.querySelector('.entities')!,
      {
        animation: 150,
        fallbackClass: 'sortable-fallback',
        handle: '.handle',
        onChoose: (evt: SortableEvent) => {
          (evt.item as any).placeholder =
            document.createComment("sort-placeholder");
          evt.item.after((evt.item as any).placeholder);
        },
        onEnd: (evt: SortableEvent) => {
          // put back in original location
          if ((evt.item as any).placeholder) {
            (evt.item as any).placeholder.replaceWith(evt.item);
            delete (evt.item as any).placeholder;
          }
          this._rowMoved(evt);
        },
      });
  }

  protected render() {
    if (!this.entities || !this.hass) {
      return nothing;
    }

    return html`
          <h3>
              ${localize('editor.settings.entities')}
          </h3>
          <div class="entities">
              ${repeat(
      this.entities,
      (entityConf) => this._getKey(entityConf),
      (entityConf, index) => html`
                  <div class="entity">
                    <div class="handle" >
                      <ha-icon icon="mdi:drag"></ha-icon>
                    </div>
                    <ha-entity-picker
                        label="Entity - ${entityConf.preset}"
                        allow-custom-entity
                        hideClearIcon
                        .hass=${this.hass}
                        .configValue=${'entity'}
                        .value=${entityConf.entity}
                        .index=${index}
                        @value-changed=${this._valueChanged}
                    ></ha-entity-picker>

                    <ha-icon-button
                        .label=${localize('editor.actions.remove')}
                        .path=${mdiClose}
                        class="remove-icon"
                        .index=${index}
                        @click=${this._removeRow}
                    ></ha-icon-button>

                    <ha-icon-button
                        .label=${localize('editor.actions.edit')}
                        .path=${mdiPencil}
                        class="edit-icon"
                        .index=${index}
                        @click="${this._editRow}"
                    ></ha-icon-button>
                  </div>
                  `

    )
      }
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

  private _valueChanged(ev: CustomEvent): void {
    if (!this.entities || !this.hass) {
      return;
    }

    const value = ev.detail.value;
    const index = (ev.target as any).index;
    const newConfigEntities = this.entities!.concat();

    if (value === "" || value === undefined) {
      newConfigEntities.splice(index, 1);
    } else {
      newConfigEntities[index] = {
        ...newConfigEntities[index],
        entity: value!,
      };
    }
    fireEvent(this, 'config-changed', { config: newConfigEntities });
  }

  private _removeRow(ev: CustomEvent): void {
    ev.stopPropagation();
    const index = (ev.currentTarget as any).index;
    const newConfigEntities = this.entities!.concat();
    newConfigEntities.splice(index, 1);
    if (index) {
      fireEvent(this, 'config-changed', { config: newConfigEntities });
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
    if (!this.entities || !this.hass) {
      return;
    }

    const preset = (this.shadowRoot!.querySelector('.add-preset') as HTMLElementValue).value;
    const entity_id = (this.shadowRoot!.querySelector('.add-entity') as HTMLElementValue).value;

    const item = Object.assign(
      {},
      DefaultItem,
      PresetObject[preset],
      { entity: entity_id, preset: entity_id == '' ? 'placeholder' : preset }
    );

    fireEvent(this, 'config-changed', { config: [...this.entities, item] });
  }

  private _rowMoved(ev: SortableEvent): void {
    ev.stopPropagation();
    if (ev.oldIndex === ev.newIndex || !this.entities) return;

    const newEntities = this.entities.concat();
    newEntities.splice(ev.newIndex!, 0, newEntities.splice(ev.oldIndex!, 1)[0]);
    fireEvent(this, 'config-changed', { config: newEntities });
  }

  static get styles(): CSSResult {
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
        paper-icon-item.hidden-panel ha-icon[slot="item-icon"] {
          color: var(--secondary-text-color);
          cursor: pointer;
        }
        .entity,
        .add-item {
          display: flex;
          align-items: center;
        }
        .entity {
          display: flex;
          align-items: center;
        }
        .entity .handle {
          padding-right: 8px;
          cursor: move;
          padding-inline-end: 8px;
          padding-inline-start: initial;
          direction: var(--direction);
        }
        .entity .handle > * {
          pointer-events: none;
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
        `;
  }
}