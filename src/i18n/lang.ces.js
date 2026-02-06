/**
 * Czech (Čeština) language data for recipe ingredient parser
 *
 * Structure:
 * - unitTranslations: Czech names/plurals/singular for units defined in English
 * - All other data: Czech-specific linguistic data (prepositions, instructions, etc.)
 *
 * Unit metadata (system, unitType, conversionFactor, etc.) comes from English.
 * This file only provides Czech translations (names, singular, plural, symbol).
 */

import { unitTranslations as unitTranslationsEng } from './lang.eng.js';

const extendNames = (base, extras) => Array.from(new Set([...(base || []), ...extras]));

const unitTranslations = {
  ...unitTranslationsEng,
  gram: {
    ...unitTranslationsEng.gram,
    names: extendNames(unitTranslationsEng.gram.names, ['gram', 'g', 'g.']),
    singular: 'gram',
    plural: 'gramů',
    symbol: 'g',
  },
  milligram: {
    ...unitTranslationsEng.milligram,
    names: extendNames(unitTranslationsEng.milligram.names, ['miligram', 'mg', 'mg.']),
    singular: 'miligram',
    plural: 'miligramů',
    symbol: 'mg',
  },
  kilogram: {
    ...unitTranslationsEng.kilogram,
    names: extendNames(unitTranslationsEng.kilogram.names, ['kilogram', 'kg', 'kg.']),
    singular: 'kilogram',
    plural: 'kilogramů',
    symbol: 'kg',
  },
  milliliter: {
    ...unitTranslationsEng.milliliter,
    names: extendNames(unitTranslationsEng.milliliter.names, ['mililitr', 'ml', 'ml.']),
    singular: 'mililitr',
    plural: 'mililitrů',
    symbol: 'ml',
  },
  liter: {
    ...unitTranslationsEng.liter,
    names: extendNames(unitTranslationsEng.liter.names, ['litr', 'l', 'l.']),
    singular: 'litr',
    plural: 'litrů',
    symbol: 'l',
  },
  teaspoon: {
    ...unitTranslationsEng.teaspoon,
    names: extendNames(unitTranslationsEng.teaspoon.names, [
      'čajová lžička',
      'cajova lzicka',
      'lžička',
      'lzicka',
      'čl',
      'cl',
      'čl.',
      'cl.',
    ]),
    singular: 'čajová lžička',
    plural: 'čajové lžičky',
    symbol: 'čl',
  },
  tablespoon: {
    ...unitTranslationsEng.tablespoon,
    names: extendNames(unitTranslationsEng.tablespoon.names, [
      'polévková lžíce',
      'polevkova lzice',
      'lžíce',
      'lzice',
      'pl',
      'pl.',
    ]),
    singular: 'polévková lžíce',
    plural: 'polévkové lžíce',
    symbol: 'pl',
  },
  cup: {
    ...unitTranslationsEng.cup,
    names: extendNames(unitTranslationsEng.cup.names, ['hrnek', 'hrnky', 'šálek', 'salek']),
    singular: 'hrnek',
    plural: 'hrnky',
    symbol: 'hr',
  },
  pinch: {
    ...unitTranslationsEng.pinch,
    names: extendNames(unitTranslationsEng.pinch.names, ['špetka', 'spetka']),
    singular: 'špetka',
    plural: 'špetky',
    symbol: '',
  },
  dash: {
    ...unitTranslationsEng.dash,
    names: extendNames(unitTranslationsEng.dash.names, ['kapka', 'kapky']),
    singular: 'kapka',
    plural: 'kapky',
    symbol: '',
  },
  clove: {
    ...unitTranslationsEng.clove,
    names: extendNames(unitTranslationsEng.clove.names, ['stroužek', 'strouzek', 'stroužky', 'strouzky']),
    singular: 'stroužek',
    plural: 'stroužky',
    symbol: '',
  },
  second: {
    ...unitTranslationsEng.second,
    names: extendNames(unitTranslationsEng.second.names, ['sekunda', 'sekundy', 's', 's.']),
    singular: 'sekunda',
    plural: 'sekundy',
    symbol: 's',
  },
  minute: {
    ...unitTranslationsEng.minute,
    names: extendNames(unitTranslationsEng.minute.names, ['minuta', 'minuty', 'min', 'min.']),
    singular: 'minuta',
    plural: 'minuty',
    symbol: 'min',
  },
  hour: {
    ...unitTranslationsEng.hour,
    names: extendNames(unitTranslationsEng.hour.names, ['hodina', 'hodiny', 'h', 'hod.']),
    singular: 'hodina',
    plural: 'hodiny',
    symbol: 'h',
  },
  celsius: {
    ...unitTranslationsEng.celsius,
    names: extendNames(unitTranslationsEng.celsius.names, [
      'celsius',
      '°c',
      'ºc',
      'c',
      'stupňů c',
      'stupnu c',
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

const joiners = ['až', 'nebo'];

const toTaste = ['dle chuti'];

const toTasteAdditional = ['více', 'méně', 'nebo', 'ještě'];

const additionalStopwords = [];

const approx = ['cca', 'přibližně', 'priblizne', '~'];

const optional = ['volitelně', 'volitelné', 'dle chuti'];

const toServe = ['k podávání', 'na podávání', 'na ozdobu', 'k ozdobě'];

const instructions = [
  'nasekané',
  'nakrájené',
  'na kostičky',
  'na plátky',
  'strouhané',
  'drcené',
  'loupané',
  'bez pecek',
  'okapané',
  'rozpuštěné',
  'měkké',
  'teplé',
  'studené',
  'pečené',
  'vařené',
  'opečené',
  'syrové',
];

const adverbs = ['jemně', 'nahrubo', 'čerstvě', 'cerstve'];

const numbersSmall = {
  nula: 0,
  jedna: 1,
  jeden: 1,
  dva: 2,
  dvě: 2,
  dve: 2,
  tři: 3,
  tri: 3,
  čtyři: 4,
  ctyri: 4,
  pět: 5,
  pet: 5,
  šest: 6,
  sest: 6,
  sedm: 7,
  osm: 8,
  devět: 9,
  devet: 9,
  deset: 10,
  jedenáct: 11,
  jedenact: 11,
  dvanáct: 12,
  dvanact: 12,
  třináct: 13,
  trinact: 13,
  čtrnáct: 14,
  ctrnact: 14,
  patnáct: 15,
  patnact: 15,
  šestnáct: 16,
  sestnact: 16,
  sedmnáct: 17,
  sedmnact: 17,
  osmnáct: 18,
  osmnact: 18,
  devatenáct: 19,
  devatenact: 19,
  dvacet: 20,
  třicet: 30,
  tricet: 30,
  čtyřicet: 40,
  ctyricet: 40,
  padesát: 50,
  padesat: 50,
  šedesát: 60,
  sedesat: 60,
  sedmdesát: 70,
  sedmdesat: 70,
  osmdesát: 80,
  osmdesat: 80,
  devadesát: 90,
  devadesat: 90,
};

const numbersMagnitude = {
  sto: 100,
  tisíc: 1000,
  tisic: 1000,
  milion: 1000000,
  miliarda: 1000000000,
  bilion: 1000000000000,
};

const problematicUnits = {
  clove: ['česnek', 'cesnek'],
};

const badgeLabels = {
  approx: {
    short: 'cca',
    label: 'cca',
    title: 'Přibližně',
  },
  optional: {
    short: 'vol',
    label: 'volitelně',
    title: 'Volitelně',
  },
  toServe: {
    short: 'pod',
    label: 'k podávání',
    title: 'K podávání',
  },
  toTaste: {
    short: 'chu',
    label: 'dle chuti',
    title: 'Dle chuti',
  },
};

const languageName = 'Čeština';

export const langCes = {
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
