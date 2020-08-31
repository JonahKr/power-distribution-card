const LitElement = Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class e3dcPowerWheelCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entities: { type: Array },
    };
  }

  static get styles() {
    return [
      css`
        * {
          box-sizing: border-box;
        }
        .e3dc-card {
          width: 380px;
          margin: auto;
          padding: 2em 0 2em 0;
        }

        .grid-container {
          display: grid;
          grid-template-columns: 130px 100px 130px;
          gap: 0.5em;
          margin: auto;
        }

        p {
          text-align: center;
          margin: 4px 0 4px 0;
        }

        .grid-header {
          visibility: hidden;
          grid-column-start: 1;
          grid-column-end: 4;
        }

        .overview {
          grid-column: 2;
          grid-row-start: 2;
          grid-row-end: 4;
        }

        .bar-container {
          display: block;
          width: 100%;
          height: 50%;
        }

        .bar-container > div {
          display: inline-block;
          width: 45%;
          vertical-align: middle;
        }

        .item > div {
          display: inline-block;
          vertical-align: middle;
        }

        .icon {
          width: 50%;
          border: gray 1px solid;
          border-radius: 1em;
          float: left;
        }

        .icon > ha-icon {
          width: 40px;
          display: block;
          margin: 0.25em auto 0 auto;
        }

        .value {
          padding: 0 0 0 4px;
        }

        .item:nth-child(2n) > .icon {
          float: right;
        }

        /**************
      ARROW ANIMATION
      **************/
        .arrow > div {
          display: inline-block;
        }

        .blank {
          height: 4px;
          width: 54px;
          background-color: #e3e3e3;
          margin: 8px auto 8px auto;
        }

        .triangle-right {
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-left: 17px solid #e3e3e3;
          border-bottom: 8px solid transparent;
        }

        .triangle-left {
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-right: 17px solid #e3e3e3;
          border-bottom: 8px solid transparent;
        }

        @keyframes flash_triangles {
          0%,
          66% {
            border-left-color: #e3e3e3;
            border-right-color: #e3e3e3;
          }
          33% {
            border-left-color: #555;
            border-right-color: #555;
          }
        }
        #arrow_1 {
          animation: flash_triangles 3s infinite steps(1);
        }

        #arrow_2 {
          animation: flash_triangles 3s infinite 1s steps(1);
        }

        #arrow_3 {
          animation: flash_triangles 3s infinite 2s steps(1);
        }
      `,
    ];
  }

  static get defaultConfig() {
    return {
      solar: {
        icon: "mdi:solar-power",
      },
      grid: {
        icon: "mdi:transmission-tower",
      },
      battery: {
        icon: "mdi:battery-outline",
      },
      home: {
        icon: "mdi:home-assistant",
      },
    };
  }

  constructor() {
    super();
    this.entities = {};
  }

  setConfig(config) {
    /************************
     * Example Configuration: Simple and Advanced can be combined aslong a entity is passed
     ************************
     * Simple:
     *********
     * type: custom:e3dc-power-wheel-card
     * entities:
     *   battery: sensor.e3dc-battery
     *   solar: sensor.e3dc-solar
     *
     ***********
     * Advanced:
     ***********
     * type: custom: e3dc-power-wheel-card
     * solar:
     *   entity: sensor.e3dc-solar
     *   inverted: true
     *   icon: 'mdi:solar'
     */

    config = { ...config };
    var acceptedEntities = [
      "solar",
      "grid",
      "battery",
      "home",
      "autarky",
      "ratio",
    ];
    acceptedEntities.forEach((e) => {
      if (config.entities[e]) this.entities[e]["entity"] = config.entities[e];
      //TODO check wether its possible to copy the settings directly instead of looping them
      if (config[e] && (this.entities[e]["entity"] || config[e]["entity"]))
        config[e].forEach((setting) => {
          this.entities[e][setting] = config[e][setting];
        });
    });
    //Applying default values if not set by the user
    defConf = this.defaultConfig()
    for (const e in defConf){
      for(const set in defConf[e]){
        if(this.entities[e] && !this.entities[e][set]) this.entities[e][set] = defConf[e][set]
      }
    }
    //TODO enable more configuration options: Color, Autocalc of autarky / ratio
    //TODO Add a card Title
    config.title = config.title ? config.title : "";

    this.config = config;
  }

  render() {
    return html`
      <ha-card>
        <div class="e3dc-card">
          <div class="grid-container">
            <div class="grid-header">
              custom header 123
            </div>
            <div class="overview">
              <p id="ratio">ratio</p>
              <div class="bar-container">
                <div class="ratio-bar">
                  <p id="ratio-percentage">100%</p>
                  <div class="bar">Bar</div>
                </div>
                <div class="autarky-bar">
                  <p id="autarky-percentage">78%</p>
                  <div class="bar">Bar</div>
                </div>
              </div>
              <p id="autarky">
                autarky
              </p>
            </div>
            ${this._render_item("solar")} ${this._render_item("grid")}
            ${this._render_item("battery")} ${this._render_item("home")}
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Render Support Functions
   */

  _render_item(entity) {
    if (!this.entities[entity]) return null;
    var state = this.hass.states[entity].state;
    return html`
      <div class="item" id="${entity}">
        <div class="icon">
          <ha-icon icon="${this.entities[entity].icon}"></ha-icon>
          <p class="subtitle">${entity}</p>
        </div>
        <div class="value">
          <p>${Math.abs(state)} W</p>
          ${state < 0
            ? this._render_arrow(2)
            : state == 0
            ? this._render_arrow(0)
            : this._render_arrow(1)}
        </div>
      </div>
    `;
  }

  //This generates Animated Arrows depending on the state
  //0 is 0; 1 equals right; 2 equals left
  _render_arrow(direction) {
    switch (direction) {
      case 0: //Equals no Arrows at all
        return html` <div class="blank"></div> `;
      case 1: //Right Moving Arrows
        return html`
          <div class="arrow">
            <div class="triangle-right" id="arrow_1"></div>
            <div class="triangle-right" id="arrow_2"></div>
            <div class="triangle-right" id="arrow_3"></div>
          </div>
        `;
      case 2: //Left moving Arrows
        return html`
          <div class="arrow">
            <div class="triangle-left" id="arrow_3"></div>
            <div class="triangle-left" id="arrow_2"></div>
            <div class="triangle-left" id="arrow_1"></div>
          </div>
        `;
    }
  }
}

customElements.define("e3dc-power-wheel-card", e3dcPowerWheelCard);
