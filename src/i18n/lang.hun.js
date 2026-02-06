/**
 * Hungarian (Magyar) language data for recipe ingredient parser
 *
 * Structure:
 * - unitTranslations: Hungarian names/plurals/singular for units defined in English
 * - All other data: Hungarian-specific linguistic data (prepositions, instructions, etc.)
 *
 * Unit metadata (system, unitType, conversionFactor, etc.) comes from English.
 * This file only provides Hungarian translations (names, singular, plural, symbol).
 */

import { unitTranslations as unitTranslationsEng } from './lang.eng.js';

const extendNames = (base, extras) => Array.from(new Set([...(base || []), ...extras]));

const unitTranslations = {
  ...unitTranslationsEng,
  gram: {
    ...unitTranslationsEng.gram,
    names: extendNames(unitTranslationsEng.gram.names, ['gramm', 'g', 'g.']),
    singular: 'gramm',
    plural: 'gramm',
    symbol: 'g',
  },
  milligram: {
    ...unitTranslationsEng.milligram,
    names: extendNames(unitTranslationsEng.milligram.names, ['milligramm', 'mg', 'mg.']),
    singular: 'milligramm',
    plural: 'milligramm',
    symbol: 'mg',
  },
  kilogram: {
    ...unitTranslationsEng.kilogram,
    names: extendNames(unitTranslationsEng.kilogram.names, ['kilogramm', 'kg', 'kg.']),
    singular: 'kilogramm',
    plural: 'kilogramm',
    symbol: 'kg',
  },
  milliliter: {
    ...unitTranslationsEng.milliliter,
    names: extendNames(unitTranslationsEng.milliliter.names, ['milliliter', 'ml', 'ml.']),
    singular: 'milliliter',
    plural: 'milliliter',
    symbol: 'ml',
  },
  liter: {
    ...unitTranslationsEng.liter,
    names: extendNames(unitTranslationsEng.liter.names, ['liter', 'l', 'l.']),
    singular: 'liter',
    plural: 'liter',
    symbol: 'l',
  },
  teaspoon: {
    ...unitTranslationsEng.teaspoon,
    names: extendNames(unitTranslationsEng.teaspoon.names, [
      'teáskanál',
      'teaskanal',
      'tk',
      'tk.',
    ]),
    singular: 'teáskanál',
    plural: 'teáskanál',
    symbol: 'tk',
  },
  tablespoon: {
    ...unitTranslationsEng.tablespoon,
    names: extendNames(unitTranslationsEng.tablespoon.names, [
      'evőkanál',
      'evokanal',
      'ek',
      'ek.',
    ]),
    singular: 'evőkanál',
    plural: 'evőkanál',
    symbol: 'ek',
  },
  cup: {
    ...unitTranslationsEng.cup,
    names: extendNames(unitTranslationsEng.cup.names, ['csésze', 'csesze']),
    singular: 'csésze',
    plural: 'csésze',
    symbol: 'cs',
  },
  pinch: {
    ...unitTranslationsEng.pinch,
    names: extendNames(unitTranslationsEng.pinch.names, ['csipet', 'csipetnyi']),
    singular: 'csipet',
    plural: 'csipet',
    symbol: '',
  },
  dash: {
    ...unitTranslationsEng.dash,
    names: extendNames(unitTranslationsEng.dash.names, ['csöpp', 'csopp']),
    singular: 'csöpp',
    plural: 'csöpp',
    symbol: '',
  },
  clove: {
    ...unitTranslationsEng.clove,
    names: extendNames(unitTranslationsEng.clove.names, ['gerezd', 'gerezdek']),
    singular: 'gerezd',
    plural: 'gerezd',
    symbol: '',
  },
  second: {
    ...unitTranslationsEng.second,
    names: extendNames(unitTranslationsEng.second.names, ['másodperc', 'masodperc', 'mp', 'mp.']),
    singular: 'másodperc',
    plural: 'másodperc',
    symbol: 'mp',
  },
  minute: {
    ...unitTranslationsEng.minute,
    names: extendNames(unitTranslationsEng.minute.names, ['perc', 'p']),
    singular: 'perc',
    plural: 'perc',
    symbol: 'p',
  },
  hour: {
    ...unitTranslationsEng.hour,
    names: extendNames(unitTranslationsEng.hour.names, ['óra', 'ora', 'ó', 'o']),
    singular: 'óra',
    plural: 'óra',
    symbol: 'ó',
  },
  celsius: {
    ...unitTranslationsEng.celsius,
    names: extendNames(unitTranslationsEng.celsius.names, [
      'celsius',
      '°c',
      'ºc',
      'c',
      'fok',
      'celsius fok',
    ]),
    singular: 'celsius',
    plural: 'celsius',
    symbol: '°C',
  },
  fahrenheit: {
    ...unitTranslationsEng.fahrenheit,
    names: extendNames(unitTranslationsEng.fahrenheit.names, [
      'fahrenheit',
      '°f',
      'ºf',
      'f',
    ]),
    singular: 'fahrenheit',
    plural: 'fahrenheit',
    symbol: '°F',
  },
};

const prepositions = [];

const joiners = ['ig', 'vagy'];

const toTaste = ['ízlés szerint'];

const toTasteAdditional = ['több', 'kevesebb', 'vagy', 'még', 'ízlés szerint'];

const additionalStopwords = [];

const approx = ['kb.', 'körülbelül', 'hozzávetőlegesen', '~'];

const optional = ['opcionális', 'elhagyható', 'ha szeretnéd'];

const toServe = ['tálaláshoz', 'tálalásra', 'díszítéshez', 'díszítésre'];

const instructions = [
  'aprított',
  'felkockázott',
  'szeletelt',
  'reszelt',
  'zúzott',
  'hámozott',
  'mag nélküli',
  'lecsöpögtetett',
  'olvasztott',
  'puhított',
  'meleg',
  'hideg',
  'sült',
  'főtt',
  'pirított',
  'nyers',
];

const adverbs = ['finomra', 'durvára', 'frissen'];

const numbersSmall = {
  nulla: 0,
  egy: 1,
  kettő: 2,
  ketto: 2,
  három: 3,
  harom: 3,
  négy: 4,
  negy: 4,
  öt: 5,
  ot: 5,
  hat: 6,
  hét: 7,
  het: 7,
  nyolc: 8,
  kilenc: 9,
  tíz: 10,
  tiz: 10,
  tizenegy: 11,
  tizenkettő: 12,
  tizenketto: 12,
  tizenhárom: 13,
  tizenharom: 13,
  tizennégy: 14,
  tizennegy: 14,
  tizenöt: 15,
  tizenot: 15,
  tizenhat: 16,
  tizenhét: 17,
  tizenhet: 17,
  tizennyolc: 18,
  tizenkilenc: 19,
  húsz: 20,
  husz: 20,
  harminc: 30,
  negyven: 40,
  ötven: 50,
  otven: 50,
  hatvan: 60,
  hetven: 70,
  nyolcvan: 80,
  kilencven: 90,
};

const numbersMagnitude = {
  száz: 100,
  szaz: 100,
  ezer: 1000,
  millió: 1000000,
  millio: 1000000,
  milliárd: 1000000000,
  milliard: 1000000000,
  billió: 1000000000000,
  billio: 1000000000000,
};

const problematicUnits = {
  clove: ['fokhagyma'],
};

const badgeLabels = {
  approx: {
    short: 'kb',
    label: 'kb.',
    title: 'Körülbelül',
  },
  optional: {
    short: 'opc',
    label: 'opcionális',
    title: 'Opcionális',
  },
  toServe: {
    short: 'tál',
    label: 'tálaláshoz',
    title: 'Tálaláshoz',
  },
  toTaste: {
    short: 'ízl',
    label: 'ízlés szerint',
    title: 'Ízlés szerint',
  },
};

const languageName = 'Magyar';

export const langHun = {
  unitTranslations,

  languageName,
  prepositions,
  joiners,
  toTaste,
  toTasteAdditional,
  additionalStopwords,
  optional,
  toServe,
  instructions,
  adverbs,
  approx,
  numbersSmall,
  numbersMagnitude,
  problematicUnits,
  badgeLabels,
  isCommaDelimited: true,
};
