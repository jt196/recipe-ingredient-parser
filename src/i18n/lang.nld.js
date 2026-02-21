/**
 * Dutch (Nederlands) language data for recipe ingredient parser
 *
 * Structure:
 * - unitTranslations: Dutch names/plurals/singular for units defined in English
 * - All other data: Dutch-specific linguistic data (prepositions, instructions, etc.)
 *
 * Unit metadata (system, unitType, conversionFactor, etc.) comes from English.
 * This file only provides Dutch translations (names, singular, plural, symbol).
 */

import { unitTranslations as unitTranslationsEng } from './lang.eng.js';

const extendNames = (base, extras) => Array.from(new Set([...(base || []), ...extras]));

const unitTranslations = {
  ...unitTranslationsEng,
  gram: {
    ...unitTranslationsEng.gram,
    names: extendNames(unitTranslationsEng.gram.names, ['gram', 'grammen', 'g', 'g.']),
    singular: 'gram',
    plural: 'gram',
    symbol: 'g',
  },
  milligram: {
    ...unitTranslationsEng.milligram,
    names: extendNames(unitTranslationsEng.milligram.names, [
      'milligram',
      'milligrammen',
      'mg',
      'mg.',
    ]),
    singular: 'milligram',
    plural: 'milligram',
    symbol: 'mg',
  },
  kilogram: {
    ...unitTranslationsEng.kilogram,
    names: extendNames(unitTranslationsEng.kilogram.names, ['kilogram', 'kilo', 'kg', 'kg.']),
    singular: 'kilogram',
    plural: 'kilogram',
    symbol: 'kg',
  },
  milliliter: {
    ...unitTranslationsEng.milliliter,
    names: extendNames(unitTranslationsEng.milliliter.names, [
      'milliliter',
      'millilitre',
      'milliliters',
      'millilitres',
      'ml',
      'ml.',
    ]),
    singular: 'milliliter',
    plural: 'milliliter',
    symbol: 'ml',
  },
  liter: {
    ...unitTranslationsEng.liter,
    names: extendNames(unitTranslationsEng.liter.names, ['liter', 'liters', 'l', 'l.']),
    singular: 'liter',
    plural: 'liter',
    symbol: 'l',
  },
  teaspoon: {
    ...unitTranslationsEng.teaspoon,
    names: extendNames(unitTranslationsEng.teaspoon.names, [
      'theelepel',
      'theelepels',
      'tl',
      'tl.',
    ]),
    singular: 'theelepel',
    plural: 'theelepels',
    symbol: 'tl',
  },
  tablespoon: {
    ...unitTranslationsEng.tablespoon,
    names: extendNames(unitTranslationsEng.tablespoon.names, [
      'eetlepel',
      'eetlepels',
      'el',
      'el.',
    ]),
    singular: 'eetlepel',
    plural: 'eetlepels',
    symbol: 'el',
  },
  cup: {
    ...unitTranslationsEng.cup,
    names: extendNames(unitTranslationsEng.cup.names, ['kopje', 'kopjes', 'cup', 'cups']),
    singular: 'kopje',
    plural: 'kopjes',
    symbol: 'kop',
  },
  pinch: {
    ...unitTranslationsEng.pinch,
    names: extendNames(unitTranslationsEng.pinch.names, ['snufje', 'snufjes']),
    singular: 'snufje',
    plural: 'snufjes',
    symbol: '',
  },
  clove: {
    ...unitTranslationsEng.clove,
    names: extendNames(unitTranslationsEng.clove.names, ['teentje', 'teentjes']),
    singular: 'teentje',
    plural: 'teentjes',
    symbol: '',
  },
  piece: {
    ...unitTranslationsEng.piece,
    names: extendNames(unitTranslationsEng.piece.names, ['stuk', 'stuks']),
    singular: 'stuk',
    plural: 'stuks',
    symbol: '',
  },
  second: {
    ...unitTranslationsEng.second,
    names: extendNames(unitTranslationsEng.second.names, ['seconde', 'seconden', 'sec', 's', 's.']),
    singular: 'seconde',
    plural: 'seconden',
    symbol: 's',
  },
  minute: {
    ...unitTranslationsEng.minute,
    names: extendNames(unitTranslationsEng.minute.names, ['minuut', 'minuten', 'min', 'min.']),
    singular: 'minuut',
    plural: 'minuten',
    symbol: 'min',
  },
  hour: {
    ...unitTranslationsEng.hour,
    names: extendNames(unitTranslationsEng.hour.names, ['uur', 'uren', 'u', 'u.']),
    singular: 'uur',
    plural: 'uren',
    symbol: 'u',
  },
  celsius: {
    ...unitTranslationsEng.celsius,
    names: extendNames(unitTranslationsEng.celsius.names, ['celsius', '°c', 'ºc', 'c', 'graden celsius']),
    singular: 'celsius',
    plural: 'celsius',
    symbol: '°C',
  },
  fahrenheit: {
    ...unitTranslationsEng.fahrenheit,
    names: extendNames(unitTranslationsEng.fahrenheit.names, ['fahrenheit', '°f', 'ºf', 'f']),
    singular: 'fahrenheit',
    plural: 'fahrenheit',
    symbol: '°F',
  },
};

const prepositions = ['van'];

const joiners = ['tot', 'of'];

const toTaste = ['naar smaak'];

const toTasteAdditional = ['meer', 'minder', 'of', 'extra', 'naar smaak'];

const additionalStopwords = ['en'];

const approx = ['ongeveer', 'circa', 'ca.', '~'];

const optional = ['optioneel', 'naar wens'];

const toServe = ['om te serveren', 'voor het serveren', 'ter garnering'];

const instructions = [
  'gehakt',
  'fijngehakt',
  'gesnipperd',
  'gesneden',
  'in blokjes',
  'geraspt',
  'geperst',
  'gepeld',
  'ontpit',
  'uitgelekt',
  'gesmolten',
  'zacht',
  'warm',
  'koud',
  'gebakken',
  'gekookt',
  'geroosterd',
  'rauw',
];

const adverbs = ['fijn', 'grof', 'dun', 'vers'];

const numbersSmall = {
  nul: 0,
  een: 1,
  twee: 2,
  drie: 3,
  vier: 4,
  vijf: 5,
  zes: 6,
  zeven: 7,
  acht: 8,
  negen: 9,
  tien: 10,
  elf: 11,
  twaalf: 12,
  dertien: 13,
  veertien: 14,
  vijftien: 15,
  zestien: 16,
  zeventien: 17,
  achttien: 18,
  negentien: 19,
  twintig: 20,
  dertig: 30,
  veertig: 40,
  vijftig: 50,
  zestig: 60,
  zeventig: 70,
  tachtig: 80,
  negentig: 90,
};

const numbersMagnitude = {
  honderd: 100,
  duizend: 1000,
  miljoen: 1000000,
  miljard: 1000000000,
  biljoen: 1000000000000,
};

const problematicUnits = {
  clove: ['knoflook'],
};

const badgeLabels = {
  approx: {
    short: 'ca',
    label: 'ongeveer',
    title: 'Ongeveer',
  },
  optional: {
    short: 'opt',
    label: 'optioneel',
    title: 'Optioneel',
  },
  toServe: {
    short: 'srv',
    label: 'om te serveren',
    title: 'Om te serveren',
  },
  toTaste: {
    short: 'smk',
    label: 'naar smaak',
    title: 'Naar smaak',
  },
};

const nutrition = {
  nutrientAliasExtras: {
    calories: ['calorieën', 'calorieen', 'energie'],
    carbohydrates: ['koolhydraten'],
    protein: ['eiwit', 'eiwitten'],
    fat: ['vet', 'vetten'],
    saturatedFat: ['verzadigd vet', 'verzadigde vetten'],
    fiber: ['vezels', 'voedingsvezels'],
    sugar: ['suiker', 'suikers'],
    sodium: ['natrium'],
  },
  perServingPhrases: ['per portie', 'per serving', 'portie:'],
  ignoreTokenExtras: ['voedingswaarden', 'voedingsinformatie'],
  extraUnitAliasExtras: {
    kcal: ['calorie', 'calorieen', 'calorieën'],
    kj: ['kilojoule', 'kilojoules'],
  },
};

const languageName = 'Nederlands';
const languageTag = 'nl';

export const langNld = {
  unitTranslations,
  badgeLabels,
  nutrition,
  languageName,
  languageTag,
  prepositions,
  joiners,
  toTaste,
  toTasteAdditional,
  additionalStopwords,
  approx,
  optional,
  toServe,
  instructions,
  adverbs,
  numbersSmall,
  numbersMagnitude,
  problematicUnits,
  isCommaDelimited: true,
};
