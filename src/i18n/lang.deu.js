/**
 * German (Deutsch) language data for recipe ingredient parser
 *
 * Structure:
 * - unitTranslations: German names/plurals/singular for units defined in English
 * - All other data: German-specific linguistic data (prepositions, instructions, etc.)
 *
 * Unit metadata (system, unitType, conversionFactor, etc.) comes from English.
 * This file only provides German translations (names, singular, plural, symbol).
 */

/**
 * German translations for units defined in English base (lang.eng.js).
 *
 * Keys are English canonical unit names.
 * Values contain German-specific data:
 * - names: Array of German unit name variants
 * - singular: German singular form
 * - plural: German plural form
 * - symbol: German symbol (if different from English)
 */
export const unitTranslations = {
  gram: {
    names: ['gramm', 'g', 'g.'],
    singular: 'Gramm',
    plural: 'Gramm',
    symbol: 'g',
  },
  milligram: {
    names: ['milligramm', 'mg', 'mg.'],
    singular: 'Milligramm',
    plural: 'Milligramm',
    symbol: 'mg',
  },
  kilogram: {
    names: ['kilogramm', 'kg', 'kg.'],
    singular: 'Kilogramm',
    plural: 'Kilogramm',
    symbol: 'kg',
  },
  milliliter: {
    names: ['milliliter', 'ml', 'ml.'],
    singular: 'Milliliter',
    plural: 'Milliliter',
    symbol: 'ml',
  },
  liter: {
    names: ['liter', 'l', 'l.', 'lt'],
    singular: 'Liter',
    plural: 'Liter',
    symbol: 'L',
  },
  teaspoon: {
    names: ['Teelöffel', 'tl', 'tl.'],
    singular: 'Teelöffel',
    plural: 'Teelöffel',
    symbol: 'TL',
  },
  tablespoon: {
    names: ['esslöffel', 'el', 'el.', 'essl', 'essl.'],
    singular: 'Esslöffel',
    plural: 'Esslöffel',
    symbol: 'EL',
  },
  coffeespoon: {
    names: ['kaffeelöffel', 'kl', 'kl.'],
    singular: 'Kaffeelöffel',
    plural: 'Kaffeelöffel',
    symbol: 'KL',
  },
  ounce: {
    names: ['unze', 'oz', 'oz.'],
    singular: 'Unze',
    plural: 'Unzen',
    symbol: 'oz',
  },
  pound: {
    names: ['pfund', 'lb', 'lb.', 'lbs', 'lbs.', 'Lb', 'Lbs'],
    singular: 'Pfund',
    plural: 'Pfund',
    symbol: 'lb',
  },
  dozen: {
    names: ['dutzend'],
    singular: 'Dutzend',
    plural: 'Dutzend',
    symbol: '',
  },
  can: {
    names: ['dose', 'dosen', 'dose(n)', 'dose/n'],
    singular: 'Dose',
    plural: 'Dosen',
    symbol: '',
  },
  cup: {
    names: ['tasse', 'tassen', 'tasse(n)', 'tasse/n'],
    singular: 'Tasse',
    plural: 'Tassen',
    symbol: '',
  },
  pinch: {
    names: ['prise', 'prisen', 'prise(n)', 'prise/n'],
    singular: 'Prise',
    plural: 'Prisen',
    symbol: '',
  },
  piece: {
    names: ['stück', 'stücke', 'stück(e)', 'stück/e'],
    singular: 'Stück',
    plural: 'Stücke',
    symbol: '',
  },
  slice: {
    names: ['Scheibe', 'Scheibe/n', 'Scheibe(n)'],
    singular: 'Scheibe',
    plural: 'Scheiben',
    symbol: '',
  },
  drop: {
    names: ['tropfen', 'tropf', 'tropf(en)', 'tropf/en'],
    singular: 'Tropfen',
    plural: 'Tropfen',
    symbol: '',
  },
  clove: {
    names: ['Zehe', 'Zeh'],
    singular: 'Zehe',
    plural: 'Zehen',
    symbol: '',
  },
  stick: {
    names: ['stangen', 'stange', 'stange(n)', 'stange/n'],
    singular: 'Stange',
    plural: 'Stangen',
    symbol: '',
  },
  drizzle: {
    names: ['schuss', 'schusse', 'schüsse', 'schuss(e)', 'schuss/e', 'schuß'],
    singular: 'Schuss',
    plural: 'Schuss',
    symbol: '',
  },
  bottle: {
    names: ['flaschen', 'flasche', 'flasche(n)', 'flasche/n'],
    singular: 'Flasche',
    plural: 'Flaschen',
    symbol: '',
  },
  bunch: {
    names: ['bund', 'bunde', 'bund(e)', 'bund/e'],
    singular: 'Bund',
    plural: 'Bund',
    symbol: '',
  },
  serving: {
    names: ['portion', 'portionen'],
    singular: 'Portion',
    plural: 'Portionen',
    symbol: '',
  },
  centimetre: {
    names: ['zentimeter', 'cm'],
    singular: 'Zentimeter',
    plural: 'Zentimeter',
    symbol: 'cm',
  },
  ear: {
    names: ['ohr', 'ohren'],
    singular: 'Ohr',
    plural: 'Ohren',
    symbol: '',
  },
  few: {
    names: ['wenige'],
    singular: 'wenige',
    plural: 'wenige',
    symbol: '',
  },
  knob: {
    names: ['knopf'],
    singular: 'Knopf',
    plural: 'Knöpfe',
    symbol: '',
  },
  thumb: {
    names: ['daumen'],
    singular: 'Daumen',
    plural: 'Daumen',
    symbol: '',
  },
  pack: {
    names: ['pack', 'packung', 'pck', 'pck.', 'päckchen', 'paket', 'pakete'],
    singular: 'Pack',
    plural: 'Packung',
    symbol: 'Pck',
  },
};

const prepositions = ['von'];

const joiners = ['bis'];

const toTaste = ['nach geschmack'];

const toTasteAdditional = [
  'mehr',
  'anpassen',
  'würzen',
  'oder',
  'oder mehr',
  'ein bisschen mehr',
];

const additionalStopwords = ['und', 'oder'];

const approx = ['etwa', 'ca', 'ca.', 'circa', 'ungefähr', '~'];

const optional = ['optional', 'nach Belieben', 'nach Wunsch'];

const toServe = ['zum Servieren', 'zum Garnieren', 'garnieren'];

const instructions = [
  'gehackt',
  'gewürfelt',
  'in Scheiben geschnitten',
  'geschnitten',
  'zerkleinert',
  'zerdrückt',
  'gerieben',
  'julienne',
  'halbiert',
  'geviertelt',
  'geschält',
  'entkernt',
  'entsteint',
  'gespült',
  'gut gespült',
  'abgetropft',
  'gut abgetropft',
  'gepresst',
  'geschmolzen',
  'aufgeweicht',
  'erwärmt',
  'warm',
  'heiß',
  'lauwarm',
  'kalt',
  'gekühlt',
  'abgekühlt',
  'eisig',
  'reif',
  'ganz',
  'gekocht',
  'weich gekocht',
  'hart gekocht',
  'pochiert',
  'gemahlen',
  'übrig',
  'geröstet',
  'gebacken',
  'gegrillt',
  'gebraten',
  'angebraten',
  'karamellisiert',
  'gebräunt',
  'aufgetaut',
  'mariniert',
  'eingeweicht',
  'blanchiert',
  'zerkleinert',
  'zerschlagen',
  'püriert',
  'geschlagen',
  'verquirlt',
  'gemischt',
  'gerührt',
  'beschnitten',
  'entstielt',
  'entrippt',
  'gewürfelt',
  'zerrissen',
  'klein',
  'mittel',
  'groß',
  'ausgepresst',
  'gerieben',
  'trocken',
  'gestrichen',
  'gekauft',
  'selbstgemacht',
  'zimmertemperatur',
  'zum Einfetten',
  'für die Pfanne',
  'entsteint',
  'zerkrümelt',
  'knusprig',
  'getrocknet',
  'gefüllt',
  'frisch',
  'gute Qualität',
  'gehäuft',
  'eisgekühlt',
  'zum Braten',
  'reserviert',
  'roh',
  'gesalzen',
  'ungesalzen',
  'dick',
  'dünn',
  'ungesüßt',
  'ungewürzt',
  'ungewachst',
  'zart',
  'ausgepresst',
  'Saft von',
  'abgerieben',
  'gebrochen',
  'gerissen',
  'geschält',
  'gewürfelt',
];

const adverbs = ['fein', 'grob', 'dünn', 'frisch', 'fest'];

const numbersSmall = {
  null: 0,
  ein: 1,
  eine: 1,
  eins: 1,
  zwei: 2,
  drei: 3,
  vier: 4,
  fünf: 5,
  sechs: 6,
  sieben: 7,
  acht: 8,
  neun: 9,
  zehn: 10,
  elf: 11,
  zwölf: 12,
  dreizehn: 13,
  vierzehn: 14,
  fünfzehn: 15,
  sechzehn: 16,
  siebzehn: 17,
  achtzehn: 18,
  neunzehn: 19,
  zwanzig: 20,
  dreißig: 30,
  vierzig: 40,
  fünfzig: 50,
  sechzig: 60,
  siebzig: 70,
  achtzig: 80,
  neunzig: 90,
};

const numbersMagnitude = {
  hundert: 100,
  tausend: 1000,
  million: 1000000,
  milliarde: 1000000000,
  billion: 1000000000000,
};

const problematicUnits = {
  clove: ['knoblauch', 'garlic'],
  // Add more problematic units here as needed
};

export const langDeu = {
  unitTranslations,
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
