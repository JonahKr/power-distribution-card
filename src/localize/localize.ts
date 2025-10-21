import * as en from './languages/en.json';
import * as de from './languages/de.json';
import * as sk from './languages/sk.json';
import { HaFormSchema } from '../editor/ha-form';

const languages = {
  en: en,
  de: de,
  sk: sk,
};

/**
 * Translating Strings to different languages.
 * Thanks to custom-cards/spotify-card
 * @param string The Section-Key Pair
 * @param search String which should be replaced
 * @param replace String to replace with
 */
export function localize(string: string, capitalized = false, search = '', replace = ''): string {
  const lang = (localStorage.getItem('selectedLanguage') || navigator.language.split('-')[0] || 'en')
    .replace(/['"]+/g, '')
    .replace('-', '_');

  let translated: string;
  try {
    translated = string.split('.').reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    translated = string.split('.').reduce((o, i) => o[i], languages['en']) as unknown as string;
  }

  if (translated === undefined)
    translated = string.split('.').reduce((o, i) => o[i], languages['en']) as unknown as string;

  if (search !== '' && replace !== '') {
    translated = translated.replace(search, replace);
  }
  return capitalized ? capitalizeFirstLetter(translated) : translated;
}

function capitalizeFirstLetter(string: string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function computeLabel(schema: HaFormSchema) {
  return `${localize('editor.settings.' + schema.name)} ${!schema.required ? `(${localize('editor.optional')})` : ''}`;
}