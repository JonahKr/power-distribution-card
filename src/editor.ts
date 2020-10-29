import { LitElement, customElement, property, TemplateResult, html } from 'lit-element';
import { guard } from 'lit-html/directives/guard';

import { fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { EntitySettings, PDCConfigInternal } from './types';
import { localize } from './localize/localize';

@customElement('power-distribution-card-editor')
export class PowerDistributionCardEditor extends LitElement implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: PDCConfigInternal;

  public setConfig(config: PDCConfigInternal): void {
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
        <div class="entities">
          ${guard([this._config?.entities, this._renderEmptySortable], () =>
            this._renderEmptySortable
              ? ''
              : this._config?.entities?.map((entityConf, index) => {
                  return html`
                    <div class="entity">
                      <ha-svg-icon class="handle" icon="mdi:drag"></ha-svg-icon>

                      <ha-entity-picker
                        allow-custom-entity
                        hideClearIcon
                        .hass=${this.hass}
                        .value=${entityConf.entity}
                        .index=${index}
                        @value-changed=${this._valueChanged}
                      ></ha-entity-picker>

                      <mwc-icon-button
                        aria-label=${localize('editor.actions.remove')}
                        class="remove-icon"
                        .index=${index}
                        @click=${this._removeRow}
                      >
                        <ha-svg-icon icon="mdi:close"></ha-svg-icon>
                      </mwc-icon-button>
                      <mwc-icon-button
                        aria-label=${localize('editor.actions.edit')}
                        class="edit-icon"
                        .index=${index}
                        @click=${this._editRow}
                      >
                        <ha-svg-icon icon="mdi:pencil"></ha-svg-icon>
                      </mwc-icon-button>
                    </div>
                  `;
                }),
          )}
        </div>
      </div>
      <ha-entity-picker .hass=${this.hass} @value-changed=${this._addEntity}></ha-entity-picker>
    `;
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }
}
