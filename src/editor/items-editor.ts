import { LitElement, html } from 'lit';

import { EditorTarget, EntitySettings, HTMLElementValue } from '../types';
import { localize } from '../localize/localize';
import { property, state } from 'lit/decorators.js';
import { ITEMS_EDITOR_TAG } from '../card-tags';
import { repeat } from 'lit/directives/repeat.js';
import { css, CSSResult, nothing } from 'lit';
import { mdiClose, mdiPencil, mdiPlusCircleOutline } from '@mdi/js';
import { DefaultItem, PresetList, PresetObject } from '../presets';

import { fireCustomEvent, HomeAssistant } from '../utils';

export class ItemsEditor extends LitElement {
  @property({ attribute: false }) entities?: EntitySettings[];

  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private _selectedPreset: string = PresetList[0];

  private _entityKeys = new WeakMap<EntitySettings, string>();

  private _getKey(action: EntitySettings) {
    if (!this._entityKeys.has(action)) {
      this._entityKeys.set(action, Math.random().toString());
    }

    return this._entityKeys.get(action)!;
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected render() {
    if (!this.entities || !this.hass) {
      return nothing;
    }

    return html`
      <h3>${localize('editor.settings.entities')}</h3>
      <ha-sortable handle-selector=".handle" @item-moved=${this._rowMoved}>
        <div class="entities">
          ${repeat(
            this.entities,
            (entityConf) => this._getKey(entityConf),
            (entityConf, index) => html`
              <div class="entity">
                <div class="handle">
                  <ha-icon icon="mdi:drag"></ha-icon>
                </div>
                <ha-entity-picker
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
            `,
          )}
        </div>
      </ha-sortable>

      
      <div class="add-item row">
        <ha-select
          label="${localize('editor.settings.preset')}"
          class="add-preset"
          .value=${this._selectedPreset}
          .options=${PresetList.map((val) => ({ value: val, label: val }))}
          @selected=${(ev: CustomEvent<{ value: string }>) => { this._selectedPreset = ev.detail.value; }}
        ></ha-select>

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

    newConfigEntities[index] = {
      ...newConfigEntities[index],
      entity: value || '',
    };

    fireCustomEvent<EntitySettings[]>(this, 'config-changed', newConfigEntities);
  }

  private _removeRow(ev: Event): void {
    ev.stopPropagation();
    const index = (ev.currentTarget as EditorTarget).index;
    if (index != undefined) {
      const entities = this.entities!.concat();
      entities.splice(index, 1);
      fireCustomEvent<EntitySettings[]>(this, 'config-changed', entities);
    }
  }

  private _editRow(ev: Event): void {
    ev.stopPropagation();

    const index = (ev.target as EditorTarget).index;
    if (index != undefined) {
      fireCustomEvent<number>(this, 'edit-item', index);
    }
  }

  private _addRow(ev: Event): void {
    ev.stopPropagation();
    if (!this.entities || !this.hass) {
      return;
    }

    const preset = this._selectedPreset || 'placeholder';
    const entity_id = (this.shadowRoot!.querySelector('.add-entity') as HTMLElementValue).value;

    const item = Object.assign({}, DefaultItem, PresetObject[preset], {
      entity: entity_id,
      preset: entity_id == '' ? 'placeholder' : preset,
    });

    fireCustomEvent<EntitySettings[]>(this, 'config-changed', [...this.entities, item]);
  }

  private _rowMoved(ev: CustomEvent<{ oldIndex: number; newIndex: number }>): void {
    ev.stopPropagation();
    const { oldIndex, newIndex } = ev.detail;
    if (oldIndex === newIndex || !this.entities) return;

    const newEntities = this.entities.concat();
    newEntities.splice(newIndex, 0, newEntities.splice(oldIndex, 1)[0]);

    fireCustomEvent<EntitySettings[]>(this, 'config-changed', newEntities);
  }

  static get styles(): CSSResult {
    return css`
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
      .entities {
        margin-bottom: 8px;
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

customElements.define(ITEMS_EDITOR_TAG, ItemsEditor);