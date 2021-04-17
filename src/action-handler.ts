import { fireEvent } from 'custom-card-helpers';
import { ActionHandlerOptions } from 'custom-card-helpers/dist/types';
import { directive, PropertyPart } from 'lit-html';

interface ActionHandler extends HTMLElement {
  holdTime: number;
  bind(element: Element, options): void;
}

interface ActionHandlerElement extends HTMLElement {
  actionHandler?: boolean;
}

class ActionHandler extends HTMLElement implements ActionHandler {
  public holdTime = 500;
  protected timer?: number;
  private dblClickTimeout?: number;

  public bind(element: ActionHandlerElement, options): void {
    if (element.actionHandler) {
      return;
    }
    element.actionHandler = true;

    const end = (ev: Event): void => {
      // Prevent mouse event if touch event
      ev.preventDefault();
      clearTimeout(this.timer);
      this.timer = undefined;
      if (options.hasDoubleClick) {
        if ((ev.type === 'click' && (ev as MouseEvent).detail < 2) || !this.dblClickTimeout) {
          this.dblClickTimeout = window.setTimeout(() => {
            this.dblClickTimeout = undefined;
            fireEvent(element, 'action', { action: 'tap' });
          }, 250);
        } else {
          clearTimeout(this.dblClickTimeout);
          this.dblClickTimeout = undefined;
          fireEvent(element, 'action', { action: 'double_tap' });
        }
      } else {
        fireEvent(element, 'action', { action: 'tap' });
      }
    };

    element.addEventListener('click', end);
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

export const actionHandlerBind = (element: ActionHandlerElement, options: ActionHandlerOptions): void => {
  const actionhandler: ActionHandler = getActionHandler();
  if (!actionhandler) {
    return;
  }
  actionhandler.bind(element, options);
};

export const actionHandler = directive((options: ActionHandlerOptions = {}) => (part: PropertyPart): void => {
  actionHandlerBind(part.committer.element as ActionHandlerElement, options);
});
