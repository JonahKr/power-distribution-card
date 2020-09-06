const LitElement = Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class e3dcPowerWheelCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entities: { type: Object },
      defaultConfig: { type: Object },
      title: { type: String },
      animation: { type: Object },
    };
  }

  static get styles() {
    return [
      css`
        * {
          box-sizing: border-box;
        }

        .grid-container {
          display: grid;
          grid-template-columns: 35%-0.5em 30%-1em 35%-0.5em;
          gap: 1em;
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
          height: 0;
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
          position: relative;
        }

        .bar-container > div {
          display: inline-block;
          width: 45%;
          vertical-align: middle;
        }

        .bar {
          position: absolute;
          bottom: 0px;
        }

        badge {
          width: 50%;
          border: gray 1px solid;
          border-radius: 1em;
          float: left;
          padding: 4px;
        }

        badge > icon {
          width: 100%;
          display: inline-block;
        }

        icon > ha-icon {
          display: block;
          width: 24px;
          margin: 0 auto;
        }

        value {
          float: right;
        }

        item:nth-child(2n) > badge {
          float: right;
        }

        item:nth-child(2n) > value {
          float: left;
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

  get DefaultConfig() {
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
    this.animation = {};
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
      var cache = {};
      if (config.entities[e]) cache.entity = config.entities[e];
      //TODO check wether its possible to copy the settings directly instead of looping them
      if (config[e] && (cache.entity || config[e].entity))
        for (var setting in config[e]) {
          cache[setting] = config[e][setting];
        }
      this.entities[e] = cache;
    });
    //Applying default values if not set by the user
    var defConf = this.DefaultConfig;
    for (const e in defConf) {
      for (const set in defConf[e]) {
        if (this.entities[e] && !this.entities[e][set])
          this.entities[e][set] = defConf[e][set];
      }
    }
    //TODO enable more configuration options: Color, Autocalc of autarky / ratio
    this.title = config.title ? config.title : null;
    this.config = config;
  }

  render() {
    return html`
      <ha-card .header=${this.title}>
        <div class="card-content">
          <div class="grid-container">
            <div class="grid-header">
              custom header 123
            </div>
            ${this._render_bars()}
            ${this.entities.solar.entity
              ? this._render_item(this.solar_val, "solar")
              : null}
            ${this.entities.grid
              ? this._render_item(this.grid_val, "grid")
              : null}
            ${this.entities.battery.entity
              ? this._render_item(this.battery_val, "battery")
              : null}
            ${this.entities.home.entity
              ? this._render_item(this.home_val, "home")
              : null}
          </div>
        </div>
      </ha-card>
    `;
  }
  /**
   * Calculating Functions
   */

  get solar_val() {
    return this.entities.solar.entity
      ? Number(this.hass.states[this.entities.solar.entity].state)
      : 0;
  }
  get grid_val() {
    return this.entities.grid.entity
      ? Number(this.hass.states[this.entities.grid.entity].state)
      : 0;
  }
  get battery_val() {
    return this.entities.battery.entity
      ? Number(this.hass.states[this.entities.battery.entity].state)
      : 0;
  }
  get home_val() {
    return this.entities.home.entity
      ? Number(this.hass.states[this.entities.home.entity].state)
      : 0;
  }
  get autarky_val() {
    return this.entities.autarky.entity
      ? Number(this.hass.states[this.entities.autarky.entity].state)
      : 0;
  }
  get ratio_val() {
    return this.entities.ratio.entity
      ? Number(this.hass.states[this.entities.ratio.entity].state)
      : 0;
  }

  _calculate_autarky() {
    //Formula: Autarky in % = Total Consumption / Production *100
    //Because of very little power is consumed from/feeded into the grid, we need to adjust the 1% range
    var autarky = 0.5; //TODO try some different formulas to get the best examples...
    return autarky >= 0.005 ? Math.round(autarky) : 0.01;
  }

  _calculate_ratio() {}
  /**
   * Render Support Functions
   */

  _render_bars() {
    var autarky = this.entities.autarky.entity
      ? this.autarky_val
      : this._calculate_autarky() * 100;
    var ratio = this.entities.ratio.entity
      ? this.ratio_val
      : this._calculate_ratio() * 100;

    return html`
      <div class="overview">
        <p id="ratio">ratio</p>
        <div class="bar-container">
          <div class="ratio-bar">
            <p id="ratio-percentage">${ratio}%</p>
            <div class="bar"></div>
          </div>
          <div class="autarky-bar">
            <p id="autarky-percentage">${autarky}%</p>
            <div
              class="bar"
              style="height:${autarky}%,; background-color:#555;"
            ></div>
          </div>
        </div>
        <p id="autarky">
          autarky
        </p>
      </div>
    `;
  }

  _render_item(state, name) {
    var item = this.entities[name];
    if (item.inverted) state *= -1;
    return html`
      <item id="${name}">
        <badge>
          <icon>
            <ha-icon icon="${item.icon}"></ha-icon>
          </icon>
          <p class="subtitle">${name}</p>
        </badge>
        <value>
          <p>${Math.abs(state)} W</p>
          ${
            state < 0
              ? this._render_arrow(2)
              : state == 0
              ? this._render_arrow(0)
              : this._render_arrow(1)
          }
        <value
      </item>
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
            <div class="triangle-right animated" id="arrow_1"></div>
            <div class="triangle-right animated" id="arrow_2"></div>
            <div class="triangle-right animated" id="arrow_3"></div>
          </div>
        `;
      case 2: //Left moving Arrows
        return html`
          <div class="arrow">
            <div class="triangle-left animated" id="arrow_3"></div>
            <div class="triangle-left animated" id="arrow_2"></div>
            <div class="triangle-left animated" id="arrow_1"></div>
          </div>
        `;
    }
  }
}

customElements.define("e3dc-power-wheel-card", e3dcPowerWheelCard);
