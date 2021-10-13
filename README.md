# power-distribution-card
[![GitHub package.json version](https://img.shields.io/github/package-json/v/JonahKr/power-distribution-card)](https://github.com/JonahKr/power-distribution-card/blob/master/package.json)
[![Actions Status](https://github.com/JonahKr/power-distribution-card/workflows/Tests/badge.svg)](https://github.com/Jonah/power-distribution-card/actions)
[![GitHub license](https://img.shields.io/github/license/JonahKr/power-distribution-card)](https://img.shields.io/github/license/JonahKr/power-distribution-card/blob/master/LICENSE) 
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)
<a href="https://www.buymeacoffee.com/JonahKr" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" height="20px" width="83px" ></a>
<br/>

<div>
<i>Inspired by</i>
<img height="40px" alt="e3dc-logo" href="https://www.e3dc.com/en/#Intro" src="https://user-images.githubusercontent.com/38377070/95522835-7de46d80-09cd-11eb-9aae-55657aa3caae.png"/>
</div>
<br/>
<h1 align="center">A Lovelace Card for visualizing power distributions.</h1>
<p align="center">
<img src="https://user-images.githubusercontent.com/38377070/103143008-389f2480-470e-11eb-945a-68115febef8a.gif"/>
</p>

<br/>

</div>

<div id="toc">
  <h2> Table of Contents </h2>
  <ul>
    <li>
      <h3><a href="#installation">Installation</a></h3>
    </li>
    <li>
      <h3><a href="#configuration">Configuration</a></h3>
      <h4><a href="#presets">Presets</a></h4>
      <h4><a href="#simple">Simple Configuration</a></h4>
      <h4><a href="#yaml">YAML Configuration</a></h4>
      <h4><a href="#animation">Animation Options</a></h4>
      <h4><a href="#center">Center Panel</a></h4>
      <h4><a href="#entity">Advanced Configuration</a></h4>
    </li>
    <li>
      <h3><a href="#faq">FAQs</a></h2>
    </li>
  </ul>
<br/>
</div>

<hr>

<br/>


<div id="installation">
<h1> Installation</h1>

<h2> Installation via <a href="https://hacs.xyz/">HACS</a> <img src="https://img.shields.io/badge/-Recommended-%2303a9f4"/> </h2>

1. Make sure the [HACS](https://github.com/custom-components/hacs) custom component is installed and working.
2. Search for `power-distribution-card` and add it through HACS
3. Refresh home-assistant.

<h2> Manual installation</h2>

1. Download the latest release of the [power-distribution-card](http://www.github.com/JonahKr/power-distribution-card/releases/latest/download/power-distribution-card.js)
2. Place the file in your `config/www` folder
3. Include the card code in your `ui-lovelace-card.yaml`
  ```yaml
  resources:
    - url: /local/power-distribution-card.js
      type: module
  ```
  Or alternatively set it up via the UI: 
  `Configuration -> Lovelace Dashboards -> Resources (TAB)` 

<br/>
</div>

***

<br/>

<div id="configuration">
<h1> Configuration</h1>

<div id="presets">
<h3>Presets</h3>

Every Sensor you want to add has to use one of the Presets. You can add as many of these as you want.

<table style="text-align: center;">
<tr>
  <td>
    <img height="60px" alt="mdi-battery-outline" src="https://user-images.githubusercontent.com/38377070/95509029-356c8600-09b4-11eb-834d-1c05cdb9758e.png"/>
  <td>
    <img height="60px" alt="mdi-electirc-car" src="https://user-images.githubusercontent.com/38377070/95509040-369db300-09b4-11eb-8caa-046c5b2999d2.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-lightbulb" src="https://user-images.githubusercontent.com/38377070/95515835-87b2a480-09be-11eb-92af-45a97c895cda.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-transmission-tower" src="https://user-images.githubusercontent.com/38377070/95508865-ee7e9080-09b3-11eb-8981-eab0969cecac.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-home-assistant" src="https://user-images.githubusercontent.com/38377070/95509151-66e55180-09b4-11eb-9228-585dcde1d40e.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-hydro-power" src="https://user-images.githubusercontent.com/38377070/95515201-85037f80-09bd-11eb-8603-31eb4c70b83b.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-pool" src="https://user-images.githubusercontent.com/38377070/95515296-abc1b600-09bd-11eb-8b81-1e6fbbddb7c3.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-lightning-bolt-outline" src="https://user-images.githubusercontent.com/38377070/95509102-50d79100-09b4-11eb-96ea-8a544db60ccb.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-solar-power" src="https://user-images.githubusercontent.com/38377070/95516097-03145600-09bf-11eb-9027-37593379e1c2.png"/>
  </td>
  <td>
    <img height="60px" alt="mdi-wind-turbine" src="https://user-images.githubusercontent.com/38377070/95516203-2b9c5000-09bf-11eb-9fd0-a3a87447f30e.png"/>
  </td>
</tr>
<tr>
  <td>battery</td>
  <td>car_charger</td>
  <td>consumer</td>
  <td>grid</td>
  <td>home</td>
  <td>hydro</td>
  <td>pool</td>
  <td>producer</td>
  <td>solar</td>
  <td>wind</td>
</tr>
<tr>
  <td>
    Any Home Battery e.g. <a href="https://www.e3dc.com/en/#Intro">E3dc</a>, <a href="https://www.tesla.com/en_eu/powerwall">Powerwall</a>
  </td>
  <td>
    Any Electric Car Charger
  </td>
  <td>
    A custom home power consumer
  </td>
  <td>
    The interface to the power grid
  </td>
  <td>
    Your Home's power consumption
  </td>
  <td>
    Hydropower setup like <a href="https://www.turbulent.be/">Turbulent</a>
  </td>
  <td>
    pool heater or pump
  </td>
  <td>
    custom home power producer
  </td>
  <td>
    Power coming from Solar
  </td>
  <td>
    Power coming from Wind
  </td>
</tr>
</table>

The presets *consumer* and *producer* enable to add any custom device into your Card with just a bit of tweaking.
</div>
<br/>
<div id="simple">

## Simple Configuration 🛠️ <img src="https://img.shields.io/badge/-Recommended-%2303a9f4"/>

With Version 2.0 a Visual Editor got introduced.
You can find the Card in your Card Selector probably at the bottom.
From there on you can configure your way to your custom Card.
The easiest way to get your Card up and running, is by defining the entities for the presets directly.
<br/>

<p align="center">
<img src="https://user-images.githubusercontent.com/38377070/102943002-25464c00-44b7-11eb-8566-0a82c80ae96d.gif"/>
</p>
<br/>

```diff
! Please Check for every Sensor: positive sensor values = production, negative values = consumption
! If this is the other way around in your Case, check the `invert_value` setting (Advanced Configuration)!
```

<p align="center">
<img src="https://user-images.githubusercontent.com/38377070/102943049-44dd7480-44b7-11eb-9a42-912cac357299.gif"/>
</p>


### Placeholder
By submitting an empty entity_id, you will generate a plain transparent placeholder item which can be used to further customize your layout.
<p align="center">
<img src="https://user-images.githubusercontent.com/38377070/124113882-3676a380-da6c-11eb-8f3e-db00466fd601.png"/>
</p>
</div>
<br/><br/>


<div id="yaml">

## YAML Only

If you are a real hardcore YAML connoisseur here is a basic example to get things started:
```yaml
type: 'custom:power-distribution-card'
title: Title
animation: flash
entities:
  - entity: sensor.e3dc_home
    preset: home
  - entity: sensor.e3dc_solar
    preset: solar
  - entity: sensor.e3dc_battery
    preset: battery
center:
  type: bars
  content:
    - preset: autarky
      name: autarky
    - preset: ratio
      name: ratio
```
You can find all options for every entity <a href="#entity">here</a>.
If you want to further modify the center panel youz can find the documentation <a href="#center">here</a>.
</div>
<br/><br/>


<div id="animation">

## Animation

For the animation you have 3 options: `flash`, `slide`, `none`
```yaml
type: 'custom:power-distribution-card'
animation: 'slide'
```
</div>
<br/>

<div id="center">

## Center Panel

For customizing the Center Panel you basically have 3 Options:

### None 🕳️

the *void* 

<br/>

### Bars 📊

Bars have the following Settings:
| Setting             | type          | example           | description  |
| ------------------- |:-------------:|:-----------------:| :------------|
| `bar_color`         | string        | red, #C1C1C1      |You can pass any string that CSS will accept as a color. |
| `bar_bg_color`      | string        | red, #C1C1C1      |The Background Color of the Bar. You can pass any string that CSS will accept as a color. |
| `entity`            | string        | sensor.ln_autarky | You can specify the entity_id here aswell. |
| `invert_value`      | bool          | false             | This will invert the value recieved from HASS. This affects calculations aswell! |
| `name`              | string        | Eigenstrom        | Feel free to change the displayed name of the element. |
| `preset`            | 'ratio' 'autarky' 'custom'        | all in type        | Option to autocalc ratio/autarky. |
| `tap_action`        | Action Config | [Configuration](https://www.home-assistant.io/lovelace/actions/#configuration-variables) | Single tap action for item. |
| `double_tap_action` | Action Config | [Configuration](https://www.home-assistant.io/lovelace/actions/#configuration-variables) | Double tap action for item. |

<br/>

### Cards 🃏


<p align="center">
<img width="600px" src="https://user-images.githubusercontent.com/38377070/97620471-e8fbef80-1a21-11eb-90d3-1bcbab57da2c.PNG"/>
</p>

Cards couldn't yet be included in the Visual editor in a nice way. I am working on it though. Feel free to open a Issue with suggestions.
To add a card you can simply replace the `center` part in the Code Editor. Be aware though: While you can switch between `none` and `card` without any issues, switching to Bars will override your settings.

For example you could insert a glance card:
```yaml
center:
  type: card
  content:
    type: glance
    entities:
      - sensor.any_Sensor
```
</div>
<br/><br/>

<div id="entity">

## Entity Configuration ⚙️

There are alot of settings you can customize your sensors with:      

| Setting                    | type          | example                      | description  |
| -------------------------- |:-------------:|:----------------------------:| :------------|
| `attribute`                | string        | deferredWatts                | A Sensor can have multiple attributes. If one of them is your desired value to display, add it here. |
| `calc_excluded`            | boolean       | true                         | If the Item should be excluded from ratio/autarky calculations |
| `decimals`                 | number        | 0, 2                         | The Number of Decimals shown. (default: 2) |
| `display_abs`              | boolean       | false                        | The displayed values are Absolute normally. You can change that here. |
| `double_tap_action`        | Action Config | [Configuration](https://www.home-assistant.io/lovelace/actions/#configuration-variables) | Double tap action for item. |
| `entity`                   | string        | sensor.e3dc_grid             | You can specify the entity_id here aswell. |
| `hide_arrows`              | bool          | true                         | Toggeling the visibility od the *arrows*. |
| `icon`                     | string        | mdi:dishwasher               | Why not change the displayed Icon to any [MDI](https://cdn.materialdesignicons.com/5.4.55/) one? |
| `icon_color`               | object        | {smaller:'red'}              | You can Change the Color of the icon dependant on the value. (Bigger, Equal and Smaller) |
| `invert_arrow`             | bool          | true                         | This will change the *arrows* direction to the oposite one. |
| `invert_value`             | bool          | false                        | This will invert the value recieved from HASS. This affects calculations aswell! |
| `name`                     | string        | dishwasher                   | Feel free to change the displayed name of the element. |
| `secondary-info-attribute` | string        | min_temp                     | Requires Entity. Instead of Sensor, the Attribute Value gets displayed.  |
| `secondary-info-entity`    | string        | sensor.e3dc_grid             | entity_id of the secondary info sensor |
| `tap_action`        | Action Config | [Configuration](https://www.home-assistant.io/lovelace/actions/#configuration-variables) | Single tap action for item. |
| `threshold`                | number        | 2                            | Ignoring all abolute values smaller than threshold. |
| `unit_of_display`          | string        | *W* , *kW* , *adaptive*      | The Unit the value is displayed in (default: W). Adaptive will show kW for values >= 1kW |
| `unit_of_measurement`      | string        | *W* , *kW*                   | The Unit the value is coming from the Sensor. **This should be detected automatically** |
<p> 

This could look something like:

```yaml
entities:
  - decimals: 2
    display_abs: true
    name: battery
    unit_of_display: W
    consumer: true
    icon: 'mdi:battery-outline'
    producer: true
    entity: sensor.e3dc_battery
    preset: battery
    icon_color:
      bigger: 'green'
      equal: ''
      smaller: 'red'
```

</div>
<br/>
<br/>

<div>

## Preset features

The Presets `battery` and `grid` have some additional features which allow some further customization.
For the Battery the icon can display the state of charge and the grid preset can have a small display with power sold and bought from the grid.

<img width="600px" src="https://user-images.githubusercontent.com/38377070/137152436-34753a15-86f9-44c4-ad47-87c35d94bd91.png"/>

If one of those presets is selected there will be additional options in the visual editor.
If you prefer yaml, here are all extra options which can be set per item:

| Setting                     | type          | example                      | description  |
| --------------------------- |:-------------:|:----------------------------:| :------------|
| `battery_percentage_entity` | string        | sensor.xyz                   | Sensor containing the battery charge percentage from 0 to 100 |
| `grid_buy_entity`           | string        | sensor.xyz                   | Sensor containing the imported power from the grid |
| `grid_sell_entity`          | string        | sensor.xyz                   | Sensor containing the sold power towards the grid |

</div>
</div> 

<hr>

<div id="faq">
<h1> FAQs ❓</h1>

### My old Configuration doesn't work anymore!
If this is the case - Congratulations you're running the new Version. 
To easily integrate the visual editor i had to make some sacrefices and apply many breaking changes.
This will be the last time though. *I hope °-°*
### What the heck are these autarky and ratio calculating?
So basically these bar-graphs are nice indicators to show you:
1. the autarky of your home (Home Production like Solar / Home Consumption) 
2. the ratio / share of produced electricity used by the home (The Germans call it `Eigenverbrauchsanteil` 😉)

### kW and kWh is not the Same!
I know... In this case usability is more important and the user has to decide if he is ok with that.

<br/>
</div>

 
<hr>

**If you find a Bug or have some suggestions, let me know <a href="https://github.com/JonahKr/power-distribution-card/issues">here</a>!**

**If you like the card, consider starring it.**
