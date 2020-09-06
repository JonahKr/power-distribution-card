# e3dc-power-card
[![GitHub package.json version](https://img.shields.io/github/package-json/v/JonahKr/e3dc-power-card)](https://github.com/JonahKr/e3dc-power-card/blob/master/VERSION)
[![Actions Status](https://github.com/JonahKr/e3dc-power-card/workflows/Tests/badge.svg)](https://github.com/Jonah/e3dc-power-card/actions)
[![GitHub license](https://img.shields.io/github/license/JonahKr/e3dc-power-card)](https://img.shields.io/github/license/JonahKr/e3dc-power-card/blob/master/LICENSE) 
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A Lovelace Plugin with the standard E3-DC overview pannel.
---
## Configuration

All following configurable options are **optional** as well as **combinable**. The more advanced configuration will override the simpler one.
### Simple Configuration
For the easiest Configuration you just set the entities for the 6 different items. 
The items `autarky` and `ratio` are optional and will be calculated automatically if the necessary entities have been passed. A titel isn't necessary either.

Example:
```yaml
titel: E3DC Overview
entities:
  battery: sensor.e3dc_battery
  home: sensor.e3dc_home
  solar: sensor.e3dc_solar
  grid: sensor.e3dc_grid
  autarky: sensor.e3dc_autarky
  ratio: sensor.e3dc_ratio
```

### Advanced Configuration
You really want to make this card your own? Here you go!
These are all the settings. You can apply them to certain items only as well as all items at once!

| Setting       | type          | description  |
| ------------- |:-------------:| :-----|
| entity        | string        | You can specify the entity_id here aswell. |
| icon          | string        | Why not change the displayed Icon to any [MDI](https://cdn.materialdesignicons.com/5.4.55/) one? |
| inverted      | bool          | This Will change the arrows direction to the oposite one. |
| *more*        | *will*        | *come* |


Example:
```yaml
titel: E3DC Overview
entities:
  battery: sensor.e3dc_battery
  home: sensor.e3dc_home
  grid: sensor.e3dc_grid
  autarky: sensor.e3dc_autarky
  ratio: sensor.e3dc_ratio
solar:
  entity: sensor.e3dc_solar
  inverted: true
  icon: mdi:solar-panel
grid:
  inverted: true
```
## Installation

### Manual installation
1. Download the latest release of the [e3dc-power-card](http://www.github.com/JonahKr/e3dc-power-card/releases/latest/download/e3dc-card.js)
2. Place the file in your `config/www` folder
3. Include the card code in your `ui-lovelace-card.yaml`
  ```yaml
  resources:
    - url: /local/e3dc-power-card.js
      type: module
  ```

### Installation via [HACS](https://hacs.xyz/)
*To Be Continued*