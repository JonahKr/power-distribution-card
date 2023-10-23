import ResizeObserver from 'resize-observer-polyfill';

/**
 * Installing the ResizeObserver Polyfill
 */
export const installResizeObserver = async (): Promise<void> => {
  if (typeof ResizeObserver !== 'function') {
    window.ResizeObserver = (await import('resize-observer-polyfill')).default;
  }
};

export function fireEvent<T>(node: HTMLElement | Window, type: string, detail: T): void {
  const event = new CustomEvent(type, { bubbles: false, composed: false, detail: detail });
  node.dispatchEvent(event);
}
