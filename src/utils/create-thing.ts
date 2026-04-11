import { fireEvent } from "./hass-types/fire_event";
import type { LovelaceCardConfig } from "./hass-types/lovelace";

const TIMEOUT = 2000;

const _createErrorCardElement = (error: string, config: LovelaceCardConfig) => {
  const el = document.createElement("hui-error-card") as any;
  try {
    el.setConfig({ type: "error", error, config });
  } catch (_err) {
    // ignore
  }
  return el;
};

const _createElement = (tag: string, config: LovelaceCardConfig) => {
  const element = document.createElement(tag) as any;
  try {
    element.setConfig(config);
  } catch (err) {
    console.error(tag, err);
    return _createErrorCardElement((err as Error).message, config);
  }
  return element;
};

export const createThing = (cardConfig: LovelaceCardConfig) => {
  if (!cardConfig || typeof cardConfig !== "object" || !cardConfig.type) {
    return _createErrorCardElement("No type defined", cardConfig);
  }

  const { type } = cardConfig;

  if (type.startsWith("custom:")) {
    const tag = type.slice("custom:".length);
    if (customElements.get(tag)) {
      return _createElement(tag, cardConfig);
    }

    const element = _createErrorCardElement(
      `Custom element doesn't exist: ${tag}.`,
      cardConfig
    );
    element.style.display = "None";
    const timer = window.setTimeout(() => {
      element.style.display = "";
    }, TIMEOUT);

    customElements.whenDefined(tag).then(() => {
      clearTimeout(timer);
      fireEvent(element, "ll-rebuild");
    });

    return element;
  }

  const tag = `hui-${type}-card`;
  if (customElements.get(tag)) {
    return _createElement(tag, cardConfig);
  }

  const element = _createErrorCardElement(
    `Unknown card type: ${type}.`,
    cardConfig
  );
  element.style.display = "None";
  const timer = window.setTimeout(() => {
    element.style.display = "";
  }, TIMEOUT);

  customElements.whenDefined(tag).then(() => {
    clearTimeout(timer);
    fireEvent(element, "ll-rebuild");
  });

  return element;
};
