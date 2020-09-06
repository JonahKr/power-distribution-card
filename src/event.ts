export async function moreInfo(entity) {
    const root = document.querySelector("hc-main") || document.querySelector("home-assistant");
    fireEvent("hass-more-info", {entityId: entity});
  }

export function fireEvent(ev, detail: Object) {
    ev = new Event(ev, {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    ev.detail = detail || {};
    this.dispatchEvent(ev);
  }