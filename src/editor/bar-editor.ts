import { LitElement, html, css, nothing, CSSResultGroup } from 'lit';
import { property, state } from 'lit/decorators.js';
import { BAR_EDITOR_TAG } from '../card-tags';



import { BarSettings } from '../types';
import { localize } from '../localize/localize';
import { HaFormSchema } from './ha-form';
import { mdiDelete, mdiPlus } from '@mdi/js';
import { deepEqual } from '../deep-equal';
import { fireCustomEvent, HomeAssistant } from '../utils';

const BAR_PRESETS = ['autarky', 'ratio', ''];

const SCHEMA: HaFormSchema[] = [
    { name: "entity", selector: { entity: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "name", selector: { text: {} } },
            { name: "preset", selector: { select: { options: BAR_PRESETS, mode: 'dropdown' } } },
        ]
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "lower_bound", selector: { number: {} } },
            { name: "upper_bound", selector: { number: {} } },
        ]
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "bar_color", selector: { ui_color: {} } },
            { name: "bar_bg_color", selector: { ui_color: {} } },
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



export class ItemEditor extends LitElement {

    @property({ attribute: false }) hass?: HomeAssistant;

    @property({ attribute: false }) config?: BarSettings[];

    @state() protected _selectedCard = 0;

    private _computeLabel = (schema: HaFormSchema) => {
        const nameMap: Record<string, string> = {
            bar_color: 'color',
            bar_bg_color: 'background_color',
        };
        const name = nameMap[schema.name] ?? schema.name;
        return localize('editor.settings.' + name);
    };

    protected render() {

        if (!this.hass || !this.config) {
            return nothing;
        }

        const selected = this._selectedCard!;
        const numBars = this.config.length;

        return html`
            <div class="card-config">
                <div class="toolbar">
                <ha-tab-group @wa-tab-show=${this._selectBar}>
                    ${this.config.map(
            (_card, i) => html`
                        <ha-tab-group-tab
                            slot="nav"
                            .panel=${i}
                            .active=${i === selected}
                        >${i + 1}</ha-tab-group-tab>`
        )}
                </ha-tab-group>
                <ha-icon-button
                    id="add-bar"
                    .path=${mdiPlus}
                    @click=${this._addBar}
                ></ha-icon-button>
                </div>
            </div>

            <div id="editor">
                <div id="bar-options">
                    <ha-icon-button-arrow-prev
                        .disabled=${selected === 0}
                        .label=${this.hass.localize(
            "ui.panel.lovelace.editor.edit_card.move_before"
        )}
                        @click=${this._moveLeft}
                        .move=${-1}
                    ></ha-icon-button-arrow-prev>

                    <ha-icon-button-arrow-next
                        .label=${this.hass.localize(
            "ui.panel.lovelace.editor.edit_card.move_after"
        )}
                        .disabled=${selected === numBars - 1}
                        @click=${this._moveRight}
                        .move=${1}
                    ></ha-icon-button-arrow-next>

                    <ha-icon-button
                        .label=${this.hass.localize(
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
                    .computeLabel=${this._computeLabel}
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

    protected _selectBar(ev: CustomEvent<{ name: string }>) {
        this._selectedCard = parseInt(ev.detail.name, 10);
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
              justify-content: space-between;
              align-items: center;
            }
            ha-tab-group {
              flex-grow: 1;
              min-width: 0;
              --ha-tab-track-color: var(--card-background-color);
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

customElements.define(BAR_EDITOR_TAG, ItemEditor);