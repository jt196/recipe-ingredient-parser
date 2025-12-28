// ============================================================================
// NEW: Unified units data - single source of truth for all unit information
// ============================================================================
const unitsData = {
  // SMALL VOLUME UNITS (skip conversion)
  drop: {
    names: ['drop', 'drops', 'dr.', 'dr', 'drs.', 'drs', 'gt.', 'gt', 'gts.', 'gts', 'gtt', 'gtt.', 'gtts', 'gtts.'],
    plural: 'drops',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.05 },
    skipConversion: true,
    decimalPlaces: 0
  },
  smidgen: {
    names: ['smidgen', 'smidgens', 'smdg.', 'smdg', 'smdgs.', 'smdgs', 'smi', 'smi.', 'smis.', 'smis'],
    plural: 'smidgens',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.18 },
    skipConversion: true,
    decimalPlaces: 0
  },
  pinch: {
    names: ['pinch', 'pinches', 'pinchs', 'pn.', 'pn', 'pns.', 'pns'],
    plural: 'pinches',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.36 },
    skipConversion: true,
    decimalPlaces: 0
  },
  dash: {
    names: ['dash', 'dashs', 'dashes', 'splash', 'splashes', 'ds.', 'ds', 'dss.', 'dss'],
    plural: 'dashes',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.72 },
    skipConversion: true,
    decimalPlaces: 0
  },
  saltspoon: {
    names: ['saltspoon', 'salt spoon', 'saltspoons', 'salt spoons', 'scruple', 'scruples', 'ssp.', 'ssp', 'ssps.', 'ssps'],
    plural: 'saltspoons',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 1.23 },
    skipConversion: true,
    decimalPlaces: 1
  },
  coffeespoon: {
    names: ['coffeespoon', 'coffee spoon', 'coffeespoons', 'coffee spoons', 'csp.', 'csp', 'csps.', 'csps'],
    plural: 'coffeespoons',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 2.1 },
    skipConversion: true,
    decimalPlaces: 0
  },
  fluiddram: {
    names: ['fluid dram', 'fluiddram', 'fluid drams', 'fluiddrams', 'fl.dr.', 'fldr', 'fl.dr', 'fldr.', 'fl.drs.', 'fldrs', 'fl.drs'],
    plural: 'fluid drams',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 3.69 },
    skipConversion: true,
    decimalPlaces: 0
  },

  // STANDARD VOLUME UNITS
  teaspoon: {
    names: ['teaspoon', 'tea spoon', 'teaspoons', 'tea spoons', 'tsp.', 'tsp', 'tspn', 'tspn.', 'tsps.', 'tsps', 't.', 't', 'ts.', 'ts', 't/s'],
    plural: 'teaspoons',
    symbol: 'tsp',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 4.92 },
    skipConversion: false,
    decimalPlaces: 1
  },
  dessertspoon: {
    names: ['dessertspoon', 'dessert spoon', 'dessertspoons', 'dessert spoons', 'dsp.', 'dsp', 'dsps.', 'dsps', 'dssp.', 'dssp', 'dssps.', 'dssps', 'dstspn.', 'dstspn', 'dstspns.', 'dstspns'],
    plural: 'dessertspoons',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 9.85 },
    skipConversion: true,
    decimalPlaces: 1
  },
  tablespoon: {
    names: ['tablespoon', 'table spoon', 'tablespoons', 'table spoons', 'tbsp.', 'tbsp', 'tbsps.', 'tbsps', 'tbs', 'tbspn', 'tbs.', 'tbspn.', 'T.', 'T', 'Ts.', 'Ts'],
    plural: 'tablespoons',
    symbol: 'tbs',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 14.78 },
    skipConversion: false,
    decimalPlaces: 1
  },
  floz: {
    names: ['fluid ounce', 'fluidounce', 'fluid ounces', 'fluidounces', 'fl.oz.', 'floz', 'fl.oz', 'floz.', 'fl oz', 'fl oz.', 'fl. ounce', 'fl. ounces', 'fl.ozs.', 'flozs', 'fl.ozs', 'flozs.'],
    plural: 'fluid ounces',
    symbol: 'fl oz',
    system: 'imperial',
    unitType: 'volume',
    conversionFactor: { milliliters: 29.5735 },
    skipConversion: false,
    decimalPlaces: 1
  },
  wineglass: {
    names: ['wineglass', 'wine glass', 'wineglasses', 'wine glasses', 'wgf.', 'wgf', 'wgfs.', 'wgfs'],
    plural: 'wineglasses',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 59.14 },
    skipConversion: true,
    decimalPlaces: 1
  },
  gill: {
    names: ['gill', 'gills', 'teacup', 'tea cup', 'teacups', 'tea cups', 'tcf.', 'tcf', 'tcfs.', 'tcfs'],
    plural: 'gills',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 118.29 },
    skipConversion: true,
    decimalPlaces: 2
  },
  cup: {
    names: ['cup', 'cups', 'C.', 'C', 'c.', 'c', 'Cs.', 'Cs'],
    plural: 'cups',
    symbol: 'c',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 236.588 },
    skipConversion: false,
    decimalPlaces: 2
  },
  pint: {
    names: ['pint', 'pints', 'pt.', 'pt', 'pts.', 'pts'],
    plural: 'pints',
    symbol: 'pt',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 473.176 },
    skipConversion: false,
    decimalPlaces: 2
  },
  quart: {
    names: ['quart', 'quarts', 'qt.', 'qt', 'qts.', 'qts'],
    plural: 'quarts',
    symbol: 'qt',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 946.353 },
    skipConversion: false,
    decimalPlaces: 2
  },
  gallon: {
    names: ['gallon', 'gallons', 'gal.', 'gal', 'gals.', 'gals'],
    plural: 'gallons',
    symbol: 'gal',
    system: 'imperial',
    unitType: 'volume',
    conversionFactor: { milliliters: 3785.41 },
    skipConversion: false,
    decimalPlaces: 3
  },

  // METRIC VOLUME UNITS
  milliliter: {
    names: ['milliliter', 'milliliters', 'millilitre', 'millilitres', 'ml.', 'ml', 'mls.', 'mls'],
    plural: 'milliliters',
    symbol: 'ml',
    system: 'metric',
    unitType: 'volume',
    conversionFactor: { milliliters: 1 },
    skipConversion: false,
    decimalPlaces: 2
  },
  liter: {
    names: ['liter', 'liters', 'litre', 'litres', 'l.', 'l', 'ls.', 'ls', 'lt', 'lt.'],
    plural: 'liters',
    symbol: 'lt',
    system: 'metric',
    unitType: 'volume',
    conversionFactor: { milliliters: 1000 },
    skipConversion: false,
    decimalPlaces: 2
  },

  // WEIGHT UNITS
  milligram: {
    names: ['milligram', 'milligrams', 'mg.', 'mg', 'mgs.', 'mgs'],
    plural: 'milligrams',
    symbol: 'mg',
    system: 'metric',
    unitType: 'weight',
    conversionFactor: { grams: 0.001 },
    skipConversion: false,
    decimalPlaces: 2
  },
  gram: {
    names: ['gram', 'grams', 'g.', 'g', 'gs.', 'gs'],
    plural: 'grams',
    symbol: 'g',
    system: 'metric',
    unitType: 'weight',
    conversionFactor: { grams: 1 },
    skipConversion: false,
    decimalPlaces: 2
  },
  kilogram: {
    names: ['kilogram', 'kilo gram', 'kilograms', 'kilo grams', 'kg.', 'kg', 'kgs.', 'kgs'],
    plural: 'kilograms',
    symbol: 'kg',
    system: 'metric',
    unitType: 'weight',
    conversionFactor: { grams: 1000 },
    skipConversion: false,
    decimalPlaces: 2
  },
  ounce: {
    names: ['ounce', 'ounces', 'oz.', 'oz', 'ozs.', 'ozs'],
    plural: 'ounces',
    symbol: 'oz',
    system: 'imperial',
    unitType: 'weight',
    conversionFactor: { grams: 28.3495 },
    skipConversion: false,
    decimalPlaces: 1
  },
  pound: {
    names: ['pound', 'pounds', 'lb.', 'lb', 'lbs.', 'lbs', 'Lb', 'Lbs', 'Lb.', 'Lbs.'],
    plural: 'pounds',
    symbol: 'lb',
    system: 'imperial',
    unitType: 'weight',
    conversionFactor: { grams: 453.592 },
    skipConversion: false,
    decimalPlaces: 2
  },

  // COUNT / CONTAINER UNITS (no conversion)
  clove: {
    names: ['clove', 'cloves'],
    plural: 'cloves',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  pack: {
    names: ['package', 'pkg', 'pkgs', 'pkg.', 'pkgs.', 'pack', 'packet', 'packets'],
    plural: 'packs',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  bag: {
    names: ['bag', 'bg', 'bg.'],
    plural: 'bags',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  box: {
    names: ['box', 'boxes'],
    plural: 'boxes',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  bottle: {
    names: ['bottle', 'bottles', 'btl', 'btl.'],
    plural: 'bottles',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  container: {
    names: ['container', 'containers', 'cont', 'cont.'],
    plural: 'containers',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  can: {
    names: ['can', 'cans'],
    plural: 'cans',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  stick: {
    names: ['stick', 'sticks'],
    plural: 'sticks',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  dozen: {
    names: ['dozen'],
    plural: 'dozens',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  piece: {
    names: ['piece', 'pcs', 'pcs.'],
    plural: 'pieces',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  squirt: {
    names: ['squirt', 'squirts'],
    plural: 'squirts',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  bunch: {
    names: ['bunch', 'bunches'],
    plural: 'bunches',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  serving: {
    names: ['serving', 'servings', 'portion', 'portions'],
    plural: 'servings',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  slice: {
    names: ['slice', 'slices'],
    plural: 'slices',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  handful: {
    names: ['handful', 'handfuls'],
    plural: 'handfuls',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  drizzle: {
    names: ['drizzle', 'drizzles'],
    plural: 'drizzles',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  ear: {
    names: ['ear', 'ears'],
    plural: 'ears',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  few: {
    names: ['few'],
    plural: 'few',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  knob: {
    names: ['knob', 'knobs'],
    plural: 'knobs',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  thumb: {
    names: ['thumb', 'thumbs'],
    plural: 'thumbs',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  block: {
    names: ['block', 'blocks'],
    plural: 'blocks',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },

  // LENGTH UNITS
  inch: {
    names: ['inch', 'inches'],
    plural: 'inches',
    symbol: '',
    system: null,
    unitType: 'length',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  centimetre: {
    names: ['centimeter', 'centimetre', 'centimeters', 'centimetres', 'cm', 'cm.'],
    plural: 'centimetres',
    symbol: 'cm',
    system: 'metric',
    unitType: 'length',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 1
  }
};

// ============================================================================
// OLD: Backwards compatibility - auto-generated from unitsData
// These objects will be removed in Phase 4 after migration is complete
// ============================================================================
const units = Object.fromEntries(
  Object.entries(unitsData).map(([key, data]) => [key, data.names])
);

const pluralUnits = Object.fromEntries(
  Object.entries(unitsData).map(([key, data]) => [key, data.plural])
);

const symbolUnits = Object.fromEntries(
  Object.entries(unitsData).map(([key, data]) => [key, data.symbol])
);

const unitSystems = Object.fromEntries(
  Object.entries(unitsData)
    .filter(([_, data]) => data.system !== null)
    .map(([key, data]) => [key, data.system])
);

const prepositions = ['of'];

const joiners = ['to', 'or'];

const toTaste = ['to taste', 't.t.', 't.t', 'tt'];
// Terms that may trail to-taste and should be stripped from additional.
const toTasteAdditional = [
  'more',
  'adjust',
  'season',
  'or',
  'or more',
  'plus more',
];
const additionalStopwords = ['and', 'or'];
const approx = ['about', 'approx', 'approx.', 'approximately', 'roughly', '~'];
const optional = ['optional', 'option.', 'if desired'];
const toServe = [
  'to serve',
  'for serving',
  'for garnish',
  'to garnish',
  'garnish',
  'garnish with',
  'to decorate',
];
const instructions = [
  'chopped',
  'diced',
  'sliced',
  'minced',
  'mince',
  'crushed',
  'grated',
  'thinly sliced',
  'strained',
  'julienned',
  'halved',
  'quartered',
  'peeled',
  'pitted',
  'seeded',
  'de-seeded',
  'rinsed',
  'rinsed well',
  'drained',
  'drained well',
  'pressed',
  'melted',
  'softened',
  'warmed',
  'warm',
  'hot',
  'lukewarm',
  'cold',
  'chilled',
  'cooled',
  'icy',
  'ripe',
  'whole',
  'boiled',
  'soft-boiled',
  'soft boiled',
  'hard-boiled',
  'hard boiled',
  'poached',
  'ground',
  'leftover',
  'toasted',
  'roasted',
  'grilled',
  'baked',
  'fried',
  'seared',
  'caramelized',
  'browned',
  'thawed',
  'defrosted',
  'marinated',
  'soaked',
  'blanched',
  'shredded',
  'smashed',
  'mashed',
  'whisked',
  'beaten',
  'mixed',
  'stirred',
  'trimmed',
  'stemmed',
  'hulled',
  'deveined',
  'cubed',
  'torn',
  'broken',
  'cracked',
  'zested',
  'juiced',
  'squeezed',
  'tender',
  'small',
  'medium',
  'large',
  'divided',
  'husked',
  'frozen',
  'dry',
  'leveled',
  'levelled',
  'store-bought',
  'at room temperature',
  'for greasing',
  'for greasing the tin',
  'for the pan',
  'stoned',
  'cooked',
  'crumbled',
  'crispy',
  'crisp',
  'snipped',
  'dried',
  'dry',
  'dry-cured',
  'packed',
  'fresh',
  'good-quality',
  'homemade',
  'home-made',
  'heaped',
  'hearty',
  'ice-cold',
  'ice cold',
  'juice of',
  'for frying',
  'reserved',
  'raw',
  'salted',
  'unsalted',
  'thick',
  'thin',
  'thick-cut',
  'unsweetened',
  'unseasoned',
  'unwaxed',
  'firm',
  'soft',
  'uncooked',
];
const adverbs = [
  'finely',
  'thinly',
  'coarsely',
  'freshly',
  'roughly',
  'firmly',
  'lightly',
];

const numbersSmall = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const numbersMagnitude = {
  hundred: 100,
  thousand: 1000,
  million: 1000000,
  billion: 1000000000,
  trillion: 1000000000000,
};

// If the text string has garlic, use clove, otherwise, don't
export const problematicUnits = {
  clove: ['garlic'],
  // Add more problematic units here
  // 'unit': ['context clue1', 'context clue2']
};

export const langEng = {
  // NEW: Unified units data (single source of truth)
  unitsData,

  // OLD: Backwards compatibility (auto-generated from unitsData)
  // These will be removed in Phase 4 after migration is complete
  units,
  pluralUnits,
  symbolUnits,
  unitSystems,

  // Other language data (unchanged)
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
  isCommaDelimited: false,
};
