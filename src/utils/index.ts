export * from './custom-cards';

export * from './hass-types/handle-action';
export * from './hass-types/has-action';
export * from './hass-types/action_handler';
export { ActionConfig } from './hass-types/action';
export * from './hass-types/event';
export * from './hass-types/homeassistant';
export * from './hass-types/lovelace';
export { fireEvent } from './hass-types/fire_event';

export function fireCustomEvent<T>(node: HTMLElement | Window, type: string, detail: T): void {
  const event = new CustomEvent(type, { bubbles: false, composed: false, detail: detail });
  node.dispatchEvent(event);
}