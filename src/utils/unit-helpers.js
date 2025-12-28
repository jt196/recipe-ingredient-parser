import * as convert from './convert';
import {getUnit, getUnitSystem, convertToNumber} from './parser-helpers';

/**
 * Processes slash-separated alternative units (e.g., "cup/150 grams sugar").
 * Extracts the alternative unit and quantity into the alternatives array.
 *
 * @param {string} restOfIngredient - The remaining ingredient text after quantity extraction
 * @param {boolean} includeAlternatives - Whether to process alternatives
 * @param {Array} alternatives - Array to store alternative units (mutated)
 * @param {string} language - The language key
 * @param {boolean} includeUnitSystems - Whether to include unit system info
 * @returns {{restOfIngredient: string, alternatives: Array}} - Updated text and alternatives
 */
export function processSlashSeparatedAlternativeUnit(
  restOfIngredient,
  includeAlternatives,
  alternatives,
  language,
  includeUnitSystems,
) {
  if (
    !includeAlternatives ||
    !restOfIngredient ||
    !/^\s*[A-Za-z\p{L}]+\s*\/\s*[~\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/u.test(
      restOfIngredient,
    )
  ) {
    return {restOfIngredient, alternatives};
  }

  const altSlashMatch = restOfIngredient.match(
    /^\s*([A-Za-z\p{L}]+)\s*\/\s*([~\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?:\s*\/\s*\d+)?)\s*([A-Za-z\p{L}]+)\b(.*)$/u,
  );

  if (!altSlashMatch) {
    return {restOfIngredient, alternatives};
  }

  const primaryUnitText = altSlashMatch[1];
  const altQtyRaw = altSlashMatch[2].replace(/^~/, '').trim();
  const altQty = convert.convertFromFraction(altQtyRaw, language);
  const altUnitText = altSlashMatch[3];
  const remainder = altSlashMatch[4] || '';
  const altUnitParts = getUnit(altUnitText, language);

  if (altUnitParts.length && !Number.isNaN(altQty)) {
    alternatives.push({
      quantity: convertToNumber(altQty, language),
      unit: altUnitParts[0],
      unitPlural: altUnitParts[1],
      symbol: altUnitParts[2],
      ingredient: remainder.trim(),
      minQty: convertToNumber(altQty, language),
      maxQty: convertToNumber(altQty, language),
      originalString: `${altQtyRaw} ${altUnitText}`,
      ...(includeUnitSystems && {
        unitSystem: getUnitSystem(altUnitParts[0], language),
      }),
    });
    return {
      restOfIngredient: `${primaryUnitText} ${remainder}`.trim(),
      alternatives,
    };
  }

  return {restOfIngredient, alternatives};
}

/**
 * Normalizes stray leading dashes left after quantity stripping.
 * Example: "14-oz" -> "oz"
 *
 * @param {string} text - The text to normalize
 * @returns {string} - Text with leading dashes removed
 */
export function removeLeadingDashes(text) {
  return text.replace(/^[-–]\s*/, '').trim();
}

/**
 * Extracts leading size descriptors like "3-inch" before the unit.
 * Example: "3-inch stick" -> additionalParts gets "3-inch", returns "stick"
 *
 * @param {string} text - The text to process
 * @param {string[]} additionalParts - Array to store extracted size (mutated)
 * @returns {{text: string, additionalParts: string[]}} - Updated text and parts
 */
export function extractInchSizeDescriptor(text, additionalParts) {
  const sizeDescriptorRegex =
    /^(\d+(?:[.,]\d+)?(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*-?\s*inch(?:es)?\b[-\s]*/i;
  const sizeMatch = text.match(sizeDescriptorRegex);

  if (sizeMatch) {
    additionalParts.push(sizeMatch[0].trim());
    return {
      text: text.slice(sizeMatch[0].length).trim(),
      additionalParts,
    };
  }

  return {text, additionalParts};
}

/**
 * Handles inch descriptors without an explicit leading digit.
 * Example: "inch piece ginger" after word-number quantities -> adds "1-inch"
 *
 * @param {string} text - The text to process
 * @param {string[]} additionalParts - Array to store extracted size (mutated)
 * @returns {{text: string, additionalParts: string[]}} - Updated text and parts
 */
export function handleImplicitInchDescriptor(text, additionalParts) {
  if (/^inch(?:es)?\b/i.test(text)) {
    additionalParts.push('1-inch');
    return {
      text: text.replace(/^inch(?:es)?\b[-\s]*/i, '').trim(),
      additionalParts,
    };
  }
  return {text, additionalParts};
}

/**
 * Extracts leading secondary size notes that precede container units.
 * Example: "15-ounce cans" -> extracts "15-ounce"
 *
 * @param {string} text - The text to process
 * @returns {{text: string, containerSizeText: string|null}} - Updated text and extracted size
 */
export function extractContainerSize(text) {
  const containerSizeRegex =
    /^(?:of\s+)?(?:a\s+)?(\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*(?:oz|ounce|ounces|g|gram|grams|kg|kilogram|milliliter|millilitre|ml|liter|litre|lb|pound|pounds)\b[-\s]*(?=\s*(?:can|cans|package|packages|pack|packs|packet|packets|pack\.?|tin|tins|bag|bags|piece|pieces|bunch|handful|handfuls))/i;
  const containerSizeMatch = text.match(containerSizeRegex);

  if (containerSizeMatch) {
    const containerSizeText = containerSizeMatch[0]
      .replace(/^(?:of\s+)?(?:a\s+)?/i, '')
      .trim();
    const cleanedText = text.slice(containerSizeMatch[0].length).trim();
    return {text: cleanedText, containerSizeText};
  }

  return {text, containerSizeText: null};
}

/**
 * Prefers container units (can/pack/bag) over weight/volume units when appropriate.
 * Example: "15-ounce cans" -> prefers 'can' over 'ounce'
 *
 * @param {string|null} unit - The detected unit
 * @param {string} restBeforeUnit - The text before unit detection
 * @param {number|string} quantity - The quantity value
 * @param {string} language - The language key
 * @param {boolean} hadWordNumberCan - Whether we detected word-number cans earlier
 * @returns {{unit: string|null, unitPlural: string|null, symbol: string|null}} - Resolved unit info
 */
export function preferContainerUnits(
  unit,
  restBeforeUnit,
  quantity,
  language,
  hadWordNumberCan,
) {
  // Only apply to weight/volume units
  if (
    !unit ||
    !['ounce', 'pound', 'gram', 'kilogram', 'liter', 'milliliter'].includes(
      unit,
    )
  ) {
    return {unit, unitPlural: null, symbol: null};
  }

  const containerMatch = restBeforeUnit.match(
    /\b(package|packages|pack|packs|packet|packets|can|cans|tin|tins|bag|bags)\b/i,
  );

  if (!containerMatch) {
    return {unit, unitPlural: null, symbol: null};
  }

  const containerWord = containerMatch[1].toLowerCase();
  let containerUnit = 'pack';
  if (containerWord.startsWith('can') || containerWord.startsWith('tin')) {
    containerUnit = 'can';
  } else if (containerWord.startsWith('bag')) {
    containerUnit = 'bag';
  }

  const numericQty = convertToNumber(quantity, language);
  // Allow ounce-weight cans to stay as weight for singular cases
  if (
    containerUnit === 'can' &&
    numericQty <= 14 &&
    !hadWordNumberCan
  ) {
    return {unit, unitPlural: null, symbol: null};
  }

  const containerParts = getUnit(containerUnit, language);
  if (containerParts.length) {
    return {
      unit: containerParts[0],
      unitPlural: containerParts[1],
      symbol: containerParts[2],
    };
  }

  return {
    unit: containerUnit,
    unitPlural: containerUnit + 's',
    symbol: null,
  };
}

/**
 * Handles inch+piece special case by extracting size and converting to piece unit.
 * Example: "1 3-inch piece ginger" -> extracts "3-inch", returns piece unit
 *
 * @param {string|null} unit - The detected unit
 * @param {string} restBeforeUnit - The text before unit detection
 * @param {string} ingredient - The ingredient text
 * @param {string[]} additionalParts - Array to store extracted size (mutated)
 * @param {string} language - The language key
 * @returns {{unit: string|null, unitPlural: string|null, symbol: string, ingredient: string, additionalParts: string[]}} - Updated unit and ingredient info
 */
export function handleInchPieceConversion(
  unit,
  restBeforeUnit,
  ingredient,
  additionalParts,
  language,
) {
  if (unit !== 'inch' || !/\bpiece\b/i.test(restBeforeUnit)) {
    return {unit, unitPlural: null, symbol: '', ingredient, additionalParts};
  }

  const sizeText = (restBeforeUnit.match(
    /^[^A-Za-z]*([\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞.,-]+\s*inch(?:es)?)/i,
  ) || [])[1];

  if (sizeText) {
    additionalParts.push(sizeText.trim());
  }

  const cleanedIngredient = ingredient.replace(/\bpieces?\b/i, '').trim();
  const pieceUnits = getUnit('piece', language);

  if (pieceUnits.length >= 3) {
    return {
      unit: pieceUnits[0],
      unitPlural: pieceUnits[1],
      symbol: pieceUnits[2],
      ingredient: cleanedIngredient,
      additionalParts,
    };
  }

  return {
    unit: 'piece',
    unitPlural: 'pieces',
    symbol: '',
    ingredient: cleanedIngredient,
    additionalParts,
  };
}
