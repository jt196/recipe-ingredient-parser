import {langDeu} from './lang.deu.js';
import {langEng} from './lang.eng.js';
import {langIta} from './lang.ita.js';
import {langEsp} from './lang.esp.js';
import {langFra} from './lang.fra.js';
import {langPor} from './lang.por.js';
import {langRus} from './lang.rus.js';
import {langHin} from './lang.hin.js';
import {langInd} from './lang.ind.js';
import {langAra} from './lang.ara.js';

/**
 * Base units data - single source of truth for all unit metadata.
 * Contains system, unitType, conversionFactor, skipConversion, and decimalPlaces.
 * Language-specific names, plural, and symbol are defined in each language's unitTranslations.
 */
const baseUnitsData = {
  // SMALL VOLUME UNITS (skip conversion)
  drop: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.05 },
    skipConversion: true,
    decimalPlaces: 0
  },
  smidgen: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.18 },
    skipConversion: true,
    decimalPlaces: 0
  },
  pinch: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.36 },
    skipConversion: true,
    decimalPlaces: 0
  },
  dash: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 0.72 },
    skipConversion: true,
    decimalPlaces: 0
  },
  saltspoon: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 1.23 },
    skipConversion: true,
    decimalPlaces: 1
  },
  coffeespoon: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 2.1 },
    skipConversion: true,
    decimalPlaces: 0
  },
  fluiddram: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 3.69 },
    skipConversion: true,
    decimalPlaces: 0
  },

  // STANDARD VOLUME UNITS
  teaspoon: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 4.92 },
    skipConversion: false,
    decimalPlaces: 1
  },
  dessertspoon: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 9.85 },
    skipConversion: true,
    decimalPlaces: 1
  },
  tablespoon: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 14.78 },
    skipConversion: false,
    decimalPlaces: 1
  },
  floz: {
    names: [],
    plural: '',
    symbol: '',
    system: 'imperial',
    unitType: 'volume',
    conversionFactor: { milliliters: 29.5735 },
    skipConversion: false,
    decimalPlaces: 1
  },
  wineglass: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 59.14 },
    skipConversion: true,
    decimalPlaces: 1
  },
  gill: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'volume',
    conversionFactor: { milliliters: 118.29 },
    skipConversion: true,
    decimalPlaces: 2
  },
  cup: {
    names: [],
    plural: '',
    symbol: '',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 236.588 },
    skipConversion: false,
    decimalPlaces: 2
  },
  pint: {
    names: [],
    plural: '',
    symbol: '',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 473.176 },
    skipConversion: false,
    decimalPlaces: 2
  },
  quart: {
    names: [],
    plural: '',
    symbol: '',
    system: 'americanVolumetric',
    unitType: 'volume',
    conversionFactor: { milliliters: 946.353 },
    skipConversion: false,
    decimalPlaces: 2
  },
  gallon: {
    names: [],
    plural: '',
    symbol: '',
    system: 'imperial',
    unitType: 'volume',
    conversionFactor: { milliliters: 3785.41 },
    skipConversion: false,
    decimalPlaces: 3
  },

  // METRIC VOLUME UNITS
  milliliter: {
    names: [],
    plural: '',
    symbol: '',
    system: 'metric',
    unitType: 'volume',
    conversionFactor: { milliliters: 1 },
    skipConversion: false,
    decimalPlaces: 2
  },
  liter: {
    names: [],
    plural: '',
    symbol: '',
    system: 'metric',
    unitType: 'volume',
    conversionFactor: { milliliters: 1000 },
    skipConversion: false,
    decimalPlaces: 2
  },

  // WEIGHT UNITS
  milligram: {
    names: [],
    plural: '',
    symbol: '',
    system: 'metric',
    unitType: 'weight',
    conversionFactor: { grams: 0.001 },
    skipConversion: false,
    decimalPlaces: 2
  },
  gram: {
    names: [],
    plural: '',
    symbol: '',
    system: 'metric',
    unitType: 'weight',
    conversionFactor: { grams: 1 },
    skipConversion: false,
    decimalPlaces: 2
  },
  kilogram: {
    names: [],
    plural: '',
    symbol: '',
    system: 'metric',
    unitType: 'weight',
    conversionFactor: { grams: 1000 },
    skipConversion: false,
    decimalPlaces: 2
  },
  ounce: {
    names: [],
    plural: '',
    symbol: '',
    system: 'imperial',
    unitType: 'weight',
    conversionFactor: { grams: 28.3495 },
    skipConversion: false,
    decimalPlaces: 1
  },
  pound: {
    names: [],
    plural: '',
    symbol: '',
    system: 'imperial',
    unitType: 'weight',
    conversionFactor: { grams: 453.592 },
    skipConversion: false,
    decimalPlaces: 2
  },

  // COUNT / CONTAINER UNITS (no conversion)
  clove: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  pack: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  bag: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  box: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  bottle: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  container: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  can: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  stick: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  dozen: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  piece: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  squirt: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  bunch: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  serving: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  slice: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  handful: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  drizzle: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  ear: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  few: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  knob: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  thumb: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  block: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'count',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },

  // LENGTH UNITS
  inch: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'length',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  centimetre: {
    names: [],
    plural: '',
    symbol: '',
    system: 'metric',
    unitType: 'length',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 1
  },

  // Time units
  second: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'time',
    conversionFactor: { seconds: 1 },
    skipConversion: true,
    decimalPlaces: 0
  },
  minute: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'time',
    conversionFactor: { seconds: 60 },
    skipConversion: true,
    decimalPlaces: 0
  },
  hour: {
    names: [],
    plural: '',
    symbol: '',
    system: null,
    unitType: 'time',
    conversionFactor: { seconds: 3600 },
    skipConversion: true,
    decimalPlaces: 0
  },

  // Temperature units
  celsius: {
    names: [],
    plural: '',
    symbol: '',
    system: 'metric',
    unitType: 'temperature',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  },
  fahrenheit: {
    names: [],
    plural: '',
    symbol: '',
    system: 'imperial',
    unitType: 'temperature',
    conversionFactor: null,
    skipConversion: true,
    decimalPlaces: 0
  }
};

/**
 * Merges base unit metadata with language-specific translations.
 *
 * The base data is the single source of truth for:
 * - system (metric, imperial, americanVolumetric)
 * - unitType (weight, volume, count, length)
 * - conversionFactor (grams, milliliters)
 * - skipConversion
 * - decimalPlaces
 *
 * Languages provide translations for:
 * - names (array of localized unit names)
 * - plural (localized plural form)
 * - symbol (localized symbol, if different from English)
 *
 * @param {Object} baseData - Base unitsData (complete metadata, empty names/plural/symbol)
 * @param {Object} translations - Language-specific unitTranslations (names/plural/symbol only)
 * @returns {Object} Merged unitsData with base metadata + language translations
 */
function mergeUnitsData(baseData, translations) {
  const merged = {};

  for (const [key, baseUnit] of Object.entries(baseData)) {
    if (translations && translations[key]) {
      // Language has translations for this unit - merge them
      merged[key] = {
        ...baseUnit,  // Base metadata (system, unitType, conversionFactor, etc.)
        ...translations[key],  // Override with language translations (names, plural, symbol)
      };
    } else {
      // No translation - this shouldn't happen, but fallback to base
      merged[key] = baseUnit;
    }
  }

  return merged;
}

/**
 * Generates backwards-compatible unit objects from unitsData.
 * These are required for parser-helpers.js fallback logic.
 *
 * @param {Object} unitsData - Unified units data structure
 * @returns {Object} Legacy unit objects (units, pluralUnits, symbolUnits, unitSystems)
 */
function generateLegacyObjects(unitsData) {
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
      .filter(([, data]) => data.system !== null)
      .map(([key, data]) => [key, data.system])
  );

  return { units, pluralUnits, symbolUnits, unitSystems };
}

/**
 * Prepares a language export by merging with base units data if unitTranslations are provided.
 * Falls back to existing structure for languages not yet migrated.
 *
 * @param {Object} langData - Language data (must have unitTranslations)
 * @returns {Object} Complete language data with unitsData and backwards-compatible objects
 */
function prepareLangExport(langData) {
  // All languages should now have unitTranslations - merge with base
  if (langData.unitTranslations) {
    const mergedUnitsData = mergeUnitsData(baseUnitsData, langData.unitTranslations);
    const legacyObjects = generateLegacyObjects(mergedUnitsData);

    return {
      ...langData,
      unitsData: mergedUnitsData,
      ...legacyObjects,  // Generate backwards-compatible objects
    };
  }

  // This shouldn't happen - all languages should have unitTranslations
  throw new Error('Language data must have unitTranslations');
}

export const i18nMap = {
  deu: prepareLangExport(langDeu),
  eng: prepareLangExport(langEng),
  ita: prepareLangExport(langIta),
  esp: prepareLangExport(langEsp),
  fra: prepareLangExport(langFra),
  por: prepareLangExport(langPor),
  rus: prepareLangExport(langRus),
  hin: prepareLangExport(langHin),
  ind: prepareLangExport(langInd),
  ara: prepareLangExport(langAra),
};
