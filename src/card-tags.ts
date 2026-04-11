// Build-time constant injected by rollup: '-dev' in watch mode, '' in production.
// Never edit this value manually — change the rollup config or npm scripts instead.
declare const __DEV_SUFFIX__: string;

export const CARD_TAG = `power-distribution-card${__DEV_SUFFIX__}`;
export const EDITOR_TAG = `${CARD_TAG}-editor`;
export const ITEM_EDITOR_TAG = `${CARD_TAG}-item-editor`;
export const BAR_EDITOR_TAG = `${CARD_TAG}-bar-editor`;
export const ITEMS_EDITOR_TAG = `${CARD_TAG}-items-editor`;
export const ACTION_HANDLER_TAG = `action-handler${__DEV_SUFFIX__}-power-distribution-card`;
