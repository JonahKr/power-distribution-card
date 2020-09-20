export async function moreInfo(node: HTMLElement | Window, entity: string): Promise<void> {
  fireEvent(node, 'hass-more-info', { entityId: entity });
}

interface eventDetail {
  entityId: string;
}

export function fireEvent(node: HTMLElement | Window, eventname: string, detail: eventDetail): void {
  const ev = new Event(eventname, { bubbles: true, cancelable: false, composed: true });
  ev.detail = detail || {};
  node.dispatchEvent(ev);
}
