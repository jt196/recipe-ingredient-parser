import * as convert from './utils/convert';
import {i18nMap} from './i18n';
import {
  getUnit,
  getPreposition,
  getUnitSystem,
  convertToNumber,
  extractMultiplier,
  extractParentheticalSegments,
  extractInstructions,
} from './utils/parser-helpers';
import {
  resultQuantityCaptured,
  getUnitAndRemainder,
  resolveRangeQuantities,
} from './utils/quantity';
import {combine as combineIngredients} from './utils/combine';
import {processAlternatives} from './utils/alternatives';
import {buildFlagRegexes, safeReplace, safeTest} from './utils/flags';

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
  let forceUnitNull = false;
  // Working copies
  let originalString = ingredientString.trim();
  let ingredientLine = originalString;

  const hadOptionalLabel = /^optional:/i.test(ingredientLine);
  // Normalize leading "Optional:" label that sometimes precedes the line.
  ingredientLine = ingredientLine.replace(/^optional:\s*/i, '').trim();
  originalString = ingredientLine;

  // Remove leading list markers like "- " or "• " that can appear in exported text
  ingredientLine = ingredientLine.replace(/^\s*[-•]\s+/, '').trim();
  originalString = ingredientLine;

  // Capture parenthetical content (supports nesting) and comma-separated extras
  let additionalParts = [];
  let containerSizeText = null;
  let hadWordNumberCan = false;

  // Handle leading written numbers followed by a numeric size and a canned unit (e.g., "Three 15-ounce cans ...")
  const wordNumberCanMatch = ingredientLine.match(
    /^([A-Za-z]+)\s+([\d.,/¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞-]+)\s+(cans?)\b\s*(.*)/iu,
  );
  if (wordNumberCanMatch) {
    const wordQty = convert.text2num(wordNumberCanMatch[1], language);
    if (wordQty && wordQty > 0) {
      hadWordNumberCan = true;
      const sizePart = wordNumberCanMatch[2].trim();
      const rest = wordNumberCanMatch[4] || '';
      if (sizePart) additionalParts.push(sizePart);
      ingredientLine = `${wordQty} ${wordNumberCanMatch[3]} ${rest}`.trim();
      originalString = ingredientLine;
    }
  }

  // 1) Remove parenthetical segments (stored in additional parts)
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

  const {
    ingredientLine: altIngredientLine,
    additionalParts: altAdditionalParts,
    alternatives,
  } = processAlternatives({
    ingredientLine,
    additionalParts,
    includeAlternatives,
    instructionWords,
    language,
    includeUnitSystems,
    parseFn: parse,
    originalString,
  });
  ingredientLine = altIngredientLine;
  additionalParts = altAdditionalParts;

  /* restOfIngredient represents rest of ingredient line.
  For example: "1 pinch salt" --> quantity: 1, restOfIngredient: pinch salt */
  let approx = false;
  const {approxRegex, optionalRegex, toServeRegex} = buildFlagRegexes({
    approxWords,
    optionalWords,
    toServeWords,
  });

  if (approxRegex) {
    const matchApprox = ingredientLine.match(approxRegex);
    if (matchApprox) {
      approx = true;
      ingredientLine = ingredientLine.replace(matchApprox[0], '').trim();
    }
  }

  // Normalize ampersand-separated mixed numbers like "1 & 1/2"
  ingredientLine = ingredientLine.replace(/(\d)\s*&\s*(\d+\/\d+)/g, '$1 $2');

  // Convert stray non-dash separators between digits into fraction slash (but ignore hyphen/dash ranges)
  ingredientLine = ingredientLine.replace(
    /(\d)\s*[^\dA-Za-z\s\-–.,&]\s*(\d)/g,
    '$1/$2',
  );
  ingredientLine = ingredientLine.replace(/(\d)\s*â[^\dA-Za-z]+(\d)/g, '$1/$2');

  let optional = hadOptionalLabel || false;
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
  const leadingFractionInOriginal = originalString.match(
    /^\s*(\d+)\s*\/\s*(\d+)/,
  );
  if (leadingFractionInOriginal) {
    const numerator = Number(leadingFractionInOriginal[1]);
    const denominator = Number(leadingFractionInOriginal[2]);
    if (denominator) {
      const fracVal = numerator / denominator;
      quantity = fracVal.toString();
    }
  }

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

  // Detect primary/alternative units expressed with a slash (e.g., "cup/150 grams sugar").
  if (
    includeAlternatives &&
    restOfIngredient &&
    /^\s*[A-Za-z\p{L}]+\s*\/\s*[~\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/u.test(restOfIngredient)
  ) {
    const altSlashMatch = restOfIngredient.match(
      /^\s*([A-Za-z\p{L}]+)\s*\/\s*([~\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?:\s*\/\s*\d+)?)\s*([A-Za-z\p{L}]+)\b(.*)$/u,
    );
    if (altSlashMatch) {
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
        restOfIngredient = `${primaryUnitText} ${remainder}`.trim();
      }
    }
  }

  // Normalize stray leading dashes left after quantity stripping (e.g., "14-oz" -> "oz")
  restOfIngredient = restOfIngredient.replace(/^[-–]\s*/, '').trim();

  // Capture leading size descriptors like "3-inch" before the unit (e.g., "1 3-inch stick")
  const sizeDescriptorRegex =
    /^(\d+(?:[.,]\d+)?(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*-?\s*inch(?:es)?\b[-\s]*/i;
  const sizeMatch = restOfIngredient.match(sizeDescriptorRegex);
  if (sizeMatch) {
    additionalParts.push(sizeMatch[0].trim());
    restOfIngredient = restOfIngredient.slice(sizeMatch[0].length).trim();
  }
  // Handle inch descriptors without an explicit leading digit (e.g., "inch piece ginger" after word-number quantities).
  if (/^inch(?:es)?\b/i.test(restOfIngredient)) {
    additionalParts.push('1-inch');
    restOfIngredient = restOfIngredient
      .replace(/^inch(?:es)?\b[-\s]*/i, '')
      .trim();
  }

  // Capture leading secondary size notes that precede container units (e.g., "15-ounce cans")
  const containerSizeRegex =
    /^(?:of\s+)?(?:a\s+)?(\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?)\s*(?:oz|ounce|ounces|g|gram|grams|kg|kilogram|milliliter|millilitre|ml|liter|litre|lb|pound|pounds)\b[-\s]*(?=\s*(?:can|cans|package|packages|pack|packs|packet|packets|pack\.?|tin|tins|bag|bags|piece|pieces|bunch|handful|handfuls))/i;
  const containerSizeMatch = restOfIngredient.match(containerSizeRegex);
  if (containerSizeMatch) {
    containerSizeText = containerSizeMatch[0]
      .replace(/^(?:of\s+)?(?:a\s+)?/i, '')
      .trim();
    restOfIngredient = restOfIngredient
      .slice(containerSizeMatch[0].length)
      .trim();
  }

  // grab unit and turn it into non-plural version, for ex: "Tablespoons" OR "Tsbp." --> "tablespoon"
  const restBeforeUnit = restOfIngredient;
  const {
    unit: unitRaw,
    unitPlural: unitPluralRaw,
    symbol: symbolRaw,
    ingredient: ingredientRaw,
    originalUnit,
  } = getUnitAndRemainder(restOfIngredient, language);
  let unit = unitRaw;
  let unitPlural = unitPluralRaw;
  let symbol = symbolRaw;
  let ingredient = ingredientRaw;

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
      const numericQty = convertToNumber(quantity, language);
      if (
        !(
          containerUnit === 'can' &&
          numericQty <= 14 && // allow ounce-weight cans to stay as weight for singular cases
          !hadWordNumberCan
        )
      ) {
        const containerParts = getUnit(containerUnit, language);
        if (containerParts.length) {
          unit = containerParts[0];
          unitPlural = containerParts[1];
          symbol = containerParts[2];
        } else {
          unit = containerUnit;
          unitPlural = containerUnit + 's';
          symbol = null;
        }
      }
    }
  }
  const preposition = getPreposition(ingredient.split(' ')[0], language);
  if (preposition) {
    const regex = new RegExp('^' + preposition);
    ingredient = ingredient.replace(regex, '').trim();
  }

  // Treat leading inch-based size descriptors as additional context when followed by pieces.
  if (unit === 'inch' && /\bpiece\b/i.test(restBeforeUnit)) {
    const sizeText = (restBeforeUnit.match(
      /^[^A-Za-z]*([\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞.,-]+\s*inch(?:es)?)/i,
    ) || [])[1];
    if (sizeText) {
      additionalParts.push(sizeText.trim());
    }
    ingredient = ingredient.replace(/\bpieces?\b/i, '').trim();
    const pieceUnits = getUnit('piece', language);
    if (pieceUnits.length >= 3) {
      unit = pieceUnits[0];
      unitPlural = pieceUnits[1];
      symbol = pieceUnits[2];
    } else {
      unit = 'piece';
      unitPlural = 'pieces';
      symbol = '';
    }
  }

  // Drop leading articles like "a" / "an" that can survive after preposition stripping.
  ingredient = ingredient.replace(/^(?:a|an)\s+/i, '').trim();

  // If an instruction/state word (or other known markers) is glued to the previous token, insert a space so it can be detected.
  const glueTargets = [
    ...(Array.isArray(instructionWords)
      ? instructionWords.filter(word => (word || '').length >= 4)
      : []),
    'prepared',
  ];
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

  // Move trailing dash-separated notes into additional (e.g., "cherries - stalks removed").
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

  // Remove standalone adverbs that remain after instruction extraction and keep them as instructions.
  if (Array.isArray(adverbWords) && adverbWords.length > 0) {
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
  }

  if (
    Array.isArray(instructionsFound) &&
    instructionsFound.includes('salted') &&
    /^un\s+/i.test(ingredient)
  ) {
    ingredient = ingredient.replace(/^un\s+/i, '').trim();
  }

  // Final cleanups on ingredient text for common trailing markers.
  if (ingredient) {
    // Strip lingering optional markers.
    ingredient = safeReplace(ingredient, optionalRegex).trim();

    // Move "to taste"/"adjust to taste" into additional parts.
    if (/\badjust to taste\b/i.test(ingredient)) {
      additionalParts.push('to taste');
      ingredient = ingredient.replace(/\badjust to taste\b/gi, '').trim();
    }
    if (/\bto taste\b/i.test(ingredient)) {
      additionalParts.push('to taste');
      ingredient = ingredient.replace(/\bto taste\b/gi, '').trim();
    }

    // Fix missing spaces after common size adjectives that get glued when units are stripped.
    const spacerWords = ['small', 'large', 'medium', 'healthy', 'scant'];
    spacerWords.forEach(word => {
      const re = new RegExp(`${word}(?=[A-Za-z])`, 'gi');
      ingredient = ingredient.replace(re, `${word} `);
    });

    // Remove filler qualifiers that pollute the ingredient.
    ingredient = ingredient
      .replace(/\bhealthy\b/gi, '')
      .replace(/\beach\b/gi, '')
      .replace(/\bscant\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Move leading size descriptors like "1-inch" into additional.
    const sizeInchMatch = ingredient.match(
      /^(\d+(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?\s*-?inch)\s+(.*)$/i,
    );
    if (sizeInchMatch) {
      additionalParts.push(sizeInchMatch[1]);
      ingredient = sizeInchMatch[2].trim();
    }

    // Strip leading instruction/state terms we already captured.
    if (instructionsFound && instructionsFound.length) {
      const escape = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const leadingInstrRegex = new RegExp(
        `^(?:${instructionsFound.map(escape).join('|')})\\s+`,
        'i',
      );
      ingredient = ingredient.replace(leadingInstrRegex, '').trim();
    }

    // If size adjectives remain leading, treat them as instructions to keep the ingredient clean (unless hyphenated descriptor).
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
      ingredient = ingredient.replace(sizeRegex, '').trim();
    }

    // Demote leading leftover unit tokens (different from the primary) into additional notes when not attached to a number.
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

    // Ensure lukewarm stays as an instruction if present in the original string.
    if (
      /lukewarm/i.test(originalString) &&
      !instructionsFound.includes('lukewarm')
    ) {
      instructionsFound.push('lukewarm');
    }

    // Drop any leading adverb that survived instruction extraction.
    if (Array.isArray(adverbWords) && adverbWords.length) {
      const escapedAdverbs = adverbWords.map(w =>
        w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
      );
      const leadingAdverbRegex = new RegExp(
        `^(?:${escapedAdverbs.join('|')})\\s+`,
        'i',
      );
      ingredient = ingredient.replace(leadingAdverbRegex, '').trim();
    }

    // Clean residual lukewarm truncations.
    ingredient = ingredient.replace(/\bluke\b/gi, '').trim();

    // Strip leading numeric tokens if quantity already captured.
    if (resultQuantityCaptured(quantity) && /^[\d.]/.test(ingredient)) {
      ingredient = ingredient
        .replace(/^[\d.¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+[\s-]*/u, '')
        .trim();
    } else {
      const firstWord = (ingredient.split(/\s+/)[0] || '').toLowerCase();
      const wordNum = convert.text2num(firstWord, language);
      if (resultQuantityCaptured(quantity) && wordNum > 0) {
        ingredient = ingredient
          .replace(new RegExp(`^${firstWord}\\s+`, 'i'), '')
          .trim();
      }
    }

    // If we captured a container size, prepend it for pack-style units.
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
        ingredient = sizeAlready
          ? cleanedIngredient
          : `${sizeForPack} ${cleanedIngredient}`.trim();
      }
    }

    if (unit === 'can') {
      ingredient = ingredient
        .replace(/^(?:cans?|tins?)\b\s*(?:of\s+)?/i, '')
        .trim();
    }

    // Drop leading conjunctions/prepositions.
    ingredient = ingredient.replace(/^(?:of|or|and)\s+/i, '').trim();
    ingredient = ingredient
      .replace(/^(?:small|large|medium)\s+of\s+/i, '')
      .trim();
    // Drop trailing dangling conjunctions.
    ingredient = ingredient.replace(/\b(?:and|or)\s*$/i, '').trim();
  }

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
  if (leadingFraction && !(quantity && `${quantity}`.includes('-'))) {
    const leadingQty = convert.convertFromFraction(
      leadingFraction[0],
      language,
    );
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

  // Initialize range bounds up-front so downstream alternative handling can reuse them.
  let {
    quantity: rangeQuantity,
    minQty,
    maxQty,
  } = resolveRangeQuantities(quantity, originalString, language);
  quantity = rangeQuantity;

  if (includeAlternatives && /\bor\b/i.test(ingredient)) {
    const parts = ingredient.split(/\bor\b/i);
    const primaryIngredient = parts.shift().trim();
    const altIngredient = parts.join('or').trim();
    if (primaryIngredient) {
      ingredient = primaryIngredient.replace(/\s*[-–—]\s*$/, '').trim();
    }
    if (altIngredient) {
      if (/^or\b/i.test(ingredient)) {
        ingredient = '';
      }
      let altParsed = null;
      if (/[0-9¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/.test(altIngredient)) {
        altParsed = parse(altIngredient, language, {
          includeAlternatives: false,
          includeUnitSystems,
        });
      }
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
        if (!ingredient) {
          ingredient = altParsed.ingredient;
        }
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

  // 7) if quantity is non-nil and is a range, for ex: "1-2", we want to get minQty and maxQty
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

  if (
    Array.isArray(instructionsFound) &&
    instructionsFound.includes('salted') &&
    typeof result.ingredient === 'string' &&
    /^un\s+/i.test(result.ingredient)
  ) {
    result.ingredient = result.ingredient.replace(/^un\s+/i, '').trim();
  }

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
      const cleanedAdditional = safeReplace(
        result.additional,
        optionalRegex,
      ).trim();
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
      if (includeUnitSystems && !alt.unitSystem) {
        alt.unitSystem = getUnitSystem(alt.unit || primaryUnit, language);
      }
    });
    result.alternatives = alternatives;
  }
  // Fallback alternative extraction when "or" was consumed during range parsing.
  if (
    includeAlternatives &&
    (!result.alternatives || result.alternatives.length === 0) &&
    /\bor\b/i.test(originalString)
  ) {
    const splitParts = originalString.split(/\bor\b/i);
    if (splitParts.length >= 2) {
      const primaryPart = splitParts.shift().trim();
      const altPart = splitParts.join('or').trim();
      if (altPart && /\d/.test(altPart)) {
        const altParsed = parse(altPart, language, {
          includeAlternatives: false,
          includeUnitSystems,
        });
        if (
          altParsed &&
          (altParsed.quantity || altParsed.unit || altParsed.ingredient)
        ) {
          result.alternatives = [
            {
              quantity: altParsed.quantity || result.quantity,
              unit: altParsed.unit || result.unit,
              unitPlural: altParsed.unitPlural || result.unitPlural,
              symbol: altParsed.symbol || result.symbol,
              ingredient: altParsed.ingredient,
              minQty: altParsed.minQty || result.minQty,
              maxQty: altParsed.maxQty || result.maxQty,
              originalString: altPart,
              ...(includeUnitSystems && {
                unitSystem: getUnitSystem(altParsed.unit, language),
              }),
            },
          ];
          if (
            primaryPart &&
            (!result.ingredient || result.ingredient.trim() === '')
          ) {
            result.ingredient = primaryPart.replace(/^\s*[-–—]\s*/, '').trim();
          }
        }
      }
    }
  }
  // Handle slash-separated ingredient alternatives without their own quantities (e.g., "yogurt / vegan yogurt / coconut milk").
  if (
    includeAlternatives &&
    (!result.alternatives || result.alternatives.length === 0) &&
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
      result.alternatives = ingredientParts.map(part => ({
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
  if (instructionsFound && instructionsFound.length > 0) {
    result.instructions = instructionsFound;
  }

  if (
    includeAlternatives &&
    result.alternatives &&
    result.alternatives.length > 0
  ) {
    const alt0 = result.alternatives[0];
    if (
      alt0 &&
      result.ingredient &&
      typeof result.ingredient === 'string' &&
      alt0.quantity !== null &&
      alt0.quantity !== undefined
    ) {
      const qtyStr = `${alt0.quantity}`.replace('.', '\\.');
      const unitPieces = [alt0.symbol, alt0.unit, alt0.unitPlural]
        .filter(Boolean)
        .join('|');
      const prefixRegex = new RegExp(
        `^${qtyStr}\\s*(?:${unitPieces})?\\s+`,
        'i',
      );
      result.ingredient = result.ingredient.replace(prefixRegex, '').trim();
    }
  }

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
    const remainder = restBeforeUnit.replace(weightRangeMatch[0], '').trim();
    if (remainder) {
      result.ingredient = remainder.replace(/^(?:of)\s+/i, '').trim();
    }
    result.quantity = 1;
    result.minQty = 1;
    result.maxQty = 1;
  }

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

  if (
    includeAlternatives &&
    (!result.alternatives || result.alternatives.length === 0) &&
    originalString.includes('/')
  ) {
    if (/\s\/\s/.test(originalString)) {
      const parts = originalString
        .split('/')
        .map(part => part.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        const primaryPart = parts.shift();
        if (!result.ingredient && primaryPart) {
          result.ingredient = primaryPart.replace(/^[^A-Za-z]+/, '').trim();
        }
        result.alternatives = parts.map(part => ({
          quantity: result.quantity,
          unit: result.unit,
          unitPlural: result.unitPlural,
          symbol: result.symbol,
          ingredient: part.replace(/^[^A-Za-z]+/, '').trim(),
          minQty: result.minQty,
          maxQty: result.maxQty,
          originalString: part,
          ...(includeUnitSystems && {unitSystem: result.unitSystem}),
        }));
      }
    }
  }

  return result;
}

export const combine = combineIngredients;
export {getSymbol} from './utils/parser-helpers';
