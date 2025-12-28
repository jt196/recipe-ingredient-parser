import {getUnitSystem} from './parser-helpers.js';

/**
 * Handle alternative parsing (e.g., fragments in additional notes, slash-separated, etc.).
 * Delegates parsing of fragments back to the provided parse function.
 *
 * @param {Object} params
 * @param {string} params.ingredientLine
 * @param {Array<string>} params.additionalParts
 * @param {boolean} params.includeAlternatives
 * @param {Array<string>} params.instructionWords
 * @param {string} params.language
 * @param {boolean} params.includeUnitSystems
 * @param {Function} params.parseFn
 * @param {string} params.originalString
 * @returns {{ingredientLine: string, additionalParts: Array<string>, alternatives: Array<Object>}}
 */
export function processAlternatives({
  ingredientLine,
  additionalParts,
  includeAlternatives,
  instructionWords,
  language,
  includeUnitSystems,
  parseFn,
  originalString,
}) {
  const alternatives = [];

  const tryAddAlternative = fragment => {
    if (!includeAlternatives || !fragment || !fragment.trim()) return false;
    if (!/\d/.test(fragment)) return false;
    if (/\bnote\b/i.test(fragment)) return false;
    if (/\bpage\s+\d+/i.test(fragment)) return false;
    if (/\bsee note\b/i.test(fragment)) return false;
    if (/\bif frozen\b/i.test(fragment)) return false;
    if (/\bcut\b/i.test(fragment) || /\bchunk/i.test(fragment)) return false;
    if (
      Array.isArray(instructionWords) &&
      instructionWords.some(word => {
        const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp(`^\\s*${escaped}\\b`, 'i').test(fragment);
      })
    ) {
      return false;
    }
    const alt = parseFn(fragment, language, {
      includeUnitSystems,
      includeAlternatives: false,
    });
    const meaningful =
      alt &&
      (alt.unit ||
        alt.quantity ||
        (alt.ingredient && alt.ingredient.trim() !== ''));
    if (meaningful) {
      const altEntry = {
        quantity: alt.quantity,
        unit: alt.unit,
        unitPlural: alt.unitPlural,
        symbol: alt.symbol,
        ingredient: alt.ingredient,
        additional: alt.additional,
        instructions: alt.instructions,
        minQty: alt.minQty,
        maxQty: alt.maxQty,
        originalString: alt.originalString,
      };
      alternatives.push(altEntry);
      return altEntry;
    }
    return false;
  };

  // Promote alternatives found in additionalParts; keep non-alt extras
  if (includeAlternatives && additionalParts.length) {
    const kept = [];
    additionalParts.forEach(part => {
      if (!tryAddAlternative(part)) {
        kept.push(part);
      }
    });
    additionalParts = kept;
  }

  // Slash-separated alternatives in the original string.
  if (includeAlternatives && originalString.includes('/')) {
    const slashParts = originalString.split('/');
    if (slashParts.length >= 2) {
      const lastPart = slashParts[slashParts.length - 1];
      const firstPart = slashParts[0];
      const hasUnitish = part => /\d[^\s]*[A-Za-z]/.test(part);
      const spacedSlash = /\s\/\s/.test(originalString);
      if (spacedSlash || (hasUnitish(firstPart) && hasUnitish(lastPart))) {
        if (/\d/.test(lastPart)) {
          const altEntry = tryAddAlternative(lastPart);
          if (altEntry) {
            alternatives.push(altEntry);
            const primarySegment = ingredientLine.split('/')[0].trim();
            ingredientLine = `${primarySegment} ${altEntry.ingredient || ''}`.trim();
          }
        }
      }
    }
  }

  // Fallback: if slash-present alt was filtered out, at least keep the primary side.
  if (includeAlternatives && originalString.includes('/') && alternatives.length === 0) {
    const slashParts = originalString.split('/');
    if (slashParts.length >= 2) {
      const lastPart = slashParts[slashParts.length - 1];
      const firstPart = slashParts[0];
      const hasUnitish = part => /\d[^\s]*[A-Za-z]/.test(part);
      const spacedSlash = /\s\/\s/.test(originalString);
      if (spacedSlash || (hasUnitish(firstPart) && hasUnitish(lastPart))) {
        const primarySegment = ingredientLine.split('/')[0].trim();
        const altEntry = tryAddAlternative(lastPart.trim());
        if (altEntry && primarySegment) {
          alternatives.push(altEntry);
          ingredientLine = `${primarySegment} ${altEntry.ingredient || ''}`.trim();
          if (altEntry.additional) {
            additionalParts.push(altEntry.additional);
          }
          if (Array.isArray(altEntry.instructions) && altEntry.instructions.length) {
            additionalParts.push(...altEntry.instructions);
          }
        } else if (primarySegment) {
          ingredientLine = primarySegment;
        }
      }
    }
  }

  return {ingredientLine, additionalParts, alternatives};
}

/**
 * Processes "or" alternatives in the ingredient text.
 * Example: "1 cup flour or 2 cups sugar" → primary: "1 cup flour", alternative: "2 cups sugar"
 *
 * @param {string} ingredient - The ingredient text to process
 * @param {boolean} includeAlternatives - Whether to process alternatives
 * @param {Array} alternatives - Array to store alternative entries (mutated)
 * @param {string} language - The language key
 * @param {boolean} includeUnitSystems - Whether to include unit system info
 * @param {Function} parseFn - The parse function to use for parsing alternatives
 * @returns {{ingredient: string, alternatives: Array}} - Updated ingredient and alternatives
 */
export function processOrAlternatives(
  ingredient,
  includeAlternatives,
  alternatives,
  language,
  includeUnitSystems,
  parseFn,
) {
  if (!includeAlternatives || !/\bor\b/i.test(ingredient)) {
    return {ingredient, alternatives};
  }

  const parts = ingredient.split(/\bor\b/i);
  const primaryIngredient = parts.shift().trim();
  const altIngredient = parts.join('or').trim();

  if (primaryIngredient) {
    ingredient = primaryIngredient.replace(/\s*[-–—]\s*$/, '').trim();
  }

  if (altIngredient) {
    // If ingredient starts with "or", clear it
    if (/^or\b/i.test(ingredient)) {
      ingredient = '';
    }

    let altParsed = null;

    // Only parse if the alternative contains numbers
    if (/[0-9¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/.test(altIngredient)) {
      altParsed = parseFn(altIngredient, language, {
        includeAlternatives: false,
        includeUnitSystems,
      });
    }

    // If we got a meaningful parsed alternative with quantity/unit/ingredient
    if (
      altParsed &&
      (altParsed.quantity || altParsed.unit || altParsed.ingredient)
    ) {
      const altEntry = {
        quantity: altParsed.quantity,
        unit: altParsed.unit,
        unitPlural: altParsed.unitPlural,
        symbol: altParsed.symbol,
        ingredient: altParsed.ingredient,
        minQty: altParsed.minQty,
        maxQty: altParsed.maxQty,
        originalString: altIngredient,
      };

      if (includeUnitSystems) {
        altEntry.unitSystem = getUnitSystem(altEntry.unit, language);
      }

      alternatives.push(altEntry);

      // If no primary ingredient, use the alternative's ingredient
      if (!ingredient) {
        ingredient = altParsed.ingredient;
      }
    } else {
      // Simple ingredient swap without quantity/unit
      const cleanedAlt = altIngredient.replace(/^\s*[-–—]\s*/, '').trim();
      const altEntry = {
        quantity: null,
        unit: null,
        unitPlural: null,
        symbol: null,
        ingredient: cleanedAlt,
        minQty: null,
        maxQty: null,
        originalString: cleanedAlt,
      };

      if (includeUnitSystems) {
        altEntry.unitSystem = null;
      }

      alternatives.push(altEntry);
    }
  }

  return {ingredient, alternatives};
}

/**
 * Cleans up and normalizes alternative entries after parsing.
 * Converts quantities, removes duplicates, handles fallback extraction.
 *
 * @param {Array} alternatives - Array of alternative entries to clean
 * @param {Object} result - The main parse result object
 * @param {string} language - The language key
 * @param {boolean} includeUnitSystems - Whether to include unit system info
 * @param {boolean} includeAlternatives - Whether alternatives are enabled
 * @param {string} originalString - The original ingredient string
 * @param {Function} parseFn - The parse function to use
 * @param {Function} resultQuantityCapturedFn - Function to check if quantity is meaningful
 * @param {Function} convertToNumberFn - Function to convert quantities to numbers
 * @returns {Array} - Cleaned alternatives array
 */
export function cleanupAlternatives(
  alternatives,
  result,
  language,
  includeUnitSystems,
  includeAlternatives,
  originalString,
  parseFn,
  resultQuantityCapturedFn,
  convertToNumberFn,
) {
  if (!includeAlternatives) {
    return undefined;
  }

  if (alternatives.length === 0) {
    // Check for fallback alternatives
    const fallback = handleFallbackAlternatives(
      alternatives,
      result,
      language,
      includeUnitSystems,
      includeAlternatives,
      originalString,
      parseFn,
    );
    return fallback.length > 0 ? fallback : undefined;
  }

  // Clean each alternative entry
  const cleanedAlternatives = alternatives.map(alt => {
    const hasQty = resultQuantityCapturedFn(alt.quantity);
    const nextAlt = {...alt};

    if (!hasQty) {
      nextAlt.quantity = null;
      nextAlt.minQty = null;
      nextAlt.maxQty = null;
      nextAlt.unit = null;
      nextAlt.unitPlural = null;
      nextAlt.symbol = null;
      if (includeUnitSystems) nextAlt.unitSystem = null;
    } else {
      nextAlt.quantity = convertToNumberFn(nextAlt.quantity, language);
      nextAlt.minQty = convertToNumberFn(nextAlt.minQty, language);
      nextAlt.maxQty = convertToNumberFn(nextAlt.maxQty, language);
      if (includeUnitSystems && !nextAlt.unitSystem) {
        nextAlt.unitSystem = getUnitSystem(nextAlt.unit, language);
      }
    }

    // Clean ingredient text
    if (nextAlt.ingredient !== null && nextAlt.ingredient !== undefined) {
      const trimmedIng = String(nextAlt.ingredient).trim();
      nextAlt.ingredient = trimmedIng.length > 0 ? trimmedIng : null;
    }

    // Remove if same as main ingredient
    if (
      nextAlt.ingredient &&
      result.ingredient &&
      nextAlt.ingredient.toLowerCase() === result.ingredient.toLowerCase()
    ) {
      nextAlt.ingredient = null;
    }

    // Remove if ingredient matches unit
    const altIngLower = (nextAlt.ingredient || '').toLowerCase();
    if (
      altIngLower &&
      (altIngLower === (nextAlt.unit || '').toLowerCase() ||
        altIngLower === (nextAlt.unitPlural || '').toLowerCase() ||
        altIngLower === (nextAlt.symbol || '').toLowerCase())
    ) {
      nextAlt.ingredient = null;
    }

    return nextAlt;
  });

  return cleanedAlternatives;
}

/**
 * Handles fallback alternative extraction when alternatives are empty.
 * Tries to extract from "or" splits or slash-separated ingredients.
 *
 * @param {Array} alternatives - Current alternatives array
 * @param {Object} result - The main parse result object
 * @param {string} language - The language key
 * @param {boolean} includeUnitSystems - Whether to include unit system info
 * @param {boolean} includeAlternatives - Whether alternatives are enabled
 * @param {string} originalString - The original ingredient string
 * @param {Function} parseFn - The parse function to use
 * @returns {Array} - Alternatives array with fallback entries if found
 */
export function handleFallbackAlternatives(
  alternatives,
  result,
  language,
  includeUnitSystems,
  includeAlternatives,
  originalString,
  parseFn,
) {
  if (!includeAlternatives || (alternatives && alternatives.length > 0)) {
    return alternatives;
  }

  // Fallback: extract from "or" when consumed during range parsing
  if (/\bor\b/i.test(originalString)) {
    const splitParts = originalString.split(/\bor\b/i);
    if (splitParts.length >= 2) {
      const primaryPart = splitParts.shift().trim();
      const altPart = splitParts.join('or').trim();
      if (altPart && /\d/.test(altPart)) {
        const altParsed = parseFn(altPart, language, {
          includeAlternatives: false,
          includeUnitSystems,
        });
        if (
          altParsed &&
          (altParsed.quantity || altParsed.unit || altParsed.ingredient)
        ) {
          const newAlternatives = [
            {
              quantity: altParsed.quantity ?? null,
              unit: altParsed.unit ?? null,
              unitPlural: altParsed.unitPlural ?? null,
              symbol: altParsed.symbol ?? null,
              ingredient: altParsed.ingredient,
              minQty: altParsed.minQty ?? null,
              maxQty: altParsed.maxQty ?? null,
              originalString: altPart,
              ...(includeUnitSystems && {
                unitSystem: getUnitSystem(altParsed.unit, language),
              }),
            },
          ];
          // Update result ingredient if empty
          if (
            primaryPart &&
            (!result.ingredient || result.ingredient.trim() === '')
          ) {
            result.ingredient = primaryPart.replace(/^\s*[-–—]\s*/, '').trim();
          }
          return newAlternatives;
        }
      }
    }
  }

  // Fallback: slash-separated ingredients without quantities
  if (
    /\s\/\s/.test(result.originalString || '') &&
    /\s\/\s/.test(result.ingredient || '')
  ) {
    const ingredientParts = result.ingredient
      .split(/\s*\/\s*/)
      .map(part => part.trim())
      .filter(Boolean);
    if (ingredientParts.length > 1) {
      const primary = ingredientParts.shift();
      result.ingredient = primary;
      return ingredientParts.map(part => ({
        quantity: result.quantity,
        unit: result.unit,
        unitPlural: result.unitPlural,
        symbol: result.symbol,
        ingredient: part,
        minQty: result.minQty,
        maxQty: result.maxQty,
        originalString: part,
        ...(includeUnitSystems && {unitSystem: result.unitSystem}),
      }));
    }
  }

  return alternatives && alternatives.length > 0 ? alternatives : [];
}
