const { i18nMap } = require('../src/i18n/index.js');
const langEng = i18nMap.eng;

describe('unitsData structure', () => {
  it('should have unitsData defined', () => {
    if (!langEng.unitsData) {
      throw new Error('unitsData is not defined');
    }
  });

  it('should have correct structure for gram unit', () => {
    const gram = langEng.unitsData.gram;
    if (!gram) throw new Error('gram not found in unitsData');
    if (!Array.isArray(gram.names)) throw new Error('gram.names is not an array');
    if (gram.plural !== 'grams') throw new Error('gram.plural is incorrect');
    if (gram.symbol !== 'g') throw new Error('gram.symbol is incorrect');
    if (gram.system !== 'metric') throw new Error('gram.system is incorrect');
    if (gram.unitType !== 'weight') throw new Error('gram.unitType is incorrect');
    if (!gram.conversionFactor || gram.conversionFactor.grams !== 1) {
      throw new Error('gram.conversionFactor is incorrect');
    }
    if (gram.skipConversion !== false) throw new Error('gram.skipConversion is incorrect');
    if (gram.decimalPlaces !== 2) throw new Error('gram.decimalPlaces is incorrect');
  });

  it('should have correct structure for cup unit (volume)', () => {
    const cup = langEng.unitsData.cup;
    if (!cup) throw new Error('cup not found in unitsData');
    if (cup.unitType !== 'volume') throw new Error('cup.unitType should be volume');
    if (!cup.conversionFactor || !cup.conversionFactor.milliliters) {
      throw new Error('cup.conversionFactor should have milliliters');
    }
  });

  it('should have correct structure for pinch unit (count)', () => {
    const pinch = langEng.unitsData.pinch;
    if (!pinch) throw new Error('pinch not found in unitsData');
    if (pinch.unitType !== 'volume') throw new Error('pinch.unitType should be volume');
    if (pinch.skipConversion !== true) throw new Error('pinch.skipConversion should be true');
  });
});

describe('Backwards compatibility - auto-generated objects', () => {
  it('should generate units object from unitsData', () => {
    if (!langEng.units) throw new Error('units object not generated');
    if (!langEng.units.gram) throw new Error('units.gram not found');
    if (!Array.isArray(langEng.units.gram)) throw new Error('units.gram is not an array');
    if (!langEng.units.gram.includes('g')) throw new Error('units.gram should include "g"');
  });

  it('should generate pluralUnits object from unitsData', () => {
    if (!langEng.pluralUnits) throw new Error('pluralUnits object not generated');
    if (langEng.pluralUnits.gram !== 'grams') throw new Error('pluralUnits.gram is incorrect');
    if (langEng.pluralUnits.cup !== 'cups') throw new Error('pluralUnits.cup is incorrect');
  });

  it('should generate symbolUnits object from unitsData', () => {
    if (!langEng.symbolUnits) throw new Error('symbolUnits object not generated');
    if (langEng.symbolUnits.gram !== 'g') throw new Error('symbolUnits.gram is incorrect');
    if (langEng.symbolUnits.cup !== 'c') throw new Error('symbolUnits.cup is incorrect');
  });

  it('should generate unitSystems object from unitsData', () => {
    if (!langEng.unitSystems) throw new Error('unitSystems object not generated');
    if (langEng.unitSystems.gram !== 'metric') throw new Error('unitSystems.gram is incorrect');
    if (langEng.unitSystems.cup !== 'americanVolumetric') {
      throw new Error('unitSystems.cup is incorrect');
    }
    // Should NOT include units with null system
    if (langEng.unitSystems.pinch) throw new Error('unitSystems should not include pinch');
  });

  it('should match all keys between unitsData and generated objects', () => {
    const unitsDataKeys = Object.keys(langEng.unitsData);
    const unitsKeys = Object.keys(langEng.units);
    const pluralUnitsKeys = Object.keys(langEng.pluralUnits);
    const symbolUnitsKeys = Object.keys(langEng.symbolUnits);

    if (unitsKeys.length !== unitsDataKeys.length) {
      throw new Error(`units keys count mismatch: ${unitsKeys.length} vs ${unitsDataKeys.length}`);
    }
    if (pluralUnitsKeys.length !== unitsDataKeys.length) {
      throw new Error(`pluralUnits keys count mismatch: ${pluralUnitsKeys.length} vs ${unitsDataKeys.length}`);
    }
    if (symbolUnitsKeys.length !== unitsDataKeys.length) {
      throw new Error(`symbolUnits keys count mismatch: ${symbolUnitsKeys.length} vs ${unitsDataKeys.length}`);
    }
  });

  it('should have fewer keys in unitSystems (excludes null systems)', () => {
    const unitsDataKeys = Object.keys(langEng.unitsData);
    const unitSystemsKeys = Object.keys(langEng.unitSystems);

    if (unitSystemsKeys.length >= unitsDataKeys.length) {
      throw new Error('unitSystems should have fewer keys than unitsData (excludes null systems)');
    }
  });
});

describe('Data integrity', () => {
  it('should not have duplicate names across units', () => {
    const allNames = new Set();
    const duplicates = [];

    for (const [canonical, data] of Object.entries(langEng.unitsData)) {
      for (const name of data.names) {
        if (allNames.has(name)) {
          duplicates.push({ name, unit: canonical });
        }
        allNames.add(name);
      }
    }

    if (duplicates.length > 0) {
      throw new Error(`Duplicate names found: ${JSON.stringify(duplicates)}`);
    }
  });

  it('should have weight units with grams conversion factor', () => {
    const weightUnits = Object.entries(langEng.unitsData)
      .filter(([_, data]) => data.unitType === 'weight');

    for (const [canonical, data] of weightUnits) {
      if (!data.conversionFactor || typeof data.conversionFactor.grams !== 'number') {
        throw new Error(`${canonical} should have grams conversion factor`);
      }
    }
  });

  it('should have volume units with milliliters conversion factor', () => {
    const volumeUnits = Object.entries(langEng.unitsData)
      .filter(([_, data]) => data.unitType === 'volume');

    for (const [canonical, data] of volumeUnits) {
      if (!data.conversionFactor || typeof data.conversionFactor.milliliters !== 'number') {
        throw new Error(`${canonical} should have milliliters conversion factor`);
      }
    }
  });

  it('should have count units with null conversion factor', () => {
    const countUnits = Object.entries(langEng.unitsData)
      .filter(([_, data]) => data.unitType === 'count');

    for (const [canonical, data] of countUnits) {
      if (data.conversionFactor !== null) {
        throw new Error(`${canonical} should have null conversion factor`);
      }
      if (data.skipConversion !== true) {
        throw new Error(`${canonical} should have skipConversion = true`);
      }
    }
  });
});
