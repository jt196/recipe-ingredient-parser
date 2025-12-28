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
  fixSizeAdjectiveSpacing,
  removeFillerQualifiers,
  extractLeadingSizeDescriptor,
  stripLeadingInstructions,
  processLeadingSizeAdjectives,
  splitGluedInstructions,
  fallbackIngredientFromAlternatives,
  extractDashSeparatedNotes,
  removeStandaloneAdverbs,
  demoteLeftoverUnits,
  removeLeadingAdverbs,
  stripLeadingNumericTokens,
  prependPackSize,
  removeCanPrefix,
  removeConjunctionsAndPrepositions,
  cleanToTasteText,
} from './utils/parser-helpers';
import {
  resultQuantityCaptured,
  getUnitAndRemainder,
  resolveRangeQuantities,
} from './utils/quantity';
import {combine as combineIngredients} from './utils/combine';
import {processAlternatives, processOrAlternatives, cleanupAlternatives} from './utils/alternatives';
import {
  buildFlagRegexes,
  safeReplace,
  safeTest,
  detectApproxFlag,
  detectOptionalFlag,
  detectToServeFlag,
  detectToTasteFlag,
} from './utils/flags';
import {
  removeOptionalLabel,
  removeListMarkers,
  normalizeWordNumberCans,
  extractCommaAdditional,
  normalizeAmpersandFractions,
  normalizeStrayFractionSeparators,
} from './utils/normalize';
import {
  processSlashSeparatedAlternativeUnit,
  removeLeadingDashes,
  extractInchSizeDescriptor,
  handleImplicitInchDescriptor,
  extractContainerSize,
  preferContainerUnits,
  handleInchPieceConversion,
} from './utils/unit-helpers';
import {
  handlePieceInchSize,
  handleWeightRange,
  handleCountPlusRange,
  fallbackUnitGuess,
  fallbackIngredientGuess,
  handleLeadingWeightSizeRange,
  filterAdditionalStopwords,
  detectAndCleanApproxWords,
  applyPostProcessingFlags,
  processOptionalFlag,
  processToServeFlag,
  processToTasteFlag,
} from './utils/result-helpers';

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
  const toTasteWords = langMap.toTaste || [];
  const toTasteAdditionalWords = langMap.toTasteAdditional || [];
  const instructionWords = langMap.instructions || [];
  const adverbWords = langMap.adverbs || [];
  const additionalStopwords = (langMap.additionalStopwords || []).map(word =>
    (word || '').trim().toLowerCase(),
  );
  let forceUnitNull = false;

  // ==========================================================================
  // SECTION 1: INITIALIZATION
  // ==========================================================================
  // Working copies of the input string that will be progressively transformed
  let originalString = ingredientString.trim();
  let ingredientLine = originalString;

  // ==========================================================================
  // SECTION 2: TEXT NORMALIZATION - Remove markers, extract parentheticals
  // ==========================================================================
  // Remove leading optional markers, list markers, written numbers with cans,
  // parenthetical segments, comma-separated extras, and process alternatives

  // 1) Remove optional label
  const {line: lineAfterOptional, hadOptionalLabel} = removeOptionalLabel(ingredientLine);
  ingredientLine = lineAfterOptional;
  originalString = ingredientLine;

  // 2) Remove list markers
  ingredientLine = removeListMarkers(ingredientLine);
  originalString = ingredientLine;

  // 3) Initialize additional parts tracking
  let additionalParts = [];
  let containerSizeText = null;

  // 4) Normalize word number + cans (e.g., "Three 15-ounce cans")
  const {line: lineAfterCans, additionalParts: canParts, hadWordNumberCan} =
    normalizeWordNumberCans(ingredientLine, language);
  ingredientLine = lineAfterCans;
  if (canParts.length) additionalParts.push(...canParts);
  if (hadWordNumberCan) originalString = ingredientLine;

  // 5) Remove parenthetical segments (stored in additional parts)
  const {cleaned, segments} = extractParentheticalSegments(ingredientLine);
  if (segments.length) additionalParts.push(...segments);
  ingredientLine = cleaned;

  // 6) Extract comma-separated additional content
  const {line: lineAfterCommas, additionalParts: commaParts} = extractCommaAdditional(ingredientLine);
  ingredientLine = lineAfterCommas;
  if (commaParts.length) additionalParts.push(...commaParts);

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

  // ==========================================================================
  // SECTION 3: FLAG DETECTION & QUANTITY EXTRACTION
  // ==========================================================================
  // Detect flags (approx, optional, to serve, to taste) and extract quantity
  // and multiplier from the ingredient line
  /* restOfIngredient represents rest of ingredient line.
  For example: "1 pinch salt" --> quantity: 1, restOfIngredient: pinch salt */
  let approx = false;
  let toTaste = false;
  const {
    approxRegex,
    optionalRegex,
    toServeRegex,
    toTasteRegex,
    toTasteAdditionalRegex,
  } = buildFlagRegexes({
    approxWords,
    optionalWords,
    toServeWords,
    toTasteWords,
    toTasteAdditionalWords,
  });

  // Detect approx flag on ingredient line
  const approxResult1 = detectApproxFlag(ingredientLine, approx, approxRegex);
  approx = approxResult1.approx;
  ingredientLine = approxResult1.line;

  // Normalize ampersand-separated mixed numbers and stray fraction separators
  ingredientLine = normalizeAmpersandFractions(ingredientLine);
  ingredientLine = normalizeStrayFractionSeparators(ingredientLine);

  // Detect optional flag on original string and ingredient line
  let optional = hadOptionalLabel || false;
  if (safeTest(optionalRegex, originalString)) {
    optional = true;
  }
  const optionalResult1 = detectOptionalFlag(ingredientLine, optional, optionalRegex);
  optional = optionalResult1.optional;
  ingredientLine = optionalResult1.line;

  // Detect toServe flag on original string and ingredient line
  let toServe = false;
  if (safeTest(toServeRegex, originalString)) {
    toServe = true;
  }
  const toServeResult1 = detectToServeFlag(ingredientLine, toServe, toServeRegex);
  toServe = toServeResult1.toServe;
  ingredientLine = toServeResult1.line;

  // Detect toTaste flag on original string and ingredient line
  if (safeTest(toTasteRegex, originalString)) {
    toTaste = true;
  }
  const toTasteResult1 = detectToTasteFlag(ingredientLine, toTaste, toTasteRegex);
  toTaste = toTasteResult1.toTaste;
  ingredientLine = toTasteResult1.line;

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

  // Detect flags on restOfIngredient (second pass after quantity extraction)
  const approxResult2 = detectApproxFlag(restOfIngredient, approx, approxRegex);
  approx = approxResult2.approx;
  restOfIngredient = approxResult2.line;

  const optionalResult2 = detectOptionalFlag(restOfIngredient, optional, optionalRegex);
  optional = optionalResult2.optional;
  restOfIngredient = optionalResult2.line;

  const toServeResult2 = detectToServeFlag(restOfIngredient, toServe, toServeRegex);
  toServe = toServeResult2.toServe;
  restOfIngredient = toServeResult2.line;

  const toTasteResult2 = detectToTasteFlag(restOfIngredient, toTaste, toTasteRegex);
  toTaste = toTasteResult2.toTaste;
  restOfIngredient = toTasteResult2.line;

  if (toTaste && !resultQuantityCaptured(quantity)) {
    forceUnitNull = true;
  }

  // ==========================================================================
  // SECTION 4: UNIT DETECTION & SIZE DESCRIPTORS
  // ==========================================================================
  // Handle slash-separated units, normalize dashes, extract size descriptors
  // (inch, container sizes), and detect the primary unit

  // 1) Process slash-separated alternative units (e.g., "cup/150 grams sugar")
  const slashResult = processSlashSeparatedAlternativeUnit(
    restOfIngredient,
    includeAlternatives,
    alternatives,
    language,
    includeUnitSystems,
  );
  restOfIngredient = slashResult.restOfIngredient;

  // 2) Normalize stray leading dashes (e.g., "14-oz" -> "oz")
  restOfIngredient = removeLeadingDashes(restOfIngredient);

  // 3) Extract leading size descriptors like "3-inch" (e.g., "1 3-inch stick")
  const inchResult = extractInchSizeDescriptor(restOfIngredient, additionalParts);
  restOfIngredient = inchResult.text;
  additionalParts = inchResult.additionalParts;

  // 4) Handle implicit inch descriptors (e.g., "inch piece ginger")
  const implicitInchResult = handleImplicitInchDescriptor(restOfIngredient, additionalParts);
  restOfIngredient = implicitInchResult.text;
  additionalParts = implicitInchResult.additionalParts;

  // 5) Extract container sizes that precede container units (e.g., "15-ounce cans")
  const containerResult = extractContainerSize(restOfIngredient);
  restOfIngredient = containerResult.text;
  containerSizeText = containerResult.containerSizeText;

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

  // ==========================================================================
  // SECTION 5: UNIT RESOLUTION & PREPOSITION HANDLING
  // ==========================================================================
  // Prefer container units over weight/volume when appropriate, remove
  // prepositions, handle inch+piece special case

  // 1) Prefer container units (can/pack/bag) when a size descriptor precedes them
  const containerUnitResult = preferContainerUnits(
    unit,
    restBeforeUnit,
    quantity,
    language,
    hadWordNumberCan,
  );
  if (containerUnitResult.unitPlural !== null) {
    unit = containerUnitResult.unit;
    unitPlural = containerUnitResult.unitPlural;
    symbol = containerUnitResult.symbol;
  }

  // 2) Remove prepositions from ingredient text
  const preposition = getPreposition(ingredient.split(' ')[0], language);
  if (preposition) {
    const regex = new RegExp('^' + preposition);
    ingredient = ingredient.replace(regex, '').trim();
  }

  // 3) Handle inch+piece special case
  const inchPieceResult = handleInchPieceConversion(
    unit,
    restBeforeUnit,
    ingredient,
    additionalParts,
    language,
  );
  if (inchPieceResult.unitPlural !== null) {
    unit = inchPieceResult.unit;
    unitPlural = inchPieceResult.unitPlural;
    symbol = inchPieceResult.symbol;
    ingredient = inchPieceResult.ingredient;
    additionalParts = inchPieceResult.additionalParts;
  }

  // Drop leading articles like "a" / "an" that can survive after preposition stripping.
  ingredient = ingredient.replace(/^(?:a|an)\s+/i, '').trim();

  // ==========================================================================
  // SECTION 6: INGREDIENT TEXT CLEANUP & INSTRUCTION EXTRACTION
  // ==========================================================================
  // Split glued instruction words, extract instruction phrases, remove adverbs,
  // clean up size descriptors and filler qualifiers
  // Split glued instruction words (e.g., "tomatoeschopped" → "tomatoes chopped")
  const glueResult = splitGluedInstructions(ingredient, additionalParts, instructionWords);
  ingredient = glueResult.ingredient;
  additionalParts = glueResult.additionalParts;

  // Fallback to ingredient from alternatives if main ingredient is empty
  ingredient = fallbackIngredientFromAlternatives(ingredient, includeAlternatives, alternatives);

  // Move trailing dash-separated notes into additional (e.g., "cherries - stalks removed")
  const dashResult = extractDashSeparatedNotes(ingredient, additionalParts);
  ingredient = dashResult.ingredient;
  additionalParts = dashResult.additionalParts;

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

  // Remove standalone adverbs and add them to instructions
  const adverbResult = removeStandaloneAdverbs(ingredient, additionalParts, adverbWords, instructionsFound);
  ingredient = adverbResult.ingredient;
  additionalParts = adverbResult.additionalParts;

  // Final cleanups on ingredient text for common trailing markers.
  if (ingredient) {
    // Strip lingering optional markers.
    ingredient = safeReplace(ingredient, optionalRegex).trim();

    // Fix missing spaces after common size adjectives that get glued when units are stripped.
    ingredient = fixSizeAdjectiveSpacing(ingredient);

    // Remove filler qualifiers that pollute the ingredient.
    ingredient = removeFillerQualifiers(ingredient);

    // Move leading size descriptors like "1-inch" into additional.
    const sizeResult = extractLeadingSizeDescriptor(ingredient, additionalParts);
    ingredient = sizeResult.ingredient;
    additionalParts = sizeResult.additionalParts;

    // Strip leading instruction/state terms we already captured.
    ingredient = stripLeadingInstructions(ingredient, instructionsFound);

    // If size adjectives remain leading, treat them as instructions to keep the ingredient clean (unless hyphenated descriptor).
    ingredient = processLeadingSizeAdjectives(ingredient, instructionsFound);

    // Demote leading leftover unit tokens to additional notes
    const demoteResult = demoteLeftoverUnits(ingredient, unit, additionalParts, language);
    ingredient = demoteResult.ingredient;
    additionalParts = demoteResult.additionalParts;

    // Drop any leading adverb that survived instruction extraction
    ingredient = removeLeadingAdverbs(ingredient, adverbWords);

    // Clean toTaste-related text
    const toTasteResult = cleanToTasteText(ingredient, additionalParts, toTaste, toTasteAdditionalRegex, safeReplace);
    ingredient = toTasteResult.ingredient;
    additionalParts = toTasteResult.additionalParts;

    // Strip leading numeric tokens if quantity already captured
    ingredient = stripLeadingNumericTokens(ingredient, quantity, language, resultQuantityCaptured);

    // Prepend container size for pack-style units
    ingredient = prependPackSize(ingredient, unit, containerSizeText, originalString);

    // Remove can/tin prefixes
    ingredient = removeCanPrefix(ingredient, unit);

    // Drop leading/trailing conjunctions and prepositions
    ingredient = removeConjunctionsAndPrepositions(ingredient);
  }

  // ==========================================================================
  // SECTION 7: INGREDIENT PROMOTION & LEADING FRACTION HANDLING
  // ==========================================================================
  // Promote additional parts to ingredient if empty, handle leading fractions,
  // final cleanups on ingredient text
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

  // ==========================================================================
  // SECTION 8: RANGE QUANTITY RESOLUTION & ALTERNATIVE PROCESSING
  // ==========================================================================
  // Resolve quantity ranges (min/max), process "or" alternatives (both
  // fully-specified and simple ingredient swaps)
  // Initialize range bounds up-front so downstream alternative handling can reuse them.
  let {
    quantity: rangeQuantity,
    minQty,
    maxQty,
  } = resolveRangeQuantities(quantity, originalString, language);
  quantity = rangeQuantity;

  // Process "or" alternatives (e.g., "1 cup flour or 2 cups sugar")
  const orResult = processOrAlternatives(
    ingredient,
    includeAlternatives,
    alternatives,
    language,
    includeUnitSystems,
    parse,
  );
  ingredient = orResult.ingredient;

  // 7) if quantity is non-nil and is a range, for ex: "1-2", we want to get minQty and maxQty
  if (quantity && (quantity.includes('-') || quantity.includes('–'))) {
    [minQty, maxQty] = quantity.split(/-|–/);
    quantity = minQty;
  }

  // ==========================================================================
  // SECTION 9: RESULT OBJECT ASSEMBLY
  // ==========================================================================
  // Build the main result object, apply multipliers, set unit systems, handle
  // flags (approx, optional, toServe, toTaste)
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

  // ==========================================================================
  // SECTION 10: POST-PROCESSING & EDGE CASES
  // ==========================================================================
  // Handle special patterns: weight ranges with counts, stopword filtering,
  // approx/optional/toServe/toTaste flag cleanup, alternatives cleanup

  // Handle leading weight/size range after initial count (e.g., "1 3-4 lb whole chicken")
  handleLeadingWeightSizeRange(result, originalUnit, restBeforeUnit, includeUnitSystems);

  // Filter additional parts by stopwords
  filterAdditionalStopwords(result, additionalStopwords);

  // Detect and clean approx words from ingredient/additional
  const approxResult = detectAndCleanApproxWords(result, approx, approxWords);
  approx = approxResult.approx;

  // Apply post-processing flags (approx, toTaste unit nulling)
  applyPostProcessingFlags(result, approx, toTaste, forceUnitNull, includeUnitSystems);

  // Process optional, toServe, toTaste flags and clean additional
  processOptionalFlag(result, optional, optionalRegex);
  processToServeFlag(result, toServe, toServeRegex);
  processToTasteFlag(result, toTaste, toTasteRegex, toTasteAdditionalRegex);

  // Second stopwords filter (after flag processing)
  filterAdditionalStopwords(result, additionalStopwords);
  // ==========================================================================
  // SECTION 11: ALTERNATIVES CLEANUP & NORMALIZATION
  // ==========================================================================
  // Clean up alternatives: convert quantities, remove duplicates, handle fallback extraction
  if (includeAlternatives) {
    const cleanedAlts = cleanupAlternatives(
      alternatives,
      result,
      language,
      includeUnitSystems,
      includeAlternatives,
      originalString,
      parse,
      resultQuantityCaptured,
      convertToNumber,
    );
    if (cleanedAlts !== undefined) {
      result.alternatives = cleanedAlts;
    }
  }
  // ==========================================================================
  // SECTION 12: FINAL CLEANUPS & EDGE CASE HANDLING
  // ==========================================================================
  // Add instructions to result, clean up alternative quantity prefixes,
  // handle inch+piece special cases, weight ranges, unit fallback, ingredient
  // fallback from alternatives or slash-separated lists
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

  // Handle piece + inch size in original string
  handlePieceInchSize(result, unit, originalString);

  // Handle weight range patterns (e.g., "3-4 lb chicken")
  const weightRangeResult = handleWeightRange(result, originalString, restBeforeUnit, includeUnitSystems);
  forceUnitNull = forceUnitNull || weightRangeResult.forceUnitNull;

  // Handle count + range patterns (e.g., "1 3-4 lb chicken")
  handleCountPlusRange(result, originalString, includeUnitSystems);

  // Fallback: guess unit from original string if not detected
  fallbackUnitGuess(result, forceUnitNull, originalString, language, includeUnitSystems);

  // Fallback: guess ingredient from original string if not found
  fallbackIngredientGuess(result, originalString);

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

// Alias to avoid confusion with JSON.parse/HTML parsers.
export const ingredientParse = parse;

export const combine = combineIngredients;
export {getSymbol} from './utils/parser-helpers';
