# power-distribution-card
[![GitHub package.json version](https://img.shields.io/github/package-json/v/JonahKr/power-distribution-card)](https://github.com/JonahKr/power-distribution-card/blob/master/package.json)
[![Actions Status](https://github.com/JonahKr/power-distribution-card/workflows/Tests/badge.svg)](https://github.com/Jonah/power-distribution-card/actions)
[![GitHub license](https://img.shields.io/github/license/JonahKr/power-distribution-card)](https://img.shields.io/github/license/JonahKr/power-distribution-card/blob/master/LICENSE) 
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)
<br/>

<div>
<i>Inspired by</i>
<img height="40px" alt="e3dc-logo" href="https://www.e3dc.com/en/#Intro" src="https://user-images.githubusercontent.com/38377070/95522835-7de46d80-09cd-11eb-9aae-55657aa3caae.png"/>
</div>
<br/>
<h1 align="center">A Lovelace Card for visualizing power distributions.</h1>
<p align="center">
<img src="https://user-images.githubusercontent.com/38377070/96733911-435dd600-13ba-11eb-8491-75e88490e417.gif"/>
</p>

<br/>

<div id="breaking_changes">
  <h2>Breaking Changes!</h2>

  From 1.7 on :
  - All Bar Settings are now sorted under the center item.
```yaml
Old:
entities:
  - autarky: sensor.xyz
  - ratio:
      bar_color: red


New:
center:
  - autarky: sensor.xyz
  - ratio:
      bar_color: red
```


  **Deprecated**: 
  
  `disable_animation` has been deprecated for `animation: none`.  
  Support will be dropped with 2.0
  
<br/>
<hr>
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
      <h4><a href="#center">Center Panel</a></h4>
      <h4><a href="#advanced">Advanced Configuration</a></h4>
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
## Simple Configuration
The easiest way to get your Card up and running, is by defining the entities for the presets directly.
Example:
```yaml
type: 'custom:power-distribution-card'
entities:
  - solar: sensor.PV_garage
  - grid: sensor.kamstrup_grid
  - battery: sensor.lg_neon_battery
  - home: sensor.e3dc_home
```
If you have Sensors for **autarky** or **ratio** aswell, you can just add them to the list:
```yaml
  - autarky: sensor.sunbessy_autarky
  - ratio: sensor.e3dc_ratio
```
<br/>

<p align="center">
<img src="https://user-images.githubusercontent.com/38377070/96745908-e9afd880-13c6-11eb-9772-4bce4a3ad29c.gif"/>
</p>




You can change the animations in your card aswell with the **animation** keyoword which can either be *none* , *flash* or *slide*.  
Furthermore you can add a **title** to the card by just:
```yaml
title: My Power Card
animation: slide
entities:
  - ...
```

<br/>

```diff
! Please Check for every Sensor: positive sensor values = production, negative values = consumption
! If this is the other way around in your Case, add the `invert_value` setting (Advanced Configuration)!
```
</div>
<br/><br/>

<div id="center">

## Center Panel

For customizing the Center Panel you basically have 3 Options:

### None

the *void* 
```yaml
center: none
```

<br/>

### Bars

To modify the **autarky** or **ratio** bars, you have these settings:
| Setting          | type          | example           | description  |
| ---------------- |:-------------:|:-----------------:| :------------|
| `bar_color`      | string        | red, #C1C1C1      |You can pass any string that CSS will accept as a color. |
| `entity`         | string        | sensor.ln_autarky | You can specify the entity_id here aswell. |
| `invert_value`   | bool          | false             | This will invert the value recieved from HASS. This affects calculations aswell! |
| `name`           | string        | Eigenstrom        | Feel free to change the displayed name of the element. |

<p>

Example for bar configuration:
```yaml
type: 'custom:power-distribution'
entities:
  - solar: sensor.rooftop_pv
  - autarky:
      bar_color: blue
      name: Autarki
  - ratio:
      entity: sensor.e3dc_ratio
```
<br/>

### Cards

You can fill the center panel with any card you want. Be aware though that the **width is limited** which limits the amount of fitting cards.

<p align="center">
<img width="600px" src="https://user-images.githubusercontent.com/38377070/97620471-e8fbef80-1a21-11eb-90d3-1bcbab57da2c.PNG"/>
</p>

For example you could insert a glance card:
```yaml
center:
  type: glance
  entities:
    - sun.sun
```
</div>
<br/><br/>

<div id="advanced">

## Advanced Configuration

You really want to make this card your own? Here you go! 

You can create Settings for each element by creating a new level. The *entity_id* **must** be changed to the `entity` setting:
```yaml
entities:
  - solar:
      entity: sensor.e3dc_solar
      invert_value: true
```
<br/>

There are alot of settings you can customize your sensors with:      

| Setting               | type          | example          | description  |
| --------------------- |:-------------:|:----------------:| :------------|
| `attribute`           | string        | deferredWatts    | A Sensor can have multiple attributes. If one of them is your desired value to display, add it here. |
| `calc_excluded`       | boolean       | true             | If the Item should be excluded from ratio/autarky calculations |
| `decimals`            | number        | 0, 2             | The Number of Decimals shown. (default: 2) |
| `display_abs`         | boolean       | false            | The displayed values are Absolute normally. You can change that here. |
| `entity`              | string        | sensor.e3dc_grid | You can specify the entity_id here aswell. |
| `icon`                | string        | mdi:dishwasher   | Why not change the displayed Icon to any [MDI](https://cdn.materialdesignicons.com/5.4.55/) one? |
| `invert_arrow`        | bool          | true             | This will change the *arrows* direction to the oposite one. |
| `invert_value`        | bool          | false            | This will invert the value recieved from HASS. This affects calculations aswell! |
| `name`                | string        | dishwasher       | Feel free to change the displayed name of the element. |
| `unit_of_display`     | string        | *W* , *kW* , *adaptive*      | The Unit the value is displayed in (default: W). Adaptive will show kW for values >= 1kW |
| `unit_of_measurement` | string        | *W* , *kW*       | The Unit the value is coming from the Sensor. **This should be detected automatically** |
<p>

Example for advanced sensor configuration:
```yaml
type: 'custom:power-distribution'
entities:
  - solar:
      entity: sensor.e3dc_solar
      icon: mdi:sun
  - battery:
      entity: lg_neon_battery
      display_abs: true
  - home:
      entity: sensor.e3dc_home
      invert_value: true
  - car_charger:
      entity: sensor.home_powerwall
      calc_excluded: true
      name: Tesla
      unit_of_display: kW
```
</div>
<br/>
<br/>
</div> 

<hr>

<div id="faq">
<h1> FAQs</h1>

### What the heck are these autarky and ratio calculating?
So basically these bar-graphs are nice indicators to show you:
1. the autarky of your home (Home Production like Solar / Home Consumption) 
2. the ratio / share of produced electricity used by the home (The Germans call it `Eigenverbrauchsanteil` 😉)

### Is the battery able to show its SOC?
Currently not. Its planned.

### kW and kWh is not the Same!
I know... In this case usability is more important and the user has to decide if he is ok with that.

<br/>
</div>

 
<hr>

**If you find a Bug or have some suggestions, let me know <a href="https://github.com/JonahKr/power-distribution-card/issues">here</a>!**

**If you like the card, consider starring it.**
