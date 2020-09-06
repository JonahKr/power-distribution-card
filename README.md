# e3dc-power-card
[![GitHub package.json version](https://img.shields.io/github/package-json/v/JonahKr/e3dc-power-card)](https://github.com/JonahKr/e3dc-power-card/blob/master/VERSION)
[![Actions Status](https://github.com/JonahKr/e3dc-power-card/workflows/Tests/badge.svg)](https://github.com/Jonah/e3dc-power-card/actions)
[![GitHub license](https://img.shields.io/github/license/JonahKr/e3dc-power-card)](https://img.shields.io/github/license/JonahKr/e3dc-power-card/blob/master/LICENSE) 
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A Lovelace Plugin with the standard E3-DC overview pannel.
---
## Configuration

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