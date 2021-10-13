import { fireEvent } from 'custom-card-helpers';
import { noChange } from 'lit';
import { AttributePart, directive, Directive, DirectiveParameters } from 'lit/directive.js';

import { deepEqual } from './deep-equal';

interface ActionHandler extends HTMLElement {
  holdTime: number;
  bind(element: Element, options?: ActionHandlerOptions): void;
}
interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions;
    start?: (ev: Event) => void;
    end?: (ev: Event) => void;
    handleEnter?: (ev: KeyboardEvent) => void;
  };
}

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

class ActionHandler extends HTMLElement implements ActionHandler {
  public holdTime = 500;
  protected timer?: number;
  private dblClickTimeout?: number;

  public bind(element: ActionHandlerElement, options: ActionHandlerOptions) {
    if (element.actionHandler && deepEqual(options, element.actionHandler.options)) {
      return;
    }

    if (element.actionHandler) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      element.removeEventListener('click', element.actionHandler.end!);
    }
    element.actionHandler = { options };

    if (options.disabled) {
      return;
    }

    element.actionHandler.end = (ev: Event): void => {
      const target = element; //ev.target as HTMLElement;
      // Prevent mouse event if touch event
      if (ev.cancelable) {
        ev.preventDefault();
      }
      clearTimeout(this.timer);
      this.timer = undefined;
      if (options.hasDoubleClick) {
        if ((ev.type === 'click' && (ev as MouseEvent).detail < 2) || !this.dblClickTimeout) {
          this.dblClickTimeout = window.setTimeout(() => {
            this.dblClickTimeout = undefined;
            fireEvent(target, 'action', { action: 'tap' });
          }, 250);
        } else {
          clearTimeout(this.dblClickTimeout);
          this.dblClickTimeout = undefined;
          fireEvent(target, 'action', { action: 'double_tap' });
        }
      } else {
        fireEvent(target, 'action', { action: 'tap' });
      }
    };
    element.addEventListener('click', element.actionHandler.end);
  }
}

customElements.define('action-handler-power-distribution-card', ActionHandler);

const getActionHandler = (): ActionHandler => {
  const body = document.body;
  if (body.querySelector('action-handler-power-distribution-card')) {
    return body.querySelector('action-handler-power-distribution-card') as ActionHandler;
  }

  const actionhandler = document.createElement('action-handler-power-distribution-card');
  body.appendChild(actionhandler);

  return actionhandler as ActionHandler;
};

export const actionHandlerBind = (element: ActionHandlerElement, options?: ActionHandlerOptions): void => {
  const actionhandler: ActionHandler = getActionHandler();
  if (!actionhandler) {
    return;
  }
  actionhandler.bind(element, options);
};

export const actionHandler = directive(
  class extends Directive {
    update(part: AttributePart, [options]: DirectiveParameters<this>) {
      actionHandlerBind(part.element as ActionHandlerElement, options);
      return noChange;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    render(_options?: ActionHandlerOptions) {}
  },
);
