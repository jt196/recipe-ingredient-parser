import * as convert from './convert';
import {getUnit, convertToNumber} from './parser-helpers';

export const resultQuantityCaptured = qty =>
  qty !== null && qty !== undefined && `${qty}`.trim() !== '';

export const getUnitAndRemainder = (restOfIngredient, language) => {
  const restBeforeUnit = restOfIngredient;
  let [unit, unitPlural, symbol, originalUnit] = getUnit(
    restOfIngredient,
    language,
  );
  let ingredient = originalUnit
    ? restOfIngredient.replace(originalUnit, '').trim()
    : restOfIngredient.replace(unit, '').trim();
  ingredient = ingredient.replace(/\.(\s|$)/g, '$1').trim();
  ingredient = ingredient.replace(/^(?:can|tin)\s+/i, '').trim();

  // Prefer container units (can/pack/bag) when a size descriptor precedes them, instead of weight/volume units.
  if (
    unit &&
    ['ounce', 'pound', 'gram', 'kilogram', 'liter', 'milliliter'].includes(unit)
  ) {
    const containerMatch = restBeforeUnit.match(
      /\b(package|packages|pack|packs|packet|packets|can|cans|tin|tins|bag|bags)\b/i,
    );
    if (containerMatch) {
      const containerWord = containerMatch[1].toLowerCase();
      let containerUnit = 'pack';
      if (containerWord.startsWith('can') || containerWord.startsWith('tin')) {
        containerUnit = 'can';
      } else if (containerWord.startsWith('bag')) {
        containerUnit = 'bag';
      }
      const numericQty = convertToNumber(
        restOfIngredient.split(/\s+/)[0],
        language,
      );
      if (!(containerUnit === 'can' && numericQty <= 14)) {
        const containerParts = getUnit(containerUnit, language);
        if (containerParts.length) {
          unit = containerParts[0];
          unitPlural = containerParts[1];
          symbol = containerParts[2];
        }
      }
    }
  }

  return {unit, unitPlural, symbol, ingredient, originalUnit};
};

export const resolveRangeQuantities = (quantity, originalString, language) => {
  let minQty = quantity;
  let maxQty = quantity;
  const fractionRangeMatch = originalString.match(
    /([0-9¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞\/]+)\s*[-–]\s*([0-9¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞\/]+)/i,
  );
  if (fractionRangeMatch) {
    const minVal = convert.convertFromFraction(fractionRangeMatch[1], language);
    const maxVal = convert.convertFromFraction(fractionRangeMatch[2], language);
    if (!Number.isNaN(minVal) && !Number.isNaN(maxVal)) {
      quantity = minVal.toString();
      minQty = minVal;
      maxQty = maxVal;
    }
  }
  if (quantity && (quantity.includes('-') || quantity.includes('–'))) {
    [minQty, maxQty] = quantity.split(/-|–/);
    quantity = minQty;
  }
  return {quantity, minQty, maxQty};
};
