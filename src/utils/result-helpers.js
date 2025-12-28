import {getUnit, getUnitSystem} from './parser-helpers.js';

/**
 * Handles special case for pieces with inch size in original string.
 * Adds inch size to additional if missing.
 *
 * @param {Object} result - The result object to modify
 * @param {string} unit - The detected unit
 * @param {string} originalString - The original ingredient string
 * @returns {Object} - Updated result object
 */
export function handlePieceInchSize(result, unit, originalString) {
  if (
    unit === 'piece' &&
    (!result.additional || !result.additional.includes('inch')) &&
    /(\d+(?:[.,]\d+)?(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?\s*-?\s*inch)/i.test(
      originalString,
    )
  ) {
    result.additional = result.additional
      ? `${result.additional}, ${RegExp.$1.trim()}`
      : RegExp.$1.trim();
  }
  return result;
}

/**
 * Handles weight range patterns like "3-4 lb chicken".
 * Moves weight range to additional and sets unit to null.
 *
 * @param {Object} result - The result object to modify
 * @param {string} originalString - The original ingredient string
 * @param {string} restBeforeUnit - Text before unit detection
 * @param {boolean} includeUnitSystems - Whether to include unit systems
 * @returns {{result: Object, forceUnitNull: boolean}} - Updated result and unit flag
 */
export function handleWeightRange(
  result,
  originalString,
  restBeforeUnit,
  includeUnitSystems,
) {
  let forceUnitNull = false;
  const weightRangeMatch = originalString.match(/(\d+\s*-\s*\d+)\s*lb/i);

  if (weightRangeMatch) {
    const rangeText = `${weightRangeMatch[1]} lb`.replace(/\s+/g, ' ');
    result.additional = result.additional
      ? `${result.additional}, ${rangeText}`
      : rangeText;
    result.unit = null;
    result.unitPlural = null;
    result.symbol = null;
    forceUnitNull = true;

    if (includeUnitSystems) {
      result.unitSystem = null;
    }

    // Deduplicate additional parts
    if (result.additional) {
      result.additional = Array.from(
        new Set(
          result.additional
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
        ),
      ).join(', ');
    }

    // Extract ingredient from remainder
    const remainder = restBeforeUnit.replace(weightRangeMatch[0], '').trim();
    if (remainder) {
      result.ingredient = remainder.replace(/^(?:of)\s+/i, '').trim();
    }

    result.quantity = 1;
    result.minQty = 1;
    result.maxQty = 1;
  }

  return {result, forceUnitNull};
}

/**
 * Handles count plus weight range patterns like "1 3-4 lb chicken".
 *
 * @param {Object} result - The result object to modify
 * @param {string} originalString - The original ingredient string
 * @param {boolean} includeUnitSystems - Whether to include unit systems
 * @returns {Object} - Updated result object
 */
export function handleCountPlusRange(result, originalString, includeUnitSystems) {
  const countPlusRangeMatch = originalString.match(
    /^\s*1\s+(\d+\s*[-–]\s*\d+)\s*lb/i,
  );

  if (countPlusRangeMatch) {
    const rangeText = `${countPlusRangeMatch[1].replace(/\s+/g, '')} lb`;
    result.quantity = 1;
    result.minQty = 1;
    result.maxQty = 1;
    result.unit = null;
    result.unitPlural = null;
    result.symbol = null;

    const existingAdditional = result.additional
      ? result.additional
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : [];
    const mergedAdditional = Array.from(
      new Set([...existingAdditional, rangeText]),
    );
    result.additional = mergedAdditional.join(', ');

    if (includeUnitSystems) {
      result.unitSystem = null;
    }
  }

  return result;
}

/**
 * Tries to guess unit from original string if no unit was detected.
 *
 * @param {Object} result - The result object to modify
 * @param {boolean} forceUnitNull - Whether unit should stay null
 * @param {string} originalString - The original ingredient string
 * @param {string} language - The language key
 * @param {boolean} includeUnitSystems - Whether to include unit systems
 * @returns {Object} - Updated result object
 */
export function fallbackUnitGuess(
  result,
  forceUnitNull,
  originalString,
  language,
  includeUnitSystems,
) {
  if (!result.unit && !forceUnitNull) {
    const guessedUnit = getUnit(originalString, language);
    if (guessedUnit.length) {
      result.unit = guessedUnit[0] || null;
      result.unitPlural = guessedUnit[1] || null;
      result.symbol = guessedUnit[2] || null;
      if (includeUnitSystems) {
        result.unitSystem = getUnitSystem(result.unit, language);
      }
    }
  }
  return result;
}

/**
 * Tries to guess ingredient from original string if no ingredient was found.
 *
 * @param {Object} result - The result object to modify
 * @param {string} originalString - The original ingredient string
 * @returns {Object} - Updated result object
 */
export function fallbackIngredientGuess(result, originalString) {
  if (!result.ingredient) {
    const primaryGuess = originalString
      .replace(/^[^A-Za-z]+(?:[A-Za-z]+\s+)?/, '')
      .split('/')[0]
      .split(',')[0]
      .trim();

    if (primaryGuess) {
      result.ingredient = primaryGuess;
    } else if (result.alternatives && result.alternatives.length > 0) {
      result.ingredient = result.alternatives[0].ingredient || '';
    }
  }
  return result;
}

/**
 * Handles leading weight/size range after initial count.
 * Example: "1 3-4 lb whole chicken" → treats "3-4 lb" as additional, unit becomes null
 *
 * @param {Object} result - The result object to modify
 * @param {string} originalUnit - The original detected unit
 * @param {string} restBeforeUnit - Text before unit detection
 * @param {boolean} includeUnitSystems - Whether to include unit systems
 * @returns {Object} - Updated result object
 */
export function handleLeadingWeightSizeRange(
  result,
  originalUnit,
  restBeforeUnit,
  includeUnitSystems,
) {
  if (result.quantity === 1 && result.unit && originalUnit && restBeforeUnit) {
    const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rangeUnitRegex = new RegExp(
      `^\\s*\\d+(?:\\s*[–-]\\s*\\d+)?\\s*${escapeRe(originalUnit)}\\b`,
      'i',
    );
    if (rangeUnitRegex.test(restBeforeUnit)) {
      const rangeText = (restBeforeUnit.match(rangeUnitRegex) || [])[0].trim();
      const remainder = restBeforeUnit.replace(rangeUnitRegex, '').trim();
      const mergedAdditional = [rangeText, result.additional]
        .filter(Boolean)
        .join(', ');
      result.additional = mergedAdditional || null;
      result.ingredient = remainder || restBeforeUnit.trim();
      result.unit = null;
      result.unitPlural = null;
      result.symbol = null;
      if (includeUnitSystems) {
        result.unitSystem = null;
      }
    }
  }
  return result;
}

/**
 * Filters additional parts by stopwords list.
 *
 * @param {Object} result - The result object to modify
 * @param {Array<string>} additionalStopwords - Array of stopwords to filter out
 * @returns {Object} - Updated result object
 */
export function filterAdditionalStopwords(result, additionalStopwords) {
  if (result.additional && additionalStopwords.length > 0) {
    const filtered = result.additional
      .split(',')
      .map(part => part.trim())
      .filter(
        part => part && !additionalStopwords.includes(part.toLowerCase()),
      );
    result.additional = filtered.length ? filtered.join(', ') : null;
  }
  return result;
}

/**
 * Detects and removes approx words from ingredient and additional.
 * Sets approx flag if found.
 *
 * @param {Object} result - The result object to modify
 * @param {boolean} approx - Current approx flag value
 * @param {Array<string>} approxWords - Array of approx words to detect
 * @returns {{result: Object, approx: boolean}} - Updated result and approx flag
 */
export function detectAndCleanApproxWords(result, approx, approxWords) {
  if (!approx && approxWords.length > 0) {
    const approxAnywhere = new RegExp(
      `\\b(${approxWords
        .map(w => w.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&'))
        .join('|')})\\b`,
      'i',
    );
    if (approxAnywhere.test(result.ingredient || '')) {
      approx = true;
      result.ingredient = (result.ingredient || '')
        .replace(approxAnywhere, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    if (result.additional && approxAnywhere.test(result.additional)) {
      approx = true;
      result.additional = result.additional
        .replace(approxAnywhere, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (result.additional === '') result.additional = null;
    }
  }
  return {result, approx};
}

/**
 * Applies flags to result: approx, toTaste unit nulling.
 *
 * @param {Object} result - The result object to modify
 * @param {boolean} approx - Whether approx flag should be set
 * @param {boolean} toTaste - Whether toTaste flag is set
 * @param {boolean} forceUnitNull - Whether unit should be nulled for toTaste
 * @param {boolean} includeUnitSystems - Whether to include unit systems
 * @returns {Object} - Updated result object
 */
export function applyPostProcessingFlags(
  result,
  approx,
  toTaste,
  forceUnitNull,
  includeUnitSystems,
) {
  if (approx) {
    result.approx = true;
  }
  if (toTaste && forceUnitNull) {
    result.unit = null;
    result.unitPlural = null;
    result.symbol = null;
    if (includeUnitSystems) {
      result.unitSystem = null;
    }
  }
  return result;
}

/**
 * Processes optional, toServe, toTaste flags and cleans additional field.
 * Helper function for regex-based replacement.
 *
 * @param {string} text - The text to replace in
 * @param {RegExp} regex - The regex to match
 * @returns {string} - Text with regex replaced
 */
function safeReplace(text, regex) {
  return text.replace(regex, '');
}

/**
 * Processes optional flag and cleans additional field.
 *
 * @param {Object} result - The result object to modify
 * @param {boolean} optional - Whether optional flag is set
 * @param {RegExp} optionalRegex - Regex for optional keyword
 * @returns {Object} - Updated result object
 */
export function processOptionalFlag(result, optional, optionalRegex) {
  if (optional) {
    result.optional = true;
    if (result.additional && optionalRegex) {
      const cleanedAdditional = safeReplace(
        result.additional,
        optionalRegex,
      ).trim();
      result.additional = cleanedAdditional || null;
    }
  }
  return result;
}

/**
 * Processes toServe flag and cleans additional field.
 *
 * @param {Object} result - The result object to modify
 * @param {boolean} toServe - Whether toServe flag is set
 * @param {RegExp} toServeRegex - Regex for toServe keyword
 * @returns {Object} - Updated result object
 */
export function processToServeFlag(result, toServe, toServeRegex) {
  if (toServe) {
    result.toServe = true;
    if (result.additional && toServeRegex) {
      const cleanedAdditional = safeReplace(result.additional, toServeRegex)
        .replace(/^[,\s]+|[,\s]+$/g, '')
        .trim();
      result.additional = cleanedAdditional || null;
    }
  }
  return result;
}

/**
 * Processes toTaste flag and cleans additional field.
 *
 * @param {Object} result - The result object to modify
 * @param {boolean} toTaste - Whether toTaste flag is set
 * @param {RegExp} toTasteRegex - Regex for toTaste keyword
 * @param {RegExp} toTasteAdditionalRegex - Additional regex for toTaste cleanup
 * @returns {Object} - Updated result object
 */
export function processToTasteFlag(
  result,
  toTaste,
  toTasteRegex,
  toTasteAdditionalRegex,
) {
  if (toTaste) {
    result.toTaste = true;
    if (result.additional) {
      const cleanedAdditional = safeReplace(result.additional, toTasteRegex)
        .replace(/^[,\s]+|[,\s]+$/g, '')
        .trim();
      const cleanedExtra = toTasteAdditionalRegex
        ? safeReplace(cleanedAdditional, toTasteAdditionalRegex)
        : cleanedAdditional;
      const finalAdditional = cleanedExtra
        .replace(/^[,\s]+|[,\s]+$/g, '')
        .trim();
      result.additional = finalAdditional || null;
    }
  }
  return result;
}
