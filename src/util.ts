// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

// eslint-disable-next-line: ban-types
export const debounce = <T extends (...args) => unknown>(func: T, wait: number, immediate = false): T => {
  let timeout;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return function (...args) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};

import ResizeObserver from 'resize-observer-polyfill';

/**
 * Installing the ResizeObserver Polyfill
 */
export const installResizeObserver = async (): Promise<void> => {
  if (typeof ResizeObserver !== 'function') {
    window.ResizeObserver = (await import('resize-observer-polyfill')).default;
  }
};

/**
 * This Part of Code is directly from Homeassistant Core, 2020-12-17
 * https://github.com/home-assistant/frontend/blob/f335fdc00245c0cb404ca261a61946c33f167250/src/common/string/format_number.ts
 */

/**
 * Formats a number based on the specified language with thousands separator(s) and decimal character for better legibility.
 *
 * @param num The number to format
 * @param language The language to use when formatting the number
 */
export const formatNumber = (num: string | number, language: string, options?: Intl.NumberFormatOptions): string => {
  // Polyfill for Number.isNaN, which is more reliable than the global isNaN()
  Number.isNaN =
    Number.isNaN ||
    function isNaN(input) {
      return typeof input === 'number' && isNaN(input);
    };

  if (!Number.isNaN(Number(num)) && Intl) {
    return new Intl.NumberFormat(language, getDefaultFormatOptions(num, options)).format(Number(num));
  }
  return num.toString();
};

/**
 * Generates default options for Intl.NumberFormat
 * @param num The number to be formatted
 * @param options The Intl.NumberFormatOptions that should be included in the returned options
 */
const getDefaultFormatOptions = (
  num: string | number,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions => {
  const defaultOptions: Intl.NumberFormatOptions = options || {};

  if (typeof num !== 'string') {
    return defaultOptions;
  }

  // Keep decimal trailing zeros if they are present in a string numeric value
  if (!options || (!options.minimumFractionDigits && !options.maximumFractionDigits)) {
    const digits = num.indexOf('.') > -1 ? num.split('.')[1].length : 0;
    defaultOptions.minimumFractionDigits = digits;
    defaultOptions.maximumFractionDigits = digits;
  }

  return defaultOptions;
};
