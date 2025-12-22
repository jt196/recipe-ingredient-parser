import * as convert from './convert';
import {i18nMap} from './i18n';
import {repeatingFractions} from './repeatingFractions';

/**
 * Detect "to taste" style units and return a normalized shorthand with metadata.
 *
 * @param {string} input
 * @param {string} language
 * @returns {[string,string|undefined,boolean]} tuple of [unitShorthand, matchedText, isExtendedMatch]
 */
export function toTasteRecognize(input, language) {
  if (typeof input !== 'string') return ['', '', false];
  const langMap = i18nMap[language];
  if (!langMap || !langMap.toTaste) return ['', '', false];
  const {toTaste} = langMap;

  for (const toTasteItem of toTaste) {
    const firstLetter = toTasteItem.match(/\b(\w)/g);

    if (firstLetter) {
      // checking the extended version
      let regEx = new RegExp(toTasteItem, 'gi');
      if (input.match(regEx)) {
        return [
          (firstLetter.join('.') + '.').toLocaleLowerCase(),
          convert.getFirstMatch(input, regEx),
          true,
        ];
      }
      const regExString = firstLetter.join('[.]?') + '[.]?';
      regEx = new RegExp('(\\b' + regExString + '\\b)', 'gi');
      // const a = input.toString().split(/[\s-]+/);
      if (input.match(regEx)) {
        return [
          (firstLetter.join('.') + '.').toLocaleLowerCase(),
          convert.getFirstMatch(input, regEx),
          false,
        ];
      }
    }
  }

  return ['', '', false];
}

/**
 * Extracts the unit of measurement from a given text.
 * Supports multiple languages by looking up the units in the i18nMap.
 * Returns an array with the singular unit, plural unit, symbol, and the matched text.
 * If no unit is found, returns an empty array.
 *
 * @param {string} input - The text to parse.
 * @param {string} language - The language key (e.g., 'eng', 'deu', 'ita').
 * @returns {Array} An array in the form [unit, pluralUnit, symbol, match] or [] if no match.
 */
function getUnit(input, language) {
  if (typeof input !== 'string') return [];
  const langMap = i18nMap[language];
  if (!langMap) return [];
  const {units, pluralUnits, symbolUnits, problematicUnits} = langMap;
  const [toTaste, toTasteMatch] = toTasteRecognize(input, language);

  // This will collect all unit matches in the form: [unit, pluralUnit, symbol, match]
  let allMatches = [];

  /**
   * Adds a unit match to the allMatches array.
   *
   * @param {string} unit - The canonical singular unit.
   * @param {string} pluralUnit - The plural version of the unit.
   * @param {string} match - The substring from the input that matched.
   */
  const addMatch = (unit, pluralUnit, match) => {
    const symbol = symbolUnits[unit];
    allMatches.push([unit, pluralUnit, symbol, match]);
  };

  // If "to taste" is detected, add it as a unit.
  if (toTaste) {
    addMatch(toTaste, toTaste, toTasteMatch);
  }

  // Look for singular unit matches using defined shorthands.
  for (const unit of Object.keys(units)) {
    for (const shorthand of units[unit]) {
      // Create a regex that ensures the shorthand is a whole word (or at word boundaries).
      const regex = new RegExp(
        `(?:^|\\s)${shorthand.replace(/\./g, '\\.')}(?:$|\\s)`,
        'gi',
      );
      const match = input.match(regex);
      if (match) {
        addMatch(unit, pluralUnits[unit], match[0]);
      }
    }
  }

  // Look for plural unit matches.
  for (const pluralUnit of Object.keys(pluralUnits)) {
    const regex = new RegExp(`\\b${pluralUnits[pluralUnit]}\\b`, 'gi');
    const match = input.match(regex);
    if (match) {
      addMatch(pluralUnit, pluralUnits[pluralUnit], match[0]);
    }
  }

  // Filter out problematic units if no context clue is present.
  // e.g. "2 cloves garlic" vs "2 cloves"
  // if "garlic" is not present (context clue), don't process "clove" as a unit
  for (const problematicUnit in problematicUnits) {
    const contextClues = problematicUnits[problematicUnit];
    if (
      allMatches.some(match => match[0] === problematicUnit) &&
      !contextClues.some(clue => input.includes(clue))
    ) {
      allMatches = allMatches.filter(match => match[0] !== problematicUnit);
    }
  }

  // Determine the best match:
  // Choose the match that appears earliest in the input.
  // If two matches start at the same index, choose the longer (more specific) match.
  if (allMatches.length > 0) {
    let bestMatch = null;
    for (const match of allMatches) {
      // match[3] is the matched text
      const idx = input.indexOf(match[3]);
      if (
        bestMatch === null ||
        idx < bestMatch.index ||
        (idx === bestMatch.index &&
          match[3].trim().length > bestMatch.match[3].trim().length)
      ) {
        bestMatch = {match, index: idx};
      }
    }
    return bestMatch.match;
  }
  return [];
}

/**
 * Return the preposition (if any) that starts the given input string.
 *
 * @param {string} input
 * @param {string} language
 * @return {string|null} The matched preposition, or null if none.
 */
function getPreposition(input, language) {
  const {prepositions} = i18nMap[language];

  for (const preposition of prepositions) {
    const regex = new RegExp('^' + preposition);
    if (convert.getFirstMatch(input, regex)) {
      return preposition;
    }
  }

  return null;
}

/**
 * Returns the symbol for a given unit in a given language, if available.
 *
 * @param {string} unit - The unit to look up.
 * @param {string} language - The language to use for the lookup.
 * @returns {string} The symbol for the unit, or an empty string if not found.
 */
export const getSymbol = (unit, language) => {
  const langMap = i18nMap[language];
  if (!unit || !langMap?.units || !langMap?.symbolUnits) return '';

  const normalizedKey = Object.keys(langMap.units).find(key =>
    langMap.units[key].includes(unit),
  );

  return langMap.symbolUnits[normalizedKey] || '';
};

/**
 * Map a canonical unit to a measurement system.
 * @param {string|null} unit
 * @returns {string|null}
 */
export const getUnitSystem = (unit, language) => {
  if (!unit) return null;
  const langMap = i18nMap[language];
  const unitSystems = langMap?.unitSystems;
  if (unitSystems && unitSystems[unit]) {
    return unitSystems[unit];
  }
  return null;
};

/**
 * Convert a numeric-ish value to number, respecting comma decimal locales.
 * @param {string|number|null} value
 * @param {string} language
 * @returns {number}
 */
export function convertToNumber(value, language) {
  const {isCommaDelimited} = i18nMap[language] || {};
  if (value === null || value === undefined) return 0;

  const raw =
    typeof value === 'string'
      ? value.replace(isCommaDelimited ? ',' : '.', '.')
      : value;
  const num = Number(raw);

  if (Number.isNaN(num)) return 0;

  // Round to 3 decimals max
  return Math.round(num * 1000) / 1000;
}

/**
 * Detect a leading multiplicative pattern such as "2 x 100g" or stacked numbers like "2 100g".
 * Returns the multiplier and the remainder of the line to parse.
 *
 * @param {string} line
 * @param {string} language
 * @returns {{multiplier:number, line:string}}
 */
function extractMultiplier(line, language) {
  if (typeof line !== 'string') return {multiplier: 1, line: ''};

  let working = line.trim();

  // Explicit "x" or "×" multiplier, allow optional spaces.
  const explicitMatch = working.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(.+)$/i);
  if (explicitMatch) {
    const multiplier = convertToNumber(explicitMatch[1], language) || 1;
    return {multiplier, line: explicitMatch[2].trim()};
  }

  // Implicit stacked numbers: "2 100g chocolate", "1 1.8kg chicken"
  // Avoid mixed fractions like "1 1/2 cups".
  if (/^\d+\s+\d+\/\d+/.test(working)) {
    return {multiplier: 1, line: working};
  }

  const stackedMatch = working.match(/^(\d+)\s+(.+)$/);
  if (stackedMatch) {
    const candidateRest = stackedMatch[2].trim();

    // Avoid treating size descriptors like "1 3-inch ..." as multipliers.
    if (/^\d+\s*[-–]?\s*inch(?:es)?\b/i.test(candidateRest)) {
      return {multiplier: 1, line: working};
    }

    // Skip obvious ranges like "10 - 20" / "10 to 20".
    const {joiners = []} = i18nMap[language] || {};
    const escape = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const joinerPattern = joiners.map(escape).join('|');
    const rangeRegex = joinerPattern
      ? new RegExp(`^(?:[\\-–]|(?:${joinerPattern})\\b)\\s*\\d`, 'i')
      : new RegExp('^[\\-–]\\s*\\d');
    if (rangeRegex.test(candidateRest)) {
      return {multiplier: 1, line: working};
    }

    // Skip mixed-number patterns that start with a fraction.
    if (
      /^(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)/u.test(candidateRest)
    ) {
      return {multiplier: 1, line: working};
    }

    const numberWithUnit = candidateRest.match(
      /^(\d+(?:[.,]\d+)?)(?:\s*[-–]?\s*)([A-Za-z\p{L}])/u,
    );
    if (numberWithUnit) {
      const [candidateQty, candidateRemainder] =
        convert.findQuantityAndConvertIfUnicode(candidateRest, language);
      const candidateUnitParts =
        candidateQty && candidateRemainder ? getUnit(candidateRemainder, language) : [];
      const hasUnit = candidateUnitParts.length > 0;

      // Treat leading size descriptors (inch/centimeter/millimeter) as part of the ingredient, not multipliers.
      const sizeLikeUnit =
        candidateUnitParts[0] &&
        ['inch', 'centimeter', 'millimeter'].includes(candidateUnitParts[0]);

      if (hasUnit && !sizeLikeUnit) {
        const multiplier = convertToNumber(stackedMatch[1], language) || 1;
        return {multiplier, line: candidateRest};
      }
    }
  }

  return {multiplier: 1, line: working};
}

/**
 * Extract balanced parenthetical segments and return cleaned text and segments.
 * @param {string} text
 * @returns {{cleaned: string, segments: string[]}}
 */
function extractParentheticalSegments(text) {
  if (typeof text !== 'string') return {cleaned: '', segments: []};
  let cleaned = '';
  const segments = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') {
      if (depth === 0) current = '';
      else current += ch;
      depth++;
      continue;
    }
    if (ch === ')') {
      if (depth > 1) current += ch;
      depth = Math.max(0, depth - 1);
      if (depth === 0 && current.trim()) {
        segments.push(current.trim());
        current = '';
      }
      continue;
    }
    if (depth > 0) {
      current += ch;
    } else {
      cleaned += ch;
    }
  }

  return {cleaned: cleaned.trim().replace(/\s+/g, ' '), segments};
}

/**
 * Extract instruction/state phrases (with optional leading adverbs) from text and additional notes.
 * @param {string} ingredientText
 * @param {Array<string>} additionalParts
 * @param {Array<string>} instructionsList
 * @param {Array<string>} adverbs
 * @returns {{ingredientText: string, additionalParts: Array<string>, instructions: Array<string>}}
 */
function extractInstructions(
  ingredientText,
  additionalParts,
  instructionsList,
  adverbs,
) {
  if (!Array.isArray(instructionsList) || instructionsList.length === 0) {
    return {ingredientText, additionalParts, instructions: []};
  }

  const escaped = instructionsList.map(w =>
    w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
  );
  const escapedAdverbs = (adverbs || []).map(w =>
    w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
  );

  const adverbPart =
    escapedAdverbs.length > 0 ? `(?:${escapedAdverbs.join('|')})\\s+` : '';
  const regex = new RegExp(
    `(?<!-)\\b(?:${adverbPart})?(?:${escaped.join('|')})\\b(?!-)`,
    'gi',
  );

  const found = [];
  const strip = text =>
    typeof text === 'string'
      ? text.replace(regex, match => {
          found.push(match.trim().replace(/\s+/g, ' '));
          return ' ';
        })
      : text;

  const newIngredient = strip(ingredientText);
  const newAdditionalParts = (additionalParts || []).map(part =>
    strip(part).trim(),
  );

  return {
    ingredientText:
      typeof newIngredient === 'string'
        ? newIngredient.replace(/\s+/g, ' ').trim()
        : ingredientText,
    additionalParts: newAdditionalParts.filter(Boolean),
    instructions: found,
  };
}

/**
 * Parses a ingredient string to extract ingredient details.
 *
 * This function processes a recipe string to extract and return a structured
 * object containing the quantity, unit, ingredient name, and additional
 * information. It supports multiple languages and handles various text
 * formats such as fractions, ranges, and additional notes within parentheses
 * or after commas.
 *
 * @param {string} ingredientString - The input string representing the recipe ingredient.
 * @param {string} language - The language key to use for parsing (e.g., 'eng', 'deu', 'ita').
 * @returns {Object} An object containing:
 *   - {number|null} quantity - The parsed quantity as a number.
 *   - {string|null} unit - The singular form of the unit if detected.
 *   - {string|null} unitPlural - The plural form of the unit if applicable.
 *   - {string|null} symbol - The unit symbol if available.
 *   - {string} ingredient - The cleaned ingredient name.
 *   - {number} minQty - The minimum quantity in a range or the single quantity.
 *   - {number} maxQty - The maximum quantity in a range or the single quantity.
 *   - {string|null} additional - Any additional notes or information found.
 *   - {string} originalString - The original input string for reference.
 */
export function parse(ingredientString, language, options = {}) {
  const includeUnitSystems = options.includeUnitSystems || false;
  const includeAlternatives = options.includeAlternatives || false;
  if (typeof ingredientString !== 'string') {
    return {
      quantity: 0,
      unit: null,
      unitPlural: null,
      symbol: null,
      ingredient: '',
      minQty: 0,
      maxQty: 0,
      additional: null,
      originalString: '',
    };
  }
  const langMap = i18nMap[language] || {};
  const approxWords = langMap.approx || [];
  const optionalWords = langMap.optional || [];
  const toServeWords = langMap.toServe || [];
  const instructionWords = langMap.instructions || [];
  const adverbWords = langMap.adverbs || [];

  // Initialize variables
  let originalString = ingredientString.trim(); // Save the original string
  let ingredientLine = originalString; // Initialize working copy

  // Remove leading list markers like "- " or "• " that can appear in exported text
  ingredientLine = ingredientLine.replace(/^\s*[-•]\s+/, '').trim();
  originalString = ingredientLine;

  // Capture parenthetical content (supports nesting) and comma-separated extras
  let additionalParts = [];
  const {cleaned, segments} = extractParentheticalSegments(ingredientLine);
  if (segments.length) additionalParts.push(...segments);
  ingredientLine = cleaned;

  // Negative lookbehind/ahead for numbers either side of a comma to account for 1,500.
  const commaAdditionalRegex = /(?<![0-9]),\s*([^,]+)\s*(?![0-9])/g;
  let commaMatch;
  while ((commaMatch = commaAdditionalRegex.exec(ingredientLine))) {
    if (commaMatch[1]) additionalParts.push(commaMatch[1].trim());
  }
  ingredientLine = ingredientLine.replace(commaAdditionalRegex, '').trim();

  const alternatives = [];
  const tryAddAlternative = fragment => {
    if (!includeAlternatives || !fragment || !fragment.trim()) return false;
    if (!/\d/.test(fragment)) return false;
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
    const alt = parse(fragment, language, {
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
      if (includeUnitSystems) {
        altEntry.unitSystem = getUnitSystem(alt.unit, language);
      }
      alternatives.push(altEntry);
      return altEntry;
    }
    return false;
  };

  if (includeAlternatives && additionalParts.length) {
    const kept = [];
    additionalParts.forEach(part => {
      if (!tryAddAlternative(part)) {
        kept.push(part);
      }
    });
    additionalParts.length = 0;
    additionalParts.push(...kept);
  }

  // Detect alternative separated by slash (units on both sides or spaced slash)
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

  /* restOfIngredient represents rest of ingredient line.
  For example: "1 pinch salt" --> quantity: 1, restOfIngredient: pinch salt */
  let approx = false;
  const approxRegex =
    approxWords.length > 0
      ? new RegExp(
          `^(${approxWords
            .map(w => w.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&'))
            .join('|')})\\b`,
          'i',
        )
      : null;

  const optionalRegex =
    optionalWords.length > 0
      ? new RegExp(
          `(?:^|[,(])\\s*(${optionalWords
            .map(w => w.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&'))
            .join('|')})\\b`,
          'gi',
        )
      : null;

  const toServeRegex =
    toServeWords.length > 0
      ? new RegExp(
          `\\b(${toServeWords
            .map(w => w.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&'))
            .join('|')})\\b`,
          'gi',
        )
      : null;

  const safeTest = (regex, text) => {
    if (!regex || typeof text !== 'string') return false;
    regex.lastIndex = 0;
    return regex.test(text);
  };

  const safeReplace = (text, regex) => {
    if (!regex || typeof text !== 'string') return text;
    regex.lastIndex = 0;
    return text.replace(regex, '');
  };

  if (approxRegex) {
    const matchApprox = ingredientLine.match(approxRegex);
    if (matchApprox) {
      approx = true;
      ingredientLine = ingredientLine.replace(matchApprox[0], '').trim();
    }
  }

  // Normalize ampersand-separated mixed numbers like "1 & 1/2"
  ingredientLine = ingredientLine.replace(
    /(\d)\s*&\s*(\d+\/\d+)/g,
    '$1 $2',
  );

  // Convert stray non-dash separators between digits into fraction slash (but ignore hyphen/dash ranges)
  ingredientLine = ingredientLine.replace(
    /(\d)\s*[^\dA-Za-z\s\-–.,&]\s*(\d)/g,
    '$1/$2',
  );
  ingredientLine = ingredientLine.replace(/(\d)\s*â[^\dA-Za-z]+(\d)/g, '$1/$2');

  let optional = false;
  if (safeTest(optionalRegex, originalString)) {
    optional = true;
  }
  if (safeTest(optionalRegex, ingredientLine)) {
    optional = true;
    ingredientLine = safeReplace(ingredientLine, optionalRegex).trim();
  }

  let toServe = false;
  if (safeTest(toServeRegex, originalString)) {
    toServe = true;
  }
  if (safeTest(toServeRegex, ingredientLine)) {
    toServe = true;
    ingredientLine = safeReplace(ingredientLine, toServeRegex).trim();
  }

  const {multiplier, line: lineWithoutMultiplier} = extractMultiplier(
    ingredientLine,
    language,
  );
  ingredientLine = lineWithoutMultiplier;

  let [quantity, restOfIngredient] = convert.findQuantityAndConvertIfUnicode(
    ingredientLine,
    language,
  );
  quantity = convert.convertFromFraction(quantity, language);

  if (approxRegex) {
    const approxMatch = restOfIngredient.match(approxRegex);
    if (approxMatch) {
      approx = true;
      restOfIngredient = restOfIngredient.replace(approxMatch[0], '').trim();
    }
  }
  if (safeTest(optionalRegex, restOfIngredient)) {
    optional = true;
    restOfIngredient = safeReplace(restOfIngredient, optionalRegex).trim();
  }
  if (safeTest(toServeRegex, restOfIngredient)) {
    toServe = true;
    restOfIngredient = safeReplace(restOfIngredient, toServeRegex).trim();
  }

  // Normalize stray leading dashes left after quantity stripping (e.g., "14-oz" -> "oz")
  restOfIngredient = restOfIngredient.replace(/^[-–]\s*/, '').trim();

  // Capture leading size descriptors like "3-inch" before the unit (e.g., "1 3-inch stick")
  const sizeDescriptorRegex =
    /^(\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*-?\s*inch(?:es)?\b[-\s]*/i;
  const sizeMatch = restOfIngredient.match(sizeDescriptorRegex);
  if (sizeMatch) {
    additionalParts.push(sizeMatch[0].trim());
    restOfIngredient = restOfIngredient.slice(sizeMatch[0].length).trim();
  }

  // grab unit and turn it into non-plural version, for ex: "Tablespoons" OR "Tsbp." --> "tablespoon"
  const restBeforeUnit = restOfIngredient;
  const [unit, unitPlural, symbol, originalUnit] = getUnit(
    restOfIngredient,
    language,
  );
  // remove unit from the ingredient if one was found and trim leading and trailing whitespace
  let ingredient = originalUnit
    ? restOfIngredient.replace(originalUnit, '').trim()
    : restOfIngredient.replace(unit, '').trim();
  ingredient = ingredient.replace(/\.(\s|$)/g, '$1').trim();
  ingredient = ingredient.replace(/^(?:can|tin)\s+/i, '').trim();
  const preposition = getPreposition(ingredient.split(' ')[0], language);
  if (preposition) {
    const regex = new RegExp('^' + preposition);
    ingredient = ingredient.replace(regex, '').trim();
  }

  // Drop leading articles like "a" / "an" that can survive after preposition stripping.
  ingredient = ingredient.replace(/^(?:a|an)\s+/i, '').trim();

  // If an instruction/state word (or other known markers) is glued to the previous token, insert a space so it can be detected.
  const glueTargets = [...(instructionWords || []), 'prepared'];
  if (glueTargets.length > 0) {
    const escapedInstr = glueTargets.map(w =>
      w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
    );
    const instrGlueRegex = new RegExp(
      `([A-Za-z])(${escapedInstr.join('|')})\\b`,
      'gi',
    );
    ingredient = ingredient.replace(instrGlueRegex, '$1 $2');
    additionalParts = additionalParts.map(part =>
      typeof part === 'string' ? part.replace(instrGlueRegex, '$1 $2') : part,
    );
  }

  if (includeAlternatives && !ingredient && alternatives.length > 0) {
    const altWithIngredient = alternatives.find(
      alt => alt.ingredient && alt.ingredient.trim() !== '',
    );
    if (altWithIngredient) {
      ingredient = altWithIngredient.ingredient;
    }
  }

  // Extract instruction/state phrases (with optional adverbs) from ingredient and additional parts
  const instructionExtraction = extractInstructions(
    ingredient,
    additionalParts,
    instructionWords,
    adverbWords,
  );
  ingredient = instructionExtraction.ingredientText;
  additionalParts = instructionExtraction.additionalParts;
  const instructionsFound = instructionExtraction.instructions;

  // If instructions stripped the ingredient text but we still have leftover parts, promote the first leftover to ingredient.
  if ((!ingredient || ingredient.trim() === '') && additionalParts.length > 0) {
    const idx = additionalParts.findIndex(part => {
      const cleaned = safeReplace(
        safeReplace(part || '', optionalRegex),
        toServeRegex,
      ).trim();
      return cleaned.length > 0;
    });
    if (idx !== -1) {
      const promotedRaw = additionalParts.splice(idx, 1)[0] || '';
      const promotedClean = safeReplace(
        safeReplace(promotedRaw, optionalRegex),
        toServeRegex,
      ).trim();
      ingredient = promotedClean || promotedRaw.trim();
    }
  }

  // If a leading fraction remains in the ingredient text (e.g., "1/4 Cutting Edge ..."),
  // prefer it as the primary quantity to avoid later unicode/alt quantities overwriting.
  const leadingFraction = ingredient.match(
    /^(\d+\s*\/\s*\d+|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/u,
  );
  if (leadingFraction) {
    const leadingQty = convert.convertFromFraction(leadingFraction[0], language);
    if (leadingQty != null) {
      quantity = leadingQty.toString();
      ingredient = ingredient.replace(leadingFraction[0], '').trim();
    }
  }
  ingredient = ingredient
    .replace(/^(?:\s*[-–—]\s*)+/, '')
    .replace(/(?:\s*[-–—]\s*)+$/, '')
    .trim();
  ingredient = ingredient
    .replace(/(\d)\s*-\s*(?=[A-Za-z])/g, '$1-')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/pound(?=[A-Za-z])/g, 'pound ')
    .replace(/\s+/g, ' ')
    .trim();
  ingredient = ingredient.replace(/^[^\p{L}\p{N}]+/u, '').trim();

  if (includeAlternatives && /\bor\b/i.test(ingredient)) {
    const parts = ingredient.split(/\bor\b/i);
    const primaryIngredient = parts.shift().trim();
    const altIngredient = parts.join('or').trim();
    if (primaryIngredient) {
      ingredient = primaryIngredient.replace(/\s*[-–—]\s*$/, '').trim();
    }
    if (altIngredient) {
      let altParsed = null;
      if (/[0-9¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/.test(altIngredient)) {
        altParsed = parse(altIngredient, language, {
          includeAlternatives: false,
          includeUnitSystems,
        });
      }
      if (altParsed && (altParsed.quantity || altParsed.unit || altParsed.ingredient)) {
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
      } else {
        const cleanedAlt = altIngredient.replace(/^\s*[-–—]\s*/, '').trim();
        const altEntry = {
          quantity: convertToNumber(quantity, language),
          unit: unit ? unit : null,
          unitPlural: unitPlural ? unitPlural : null,
          symbol: symbol ? symbol : null,
          ingredient: cleanedAlt,
          minQty: convertToNumber(minQty, language),
          maxQty: convertToNumber(maxQty, language),
          originalString: cleanedAlt,
        };
        if (includeUnitSystems) {
          altEntry.unitSystem = getUnitSystem(altEntry.unit, language);
        }
        alternatives.push(altEntry);
      }
    }
  }

  let minQty = quantity; // default to quantity
  let maxQty = quantity; // default to quantity

  // if quantity is non-nil and is a range, for ex: "1-2", we want to get minQty and maxQty
  if (quantity && (quantity.includes('-') || quantity.includes('–'))) {
    [minQty, maxQty] = quantity.split(/-|–/);
    quantity = minQty;
  }

  const result = {
    quantity: convertToNumber(quantity, language),
    unit: unit ? unit : null,
    unitPlural: unitPlural ? unitPlural : null,
    symbol: symbol ? symbol : null,
    ingredient: ingredient.replace(/\s+/g, ' ').trim(),
    minQty: convertToNumber(minQty, language),
    maxQty: convertToNumber(maxQty, language),
    additional:
      additionalParts.length > 0
        ? additionalParts.join(', ').replace(/\s+/g, ' ').trim()
        : null,
    originalString, // Include the original string
  };

  if (multiplier !== 1 && Number.isFinite(result.quantity)) {
    const baseQuantity = result.quantity;
    const baseMinQty = result.minQty;
    const baseMaxQty = result.maxQty;

    result.multiplier = multiplier;
    result.perItemQuantity = baseQuantity;
    result.perItemMinQty = baseMinQty;
    result.perItemMaxQty = baseMaxQty;
    result.quantity = convertToNumber(baseQuantity * multiplier, language);
    result.minQty = convertToNumber(baseMinQty * multiplier, language);
    result.maxQty = convertToNumber(baseMaxQty * multiplier, language);
  }

  if (includeUnitSystems) {
    result.unitSystem = getUnitSystem(result.unit, language);
  }

  // Handle leading weight/size ranges after an initial count, e.g., "1 3-4 lb whole chicken".
  // In these cases treat the range + unit as additional info and keep unit null to avoid "1 lb 3-4 chicken".
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

  if (approx) {
    result.approx = true;
  }
  if (optional) {
    result.optional = true;
    if (result.additional && optionalRegex) {
      const cleanedAdditional = safeReplace(result.additional, optionalRegex).trim();
      result.additional = cleanedAdditional || null;
    }
  }
  if (toServe) {
    result.toServe = true;
    if (result.additional && toServeRegex) {
      const cleanedAdditional = safeReplace(result.additional, toServeRegex)
        .replace(/^[,\s]+|[,\s]+$/g, '')
        .trim();
      result.additional = cleanedAdditional || null;
    }
  }
  if (includeAlternatives && alternatives.length > 0) {
    const primaryQty = result.quantity;
    const primaryUnit = result.unit;
    const primaryMin = result.minQty;
    const primaryMax = result.maxQty;
    alternatives.forEach(alt => {
      if (!alt.unit && primaryUnit) {
        alt.unit = primaryUnit;
        alt.unitPlural = result.unitPlural;
        alt.symbol = result.symbol;
      }
      if ((alt.quantity === 0 || alt.quantity === null) && primaryQty) {
        alt.quantity = primaryQty;
        alt.minQty = primaryMin;
        alt.maxQty = primaryMax;
      }
    });
    result.alternatives = alternatives;
  }
  if (instructionsFound && instructionsFound.length > 0) {
    result.instructions = instructionsFound;
  }

  return result;
}

export function multiLineParse(recipeString, language) {
  const source = typeof recipeString === 'string' ? recipeString : '';
  const ingredients = source.split(/[,👉🏻👉\r\n-]/); // eslint-disable-line no-misleading-character-class

  return ingredients.map(x => parse(x, language)).filter(x => x['ingredient']);
}

/**
 * Combine duplicate ingredients by unit/name, summing quantities and ranges.
 * @param {Array} ingredientArray
 * @returns {Array}
 */
export function combine(ingredientArray) {
  const list = Array.isArray(ingredientArray) ? ingredientArray : [];
  const combinedIngredients = list.reduce((acc, ingredient) => {
    const key = ingredient.ingredient + ingredient.unit; // when combining different units, remove this from the key and just use the name
    const existingIngredient = acc[key];

    if (existingIngredient) {
      return Object.assign(acc, {
        [key]: combineTwoIngredients(existingIngredient, ingredient),
      });
    } else {
      return Object.assign(acc, {[key]: ingredient});
    }
  }, {});

  return Object.keys(combinedIngredients)
    .reduce((acc, key) => {
      const ingredient = combinedIngredients[key];
      return acc.concat(ingredient);
    }, [])
    .sort(compareIngredients);
}

// TODO: Maybe change this to existingIngredients: Ingredient | Ingredient[]
/**
 * Sum quantities/min/max for two matching ingredient entries.
 * @param {Object} existingIngredients
 * @param {Object} ingredient
 * @returns {Object}
 */
function combineTwoIngredients(existingIngredients, ingredient) {
  const quantity =
    existingIngredients.quantity !== null && ingredient.quantity !== null
      ? Number(existingIngredients.quantity) + Number(ingredient.quantity)
      : null;
  const minQty =
    existingIngredients.minQty !== null && ingredient.minQty !== null
      ? Number(existingIngredients.minQty) + Number(ingredient.minQty)
      : null;
  const maxQty =
    existingIngredients.maxQty !== null && ingredient.maxQty !== null
      ? Number(existingIngredients.maxQty) + Number(ingredient.maxQty)
      : null;
  return Object.assign({}, existingIngredients, {quantity, minQty, maxQty});
}

/**
 * Alphabetical sort by ingredient name.
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function compareIngredients(a, b) {
  if (a.ingredient === b.ingredient) {
    return 0;
  }
  return a.ingredient < b.ingredient ? -1 : 1;
}
