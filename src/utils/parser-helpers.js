import * as convert from './convert';
import {i18nMap} from '../i18n';

function getEarliestMatch(allMatches, input) {
  let bestMatch = null;
  for (const match of allMatches) {
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
  return bestMatch ? bestMatch.match : [];
}

export function getUnit(input, language) {
  if (typeof input !== 'string') return [];
  const langMap = i18nMap[language];
  if (!langMap) return [];

  // NEW: Use unitsData as primary source
  const {unitsData, problematicUnits} = langMap;

  // Fallback to old structure if unitsData not available (for other languages not yet migrated)
  if (!unitsData) {
    const {units, pluralUnits, symbolUnits} = langMap;
    let allMatches = [];

    const addMatch = (unit, pluralUnit, match) => {
      const symbol = symbolUnits[unit];
      allMatches.push([unit, pluralUnit, symbol, match]);
    };

    for (const unit of Object.keys(units)) {
      for (const shorthand of units[unit]) {
        const regex = new RegExp(
          `(?:^|[^A-Za-z0-9])${shorthand.replace(
            /\./g,
            '\\.',
          )}(?:$|[^A-Za-z0-9])`,
          'gi',
        );
        const match = input.match(regex);
        if (match) {
          addMatch(unit, pluralUnits[unit], match[0]);
        }
      }
    }

    for (const pluralUnit of Object.keys(pluralUnits)) {
      const regex = new RegExp(
        `(?:^|[^A-Za-z0-9])${pluralUnits[pluralUnit]}(?:$|[^A-Za-z0-9])`,
        'gi',
      );
      const match = input.match(regex);
      if (match) {
        addMatch(pluralUnit, pluralUnits[pluralUnit], match[0]);
      }
    }

    for (const problematicUnit in problematicUnits) {
      const contextClues = problematicUnits[problematicUnit];
      if (
        allMatches.some(match => match[0] === problematicUnit) &&
        !contextClues.some(clue => input.includes(clue))
      ) {
        allMatches = allMatches.filter(match => match[0] !== problematicUnit);
      }
    }

    if (allMatches.length === 0) {
      return [];
    }
    return getEarliestMatch(allMatches, input);
  }

  // NEW: Modern path using unitsData
  let allMatches = [];

  const addMatch = (unitKey, unitData, match) => {
    allMatches.push([unitKey, unitData.plural, unitData.symbol, match]);
  };

  // Search through all unit names
  for (const [unitKey, unitData] of Object.entries(unitsData)) {
    for (const name of unitData.names) {
      const regex = new RegExp(
        `(?:^|[^A-Za-z0-9])${name.replace(
          /\./g,
          '\\.',
        )}(?:$|[^A-Za-z0-9])`,
        'gi',
      );
      const match = input.match(regex);
      if (match) {
        addMatch(unitKey, unitData, match[0]);
      }
    }
  }

  // Filter problematic units
  for (const problematicUnit in problematicUnits) {
    const contextClues = problematicUnits[problematicUnit];
    if (
      allMatches.some(match => match[0] === problematicUnit) &&
      !contextClues.some(clue => input.includes(clue))
    ) {
      allMatches = allMatches.filter(match => match[0] !== problematicUnit);
    }
  }

  if (allMatches.length === 0) {
    return [];
  }
  return getEarliestMatch(allMatches, input);
}

export function getPreposition(input, language) {
  const {prepositions} = i18nMap[language];

  for (const preposition of prepositions) {
    const regex = new RegExp('^' + preposition);
    if (convert.getFirstMatch(input, regex)) {
      return preposition;
    }
  }

  return null;
}

export const getSymbol = (unit, language) => {
  const langMap = i18nMap[language];
  if (!unit || !langMap) return '';

  // NEW: Use unitsData if available
  if (langMap.unitsData) {
    // Try direct lookup first
    if (langMap.unitsData[unit]) {
      return langMap.unitsData[unit].symbol || '';
    }

    // Search through unit names to find canonical key
    for (const [canonicalKey, unitData] of Object.entries(langMap.unitsData)) {
      if (unitData.names.includes(unit)) {
        return unitData.symbol || '';
      }
    }

    return '';
  }

  // Fallback to old structure for languages not yet migrated
  if (!langMap.units || !langMap.symbolUnits) return '';

  const normalizedKey = Object.keys(langMap.units).find(key =>
    langMap.units[key].includes(unit),
  );

  return langMap.symbolUnits[normalizedKey] || '';
};

export const getUnitSystem = (unit, language) => {
  if (!unit) return null;
  const langMap = i18nMap[language];
  if (!langMap) return null;

  // NEW: Use unitsData if available
  if (langMap.unitsData) {
    // Try direct lookup first
    if (langMap.unitsData[unit]) {
      return langMap.unitsData[unit].system;
    }

    // Search through unit names to find canonical key
    for (const [canonicalKey, unitData] of Object.entries(langMap.unitsData)) {
      if (unitData.names.includes(unit)) {
        return unitData.system;
      }
    }

    return null;
  }

  // Fallback to old structure for languages not yet migrated
  const unitSystems = langMap?.unitSystems;
  if (unitSystems && unitSystems[unit]) {
    return unitSystems[unit];
  }
  return null;
};

export function convertToNumber(value, language) {
  const {isCommaDelimited} = i18nMap[language] || {};
  if (value === null || value === undefined) return 0;

  const raw =
    typeof value === 'string'
      ? value.replace(isCommaDelimited ? ',' : '.', '.')
      : value;
  const num = Number(raw);

  if (Number.isNaN(num)) return 0;

  return Math.round(num * 1000) / 1000;
}

export const resultQuantityCaptured = qty =>
  qty !== null && qty !== undefined && `${qty}`.trim() !== '';

export function extractMultiplier(line, language) {
  if (typeof line !== 'string') return {multiplier: 1, line: ''};

  let working = line.trim();

  const explicitMatch = working.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(.+)$/i);
  if (explicitMatch) {
    const multiplier = convertToNumber(explicitMatch[1], language) || 1;
    return {multiplier, line: explicitMatch[2].trim()};
  }

  if (/^\d+\s+\d+\/\d+/.test(working)) {
    return {multiplier: 1, line: working};
  }

  const stackedMatch = working.match(/^(\d+)\s+(.+)$/);
  if (stackedMatch) {
    const candidateRest = stackedMatch[2].trim();

    if (/^\d+\s*[-–]?\s*inch(?:es)?\b/i.test(candidateRest)) {
      return {multiplier: 1, line: working};
    }

    const {joiners = []} = i18nMap[language] || {};
    const escape = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const joinerPattern = joiners.map(escape).join('|');
    const rangeRegex = joinerPattern
      ? new RegExp(`^(?:[\\-–]|(?:${joinerPattern})\\b)\\s*\\d`, 'i')
      : new RegExp('^[\\-–]\\s*\\d');
    if (rangeRegex.test(candidateRest)) {
      return {multiplier: 1, line: working};
    }

    if (/^(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)/u.test(candidateRest)) {
      return {multiplier: 1, line: working};
    }

    const numberWithUnit = candidateRest.match(
      /^(\d+(?:[.,]\d+)?)(?:\s*[-–]?\s*)([A-Za-z\p{L}])/u,
    );
    if (numberWithUnit) {
      const [candidateQty, candidateRemainder] =
        convert.findQuantityAndConvertIfUnicode(candidateRest, language);
      const candidateUnitParts =
        candidateQty && candidateRemainder
          ? getUnit(candidateRemainder, language)
          : [];
      const hasUnit = candidateUnitParts.length > 0;

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

export function extractParentheticalSegments(text) {
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

export function extractInstructions(
  ingredientText,
  additionalParts,
  instructionsList,
  adverbs,
) {
  if (!Array.isArray(instructionsList) || instructionsList.length === 0) {
    return {ingredientText, additionalParts, instructions: []};
  }

  const escaped = [...instructionsList]
    .sort((a, b) => b.length - a.length)
    .map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const escapedAdverbs = (adverbs || []).map(w =>
    w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
  );

  const adverbPart =
    escapedAdverbs.length > 0 ? `(?:${escapedAdverbs.join('|')})\\s+` : '';
  // Use word boundaries but exclude hyphenated words
  const regex = new RegExp(
    `(?<![a-zA-Z-])(?:${adverbPart})?(?:${escaped.join('|')})(?![a-zA-Z-])`,
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
 * Fixes missing spaces after size adjectives that get glued when units are stripped.
 *
 * @param {string} ingredient - The ingredient text to process
 * @returns {string} - Ingredient with fixed spacing
 */
export function fixSizeAdjectiveSpacing(ingredient) {
  const spacerWords = ['small', 'large', 'medium', 'healthy', 'scant'];
  let result = ingredient;
  spacerWords.forEach(word => {
    const re = new RegExp(`${word}(?=[A-Za-z])`, 'gi');
    result = result.replace(re, `${word} `);
  });
  return result;
}

/**
 * Removes filler qualifiers that pollute the ingredient text.
 *
 * @param {string} ingredient - The ingredient text to process
 * @returns {string} - Ingredient with fillers removed
 */
export function removeFillerQualifiers(ingredient) {
  return ingredient
    .replace(/\bhealthy\b/gi, '')
    .replace(/\beach\b/gi, '')
    .replace(/\bscant\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts leading size descriptors like "1-inch" into additional parts.
 *
 * @param {string} ingredient - The ingredient text to process
 * @param {string[]} additionalParts - Array to store extracted size descriptors
 * @returns {{ingredient: string, additionalParts: string[]}} - Updated ingredient and parts
 */
export function extractLeadingSizeDescriptor(ingredient, additionalParts) {
  const sizeInchMatch = ingredient.match(
    /^(\d+(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?\s*-?inch)\s+(.*)$/i,
  );
  if (sizeInchMatch) {
    additionalParts.push(sizeInchMatch[1]);
    return {ingredient: sizeInchMatch[2].trim(), additionalParts};
  }
  return {ingredient, additionalParts};
}

/**
 * Strips leading instruction/state terms that were already captured.
 *
 * @param {string} ingredient - The ingredient text to process
 * @param {string[]} instructionsFound - Array of already found instructions
 * @returns {string} - Ingredient with leading instructions removed
 */
export function stripLeadingInstructions(ingredient, instructionsFound) {
  if (!instructionsFound || !instructionsFound.length) {
    return ingredient;
  }
  const escape = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const leadingInstrRegex = new RegExp(
    `^(?:${instructionsFound.map(escape).join('|')})\\s+`,
    'i',
  );
  return ingredient.replace(leadingInstrRegex, '').trim();
}

/**
 * Processes leading size adjectives, treating them as instructions unless hyphenated.
 * Mutates the instructionsFound array in place.
 *
 * @param {string} ingredient - The ingredient text to process
 * @param {string[]} instructionsFound - Array to store size adjectives as instructions (mutated in place)
 * @returns {string} - Updated ingredient text
 */
export function processLeadingSizeAdjectives(ingredient, instructionsFound) {
  const sizeWords = ['small', 'large', 'medium', 'scant', 'healthy'];
  const sizeRegex = new RegExp(`^(?:${sizeWords.join('|')})\\b`, 'i');
  const sizeMatch = ingredient.match(sizeRegex);
  const nextChar = ingredient.slice(
    sizeMatch ? sizeMatch[0].length : 0,
    sizeMatch ? sizeMatch[0].length + 1 : 0,
  );
  if (sizeMatch && nextChar !== '-') {
    const sizeWord = sizeMatch[0].trim();
    if (!instructionsFound.includes(sizeWord)) {
      instructionsFound.push(sizeWord);
    }
    return ingredient.replace(sizeRegex, '').trim();
  }
  return ingredient;
}

/**
 * Splits glued instruction words by inserting spaces between prefix and instruction.
 * Example: "tomatoeschopped" → "tomatoes chopped"
 *
 * @param {string} ingredient - The ingredient text to process
 * @param {string[]} additionalParts - Array of additional parts to process
 * @param {string[]} instructionWords - Array of instruction words
 * @returns {{ingredient: string, additionalParts: string[]}} - Updated text with split instructions
 */
export function splitGluedInstructions(ingredient, additionalParts, instructionWords) {
  const glueTargets = [
    ...(Array.isArray(instructionWords)
      ? instructionWords.filter(word => (word || '').length >= 4)
      : []),
    'prepared',
  ];

  if (glueTargets.length === 0) {
    return {ingredient, additionalParts};
  }

  const escapedInstr = glueTargets.map(w =>
    w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
  );

  // Only add space if the combined word isn't itself a known instruction
  const instrGlueRegex = new RegExp(
    `([A-Za-z]+)(${escapedInstr.join('|')})\\b`,
    'gi',
  );
  const allInstructionWords = Array.isArray(instructionWords) ? instructionWords : [];

  const smartReplace = (text) => {
    return text.replace(instrGlueRegex, (match, prefix, instrWord) => {
      // Check if the full match (prefix + instrWord) is itself an instruction word
      const fullWord = prefix + instrWord;
      if (allInstructionWords.some(w => w.toLowerCase() === fullWord.toLowerCase())) {
        // Don't split - the full word is a known instruction
        return match;
      }
      // Split it
      return prefix + ' ' + instrWord;
    });
  };

  ingredient = smartReplace(ingredient);
  additionalParts = additionalParts.map(part =>
    typeof part === 'string' ? smartReplace(part) : part,
  );

  return {ingredient, additionalParts};
}

/**
 * Falls back to using ingredient from alternatives if main ingredient is empty.
 *
 * @param {string} ingredient - The current ingredient text
 * @param {boolean} includeAlternatives - Whether alternatives are enabled
 * @param {Array} alternatives - Array of alternative entries
 * @returns {string} - Updated ingredient (fallback from alternatives if needed)
 */
export function fallbackIngredientFromAlternatives(ingredient, includeAlternatives, alternatives) {
  if (includeAlternatives && !ingredient && alternatives.length > 0) {
    const altWithIngredient = alternatives.find(
      alt => alt.ingredient && alt.ingredient.trim() !== '',
    );
    if (altWithIngredient) {
      return altWithIngredient.ingredient;
    }
  }
  return ingredient;
}

/**
 * Moves trailing dash-separated notes into additional parts.
 * Example: "cherries - stalks removed" → ingredient: "cherries", additional: "stalks removed"
 *
 * @param {string} ingredient - The ingredient text to process
 * @param {string[]} additionalParts - Array to store extracted notes (mutated)
 * @returns {{ingredient: string, additionalParts: string[]}} - Updated ingredient and parts
 */
export function extractDashSeparatedNotes(ingredient, additionalParts) {
  const dashSplitMatch = ingredient.match(/^(.*?)[-–—]\s+(.+)$/);
  if (
    dashSplitMatch &&
    dashSplitMatch[1].trim() &&
    dashSplitMatch[2].trim() &&
    !/\bor\b/i.test(dashSplitMatch[2])
  ) {
    ingredient = dashSplitMatch[1].trim();
    additionalParts.push(dashSplitMatch[2].trim());
  }
  return {ingredient, additionalParts};
}

/**
 * Removes standalone adverbs and adds them to instructions.
 * Example: "finely chopped onions" → removes "finely", adds to instructions
 *
 * @param {string} ingredient - The ingredient text to process
 * @param {string[]} additionalParts - Array of additional parts to process
 * @param {string[]} adverbWords - Array of adverb words to remove
 * @param {string[]} instructionsFound - Array to store removed adverbs (mutated)
 * @returns {{ingredient: string, additionalParts: string[]}} - Updated ingredient and parts
 */
export function removeStandaloneAdverbs(ingredient, additionalParts, adverbWords, instructionsFound) {
  if (!Array.isArray(adverbWords) || adverbWords.length === 0) {
    return {ingredient, additionalParts};
  }

  const escapedAdverbs = adverbWords.map(w =>
    w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
  );
  const adverbOnlyRegex = new RegExp(
    `\\b(${escapedAdverbs.join('|')})\\b`,
    'gi',
  );

  ingredient = ingredient.replace(adverbOnlyRegex, match => {
    if (!instructionsFound.includes(match.trim())) {
      instructionsFound.push(match.trim());
    }
    return ' ';
  });

  additionalParts = additionalParts.map(part =>
    typeof part === 'string'
      ? part.replace(adverbOnlyRegex, match => {
          if (!instructionsFound.includes(match.trim())) {
            instructionsFound.push(match.trim());
          }
          return ' ';
        })
      : part,
  );

  return {ingredient, additionalParts};
}

/**
 * Demotes leftover unit tokens to additional parts when they differ from primary unit.
 *
 * @param {string} ingredient - The ingredient text
 * @param {string|null} unit - The primary unit
 * @param {Array<string>} additionalParts - Array to store demoted units
 * @param {string} language - The language key
 * @returns {{ingredient: string, additionalParts: Array<string>}} - Updated ingredient and parts
 */
export function demoteLeftoverUnits(ingredient, unit, additionalParts, language) {
  const leftoverUnitMatch = getUnit(ingredient, language);
  if (
    unit &&
    leftoverUnitMatch.length &&
    leftoverUnitMatch[3] &&
    ingredient.indexOf(leftoverUnitMatch[3]) === 0 &&
    leftoverUnitMatch[0] !== unit &&
    ['cup', 'tablespoon', 'teaspoon'].includes(leftoverUnitMatch[0]) &&
    !/^\d/.test(ingredient)
  ) {
    additionalParts.push(leftoverUnitMatch[3].trim());
    ingredient = ingredient.replace(leftoverUnitMatch[3], '').trim();
  }
  return {ingredient, additionalParts};
}

/**
 * Removes leading adverbs that survived instruction extraction.
 *
 * @param {string} ingredient - The ingredient text
 * @param {Array<string>} adverbWords - Array of adverb words
 * @returns {string} - Ingredient with leading adverbs removed
 */
export function removeLeadingAdverbs(ingredient, adverbWords) {
  if (Array.isArray(adverbWords) && adverbWords.length) {
    const escapedAdverbs = adverbWords.map(w =>
      w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
    );
    const leadingAdverbRegex = new RegExp(
      `^(?:${escapedAdverbs.join('|')})\\s+`,
      'i',
    );
    return ingredient.replace(leadingAdverbRegex, '').trim();
  }
  return ingredient;
}

/**
 * Strips leading numeric tokens when quantity is already captured.
 *
 * @param {string} ingredient - The ingredient text
 * @param {string|number} quantity - The captured quantity
 * @param {string} language - The language key
 * @param {Function} resultQuantityCapturedFn - Function to check if quantity is captured
 * @returns {string} - Ingredient with numeric tokens stripped
 */
export function stripLeadingNumericTokens(
  ingredient,
  quantity,
  language,
  resultQuantityCapturedFn,
) {
  if (resultQuantityCapturedFn(quantity) && /^[\d.]/.test(ingredient)) {
    return ingredient
      .replace(/^[\d.¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+[\s-]*/u, '')
      .trim();
  }
  const firstWord = (ingredient.split(/\s+/)[0] || '').toLowerCase();
  const wordNum = convert.text2num(firstWord, language);
  if (resultQuantityCapturedFn(quantity) && wordNum > 0) {
    return ingredient
      .replace(new RegExp(`^${firstWord}\\s+`, 'i'), '')
      .trim();
  }
  return ingredient;
}

/**
 * Prepends container size for pack-style units.
 *
 * @param {string} ingredient - The ingredient text
 * @param {string|null} unit - The unit
 * @param {string|null} containerSizeText - The container size text
 * @param {string} originalString - The original ingredient string
 * @returns {string} - Updated ingredient
 */
export function prependPackSize(
  ingredient,
  unit,
  containerSizeText,
  originalString,
) {
  if (unit === 'pack') {
    let sizeForPack = containerSizeText;
    if (!sizeForPack) {
      const sizeMatchOrig = originalString.match(
        /(\d+(?:[.,]\d+)?(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?)\s*-?\s*(?:oz|ounce|ounces|pound|lb|g|gram|grams|kg|kilogram)/i,
      );
      if (sizeMatchOrig) sizeForPack = sizeMatchOrig[0].trim();
    }
    if (sizeForPack) {
      const cleanedIngredient = ingredient
        .replace(/^(?:package|pack|packet)s?\s+/i, '')
        .trim();
      const sizeAlready = cleanedIngredient
        .toLowerCase()
        .startsWith(sizeForPack.toLowerCase());
      return sizeAlready
        ? cleanedIngredient
        : `${sizeForPack} ${cleanedIngredient}`.trim();
    }
  }
  return ingredient;
}

/**
 * Removes "can"/"tin" prefixes for can units.
 *
 * @param {string} ingredient - The ingredient text
 * @param {string|null} unit - The unit
 * @returns {string} - Updated ingredient
 */
export function removeCanPrefix(ingredient, unit) {
  if (unit === 'can') {
    return ingredient
      .replace(/^(?:cans?|tins?)\b\s*(?:of\s+)?/i, '')
      .trim();
  }
  return ingredient;
}

/**
 * Removes leading/trailing conjunctions and prepositions.
 *
 * @param {string} ingredient - The ingredient text
 * @returns {string} - Cleaned ingredient
 */
export function removeConjunctionsAndPrepositions(ingredient) {
  ingredient = ingredient.replace(/^(?:of|or|and)\s+/i, '').trim();
  ingredient = ingredient
    .replace(/^(?:small|large|medium)\s+of\s+/i, '')
    .trim();
  ingredient = ingredient.replace(/\b(?:and|or)\s*$/i, '').trim();
  return ingredient;
}

/**
 * Cleans toTaste-related text from ingredient and additional parts.
 *
 * @param {string} ingredient - The ingredient text
 * @param {Array<string>} additionalParts - Array of additional parts
 * @param {boolean} toTaste - Whether toTaste flag is set
 * @param {RegExp} toTasteAdditionalRegex - Regex for additional toTaste cleanup
 * @param {Function} safeReplaceFn - Safe replace function
 * @returns {{ingredient: string, additionalParts: Array<string>}} - Cleaned values
 */
export function cleanToTasteText(
  ingredient,
  additionalParts,
  toTaste,
  toTasteAdditionalRegex,
  safeReplaceFn,
) {
  if (toTaste && toTasteAdditionalRegex) {
    ingredient = safeReplaceFn(ingredient, toTasteAdditionalRegex).trim();
    additionalParts = additionalParts.map(part =>
      typeof part === 'string'
        ? safeReplaceFn(part, toTasteAdditionalRegex).trim()
        : part,
    );
  }
  return {ingredient, additionalParts};
}
