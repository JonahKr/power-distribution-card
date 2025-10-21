import { HomeAssistant, ServiceCallResponse } from "./homeassistant";

// From: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/entity/toggle-entity.ts
/** States that we consider "off". */
export const STATES_OFF = ["closed", "locked", "off"];

export const toggleEntity = (
  hass: HomeAssistant,
  entityId: string
): Promise<ServiceCallResponse> => {
  const turnOn = STATES_OFF.includes(hass.states[entityId].state);
  return turnOnOffEntity(hass, entityId, turnOn);
};

// From: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/entity/turn-on-off-entity.ts
export const turnOnOffEntity = (
  hass: HomeAssistant,
  entityId: string,
  turnOn = true
): Promise<ServiceCallResponse> => {
  const stateDomain = computeDomain(entityId);
  const serviceDomain = stateDomain === "group" ? "homeassistant" : stateDomain;

  let service;
  switch (stateDomain) {
    case "lock":
      service = turnOn ? "unlock" : "lock";
      break;
    case "cover":
      service = turnOn ? "open_cover" : "close_cover";
      break;
    case "button":
    case "input_button":
      service = "press";
      break;
    case "scene":
      service = "turn_on";
      break;
    case "valve":
      service = turnOn ? "open_valve" : "close_valve";
      break;
    default:
      service = turnOn ? "turn_on" : "turn_off";
  }

  return hass.callService(serviceDomain, service, { entity_id: entityId });
};

// From: https://github.com/home-assistant/frontend/blob/dev/src/common/entity/compute_domain.ts
export const computeDomain = (entityId: string): string =>
  entityId.substring(0, entityId.indexOf("."));