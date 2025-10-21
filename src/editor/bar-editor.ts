import { LitElement, html, css, nothing, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { HomeAssistant } from 'custom-card-helpers';

import { BarSettings } from '../types';
import { computeLabel } from '../localize/localize';
import { mdiDelete, mdiPlus } from '@mdi/js';
import { HaFormSchema } from './ha-form';
import { deepEqual } from '../deep-equal';
import { fireCustomEvent } from '../utils';

const BAR_PRESETS = ['autarky', 'ratio', ''];

const SCHEMA: HaFormSchema[] = [
    {
        type: "grid",
        name: "",
        schema: [
            { name: "entity", selector: { entity: {} } },
            { name: "name", selector: { text: {} } },
            { name: "preset", selector: { select: { options: BAR_PRESETS, mode: 'dropdown' } } },
        ]
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "color", selector: { text: {} } },
            { name: "background_color", selector: { text: {}, } },
        ]
    },
    {
        name: "tap_action",
        selector: { ui_action: {} },
    },
    {
        name: "double_tap_action",
        selector: { ui_action: {} },
    }
];



@customElement('power-distribution-card-bar-editor')
export class ItemEditor extends LitElement {

    @property({ attribute: false }) hass?: HomeAssistant;

    @property({ attribute: false }) config?: BarSettings[];

    @state() protected _selectedCard = 0;

    protected render() {

        if (!this.hass || !this.config) {
            return nothing;
        }

        const selected = this._selectedCard!;
        const numBars = this.config.length;

        return html`
            <div class="card-config">
                <div class="toolbar">
                <paper-tabs
                    .selected=${selected}
                    scrollable
                    @iron-activate=${this._selectBar}
                >
                    ${this.config.map(
            (_card, i) => html` <paper-tab> ${i + 1} </paper-tab> `
        )}
                </paper-tabs>
                <paper-tabs
                    id="add-bar"
                    @iron-activate=${this._addBar}
                >
                    <paper-tab>
                    <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>
                    </paper-tab>
                </paper-tabs>
                </div>
            </div>

            <div id="editor">
                <div id="bar-options">
                    <ha-icon-button-arrow-prev
                        .disabled=${selected === 0}
                        .label=${this.hass!.localize(
            "ui.panel.lovelace.editor.edit_card.move_before"
        )}
                        @click=${this._moveLeft}
                        .move=${-1}
                    ></ha-icon-button-arrow-prev>

                    <ha-icon-button-arrow-next
                        .label=${this.hass!.localize(
            "ui.panel.lovelace.editor.edit_card.move_after"
        )}
                        .disabled=${selected === numBars - 1}
                        @click=${this._moveRight}
                        .move=${1}
                    ></ha-icon-button-arrow-next>

                    <ha-icon-button
                        .label=${this.hass!.localize(
            "ui.panel.lovelace.editor.edit_card.delete"
        )}
                        .path=${mdiDelete}
                        @click=${this._delete}
                    ></ha-icon-button>
                </div>

                <ha-form
                    .hass=${this.hass}
                    .data=${this.config[selected]}
                    .schema=${SCHEMA}
                    .computeLabel=${computeLabel}
                    @value-changed=${this.valueChanged}
                ></ha-form>
            </div>
        `;
    }

    protected valueChanged(ev: CustomEvent<{ value: BarSettings }>) {

        ev.stopPropagation();
        if (!this.config || !this.hass) {
            return;
        }

        // Check if value has changed
        if (deepEqual(this.config[this._selectedCard], ev.detail.value)) return;

        // Replace value for current index in readonly config
        this.config = this.config!.map((item, index) =>
            index === this._selectedCard ? ev.detail.value : item);

        fireCustomEvent(this, "config-changed", this.config)
    }

    protected _addBar() {
        if (!this.config) {
            this.config = [{}];
        } else {
            this.config = [...this.config, {}];
        }
        this._selectedCard = this.config.length - 1;
        fireCustomEvent(this, "config-changed", this.config);
    }

    protected _selectBar(ev: CustomEvent<{ selected: string }>) {
        this._selectedCard = parseInt(ev.detail.selected, 10);
    }

    protected _moveRight() {
        if (!this.config || this._selectedCard >= this.config.length - 1) return;

        const newConfig = this.config.slice();
        const movedElement = newConfig.splice(this._selectedCard, 1)[0];
        newConfig.splice(this._selectedCard + 1, 0, movedElement);
        this.config = newConfig;

        this._selectedCard++;
        fireCustomEvent(this, "config-changed", this.config);
    }

    protected _moveLeft() {
        if (!this.config || this._selectedCard === 0) return;

        const newConfig = this.config.slice();
        const movedElement = newConfig.splice(this._selectedCard, 1)[0];
        newConfig.splice(this._selectedCard - 1, 0, movedElement);
        this.config = newConfig;

        this._selectedCard--;
        fireCustomEvent(this, "config-changed", this.config);
    }

    protected _delete() {
        if (!this.config) return;

        const newConfig = this.config.slice();
        newConfig.splice(this._selectedCard, 1);
        this.config = newConfig;

        fireCustomEvent(this, "config-changed", this.config);
    }


    static get styles(): CSSResultGroup {
        return [
            css`
            .toolbar {
              display: flex;
              --paper-tabs-selection-bar-color: var(--primary-color);
              --paper-tab-ink: var(--primary-color);
            }
            paper-tabs {
              display: flex;
              font-size: 14px;
              flex-grow: 1;
            }
            #add-bar {
              max-width: 32px;
              padding: 0;
            }
    
            #bar-options {
              display: flex;
              justify-content: flex-end;
              width: 100%;
            }
    
            #editor {
              border: 1px solid var(--divider-color);
              padding: 12px;
            }
            @media (max-width: 450px) {
              #editor {
                margin: 0 -12px;
              }
            }
          `,
        ];
    }

}