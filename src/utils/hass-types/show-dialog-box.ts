// Derived From: https://github.com/home-assistant/frontend/blob/dev/src/dialogs/generic/show-dialog-box.ts
import { TemplateResult } from "lit";
import { fireEvent } from "./fire_event";


interface BaseDialogBoxParams {
  confirmText?: string;
  text?: string | TemplateResult;
  title?: string;
  warning?: boolean;
}

export interface AlertDialogParams extends BaseDialogBoxParams {
  confirm?: () => void;
}

export interface ConfirmationDialogParams extends BaseDialogBoxParams {
  dismissText?: string;
  confirm?: () => void;
  cancel?: () => void;
  destructive?: boolean;
}

export interface PromptDialogParams extends BaseDialogBoxParams {
  inputLabel?: string;
  dismissText?: string;
  inputType?: string;
  defaultValue?: string;
  placeholder?: string;
  confirm?: (out?: string) => void;
  cancel?: () => void;
  inputMin?: number | string;
  inputMax?: number | string;
}

export interface DialogBoxParams
  extends ConfirmationDialogParams,
    PromptDialogParams {
  confirm?: (out?: string) => void;
  confirmation?: boolean;
  prompt?: boolean;
}

const showDialogHelper = (
  element: HTMLElement,
  dialogParams: DialogBoxParams,
  extra?: {
    confirmation?: DialogBoxParams["confirmation"];
    prompt?: DialogBoxParams["prompt"];
  }
) =>
  new Promise((resolve) => {
    const origCancel = dialogParams.cancel;
    const origConfirm = dialogParams.confirm;

    fireEvent(element, "show-dialog", {
      dialogTag: "dialog-box",
      dialogParams: {
        ...dialogParams,
        ...extra,
        cancel: () => {
          resolve(extra?.prompt ? null : false);
          if (origCancel) {
            origCancel();
          }
        },
        confirm: (out) => {
          resolve(extra?.prompt ? out : true);
          if (origConfirm) {
            origConfirm(out);
          }
        },
      },
    });
  });

export const showConfirmationDialog = (
  element: HTMLElement,
  dialogParams: ConfirmationDialogParams
) =>
  showDialogHelper(element, dialogParams, {
    confirmation: true,
  }) as Promise<boolean>;