# power-distribution-card
[![GitHub package.json version](https://img.shields.io/github/package-json/v/JonahKr/power-distribution-card)](https://github.com/JonahKr/power-distribution-card/blob/master/VERSION)
[![Actions Status](https://github.com/JonahKr/power-distribution-card/workflows/Tests/badge.svg)](https://github.com/Jonah/power-distribution-card/actions)
[![GitHub license](https://img.shields.io/github/license/JonahKr/power-distribution-card)](https://img.shields.io/github/license/JonahKr/power-distribution-card/blob/master/LICENSE) 
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

*Inspired by [E3DC](https://www.e3dc.com/#Intro)*

A Lovelace Plugin with the standard E3-DC overview pannel.
--- 

## Configuration

All following configurable options are **optional** as well as **combinable**. The more advanced configuration will override the simpler one.
### Simple Configuration
For the easiest Configuration you just set the entities for the 6 different items. 
The items `autarky` and `ratio` are optional and will be calculated automatically if the necessary entities have been passed. A titel isn't necessary either.

Example:
```yaml
titel: Overview
battery: sensor.battery
home: sensor.home
solar: sensor.solar
grid: sensor.grid
autarky: sensor.autarky
ratio: sensor.ratio
```

### Advanced Configuration
You really want to make this card your own? Here you go!
These are all the settings. You can apply them to certain items only as well as all items at once!

**Generally: negative Values mean consumption, positive Values production**

| Setting       | type          | description  |
| ------------- |:-------------:| :-----|
| entity        | string        | You can specify the entity_id here aswell. |
| icon          | string        | Why not change the displayed Icon to any [MDI](https://cdn.materialdesignicons.com/5.4.55/) one? |
| invert_arrow  | bool          | This will change the *arrows* direction to the oposite one. |
| invert_value  | bool          | This will invert the value recieved from HASS. This affects calculations aswell! |
| name          | string        | Feel free to change the name of the element. |
| *more*        | *will*        | *come* |

___
A feature which will bring even more flexibility and will allow you to specify your own types, is on its way.

___

Example:
```yaml
titel: E3DC Overview
battery: sensor.e3dc_battery
home: sensor.e3dc_home
autarky: sensor.e3dc_autarky
ratio: sensor.e3dc_ratio
solar:
  entity: sensor.e3dc_solar
  inverted: true
  icon: mdi:solar-panel
grid:
  inverted: true
```
***
## Installation

### Manual installation
1. Download the latest release of the [power-distribution-card](http://www.github.com/JonahKr/power-distribution-card/releases/latest/download/power-distribution-card.js)
2. Place the file in your `config/www` folder
3. Include the card code in your `ui-lovelace-card.yaml`
  ```yaml
  resources:
    - url: /local/power-distribution-card.js
      type: module
  ```

### Installation via [HACS](https://hacs.xyz/)
*To Be Continued*