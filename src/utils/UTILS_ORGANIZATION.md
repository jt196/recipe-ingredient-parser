# Utils Folder Organization

This document describes the current organization of helper functions in the `utils/` directory after Phase 2 refactoring completion.

## Current File Structure

The utils files are organized by functional domain, aligning with the ingredient parsing pipeline:

```
src/utils/
├── normalize.js              (6 functions)  - Early text normalization
├── flags.js                  (7 functions)  - Flag detection helpers
├── parser-helpers.js         (22 functions) - Core parsing utilities
├── quantity.js               (3 functions)  - Quantity extraction
├── unit-helpers.js           (7 functions)  - Unit detection & sizing
├── alternatives.js           (4 functions)  - Alternative ingredients
├── result-helpers.js         (12 functions) - Post-processing
├── combine.js                (1 function)   - Ingredient combining
└── convert.js                (5 functions)  - Number/fraction conversion
```

**Total**: 9 files, 67 functions

## Parsing Pipeline Flow

```
Text Input
    ↓
normalize.js           → Remove markers, normalize text format
    ↓
parser-helpers.js      → Extract multipliers, parentheticals
    ↓
flags.js               → Detect special flags (approx, optional, etc.)
    ↓
quantity.js            → Extract quantities and multipliers
convert.js             → Convert fractions, handle numbers
    ↓
unit-helpers.js        → Detect units, handle sizes
    ↓
parser-helpers.js      → Clean ingredient text, extract instructions
    ↓
alternatives.js        → Process alternative ingredients
    ↓
result-helpers.js      → Final post-processing, edge cases
    ↓
combine.js             → Combine multiple ingredients
    ↓
Final Result
```

## File Descriptions

### 📝 normalize.js (6 functions) ✅ Well-organized
**Purpose**: Early-stage text cleaning and normalization

**Functions**:
- `removeOptionalLabel(line)` - Removes leading "Optional:" label
- `removeListMarkers(line)` - Removes leading list markers (-, •)
- `normalizeWordNumberCans(line, language)` - Handles "Three 15-ounce cans" → "3 cans"
- `extractCommaAdditional(line)` - Extracts comma-separated additional content
- `normalizeAmpersandFractions(line)` - Converts "1 & 1/2" → "1 1/2"
- `normalizeStrayFractionSeparators(line)` - Fixes malformed fraction separators

**When to use**: Beginning of parsing pipeline (SECTION 2), before quantity extraction

**Used in**: SECTION 2 (lines 86-113 in index.js)

---

### 🚩 flags.js (7 functions) ✅ Well-organized
**Purpose**: Detect and process special flags

**Functions**:
- `buildFlagRegexes({approxWords, optionalWords, ...})` - Build language-specific flag regexes
- `safeTest(regex, text)` - Regex-safe test with lastIndex reset
- `safeReplace(text, regex)` - Regex-safe replace with lastIndex reset
- `detectApproxFlag(line, currentFlag, regex)` - Detect approx keywords
- `detectOptionalFlag(line, currentFlag, regex)` - Detect optional keywords
- `detectToServeFlag(line, currentFlag, regex)` - Detect toServe keywords
- `detectToTasteFlag(line, currentFlag, regex)` - Detect toTaste keywords

**When to use**: Throughout parsing, particularly in SECTION 3 flag detection

**Used in**: SECTION 3 (lines 152-242 in index.js)

---

### 🔧 parser-helpers.js (22 functions) ⚠️ Large file
**Purpose**: Core parsing utilities - extraction, cleanup, and helper functions

**Functions** (grouped by category):

**Text Extraction** (2 functions):
- `extractMultiplier(line, language)` - Extracts multiplier words ("double", "triple")
- `extractParentheticalSegments(line)` - Extracts parenthetical content

**Unit Detection** (2 functions):
- `getUnit(text, language)` - Main unit detection function
- `getUnitSystem(unit, language)` - Returns unit system (metric/us/imperial)

**Number Conversion** (1 function):
- `convertToNumber(value, language)` - Converts quantities to numbers

**Instruction Extraction** (2 functions):
- `extractInstructions(ingredient, additionalParts, instructionWords, adverbWords)` - Extracts instructions (with proper word boundaries for "lukewarm", "warm", "unsalted", etc.)
- `getPreposition(word, language)` - Gets preposition from language map

**Ingredient Cleanup** (16 functions):
- `fixSizeAdjectiveSpacing(ingredient)` - Fixes glued size adjectives
- `removeFillerQualifiers(ingredient)` - Removes filler words
- `extractLeadingSizeDescriptor(ingredient, additionalParts)` - Extracts "1-inch" descriptors
- `stripLeadingInstructions(ingredient, instructionsFound)` - Removes captured instructions
- `processLeadingSizeAdjectives(ingredient, instructionsFound)` - Handles size adjectives
- `splitGluedInstructions(ingredient, additionalParts, instructionWords)` - Splits glued words
- `fallbackIngredientFromAlternatives(ingredient, includeAlternatives, alternatives)` - Fallback extraction
- `extractDashSeparatedNotes(ingredient, additionalParts)` - Moves dash notes to additional
- `removeStandaloneAdverbs(ingredient, additionalParts, adverbWords, instructionsFound)` - Removes adverbs
- `demoteLeftoverUnits(ingredient, unit, additionalParts, language)` - Demotes leftover units
- `removeLeadingAdverbs(ingredient, adverbWords)` - Removes leading adverbs
- `stripLeadingNumericTokens(ingredient, quantity, language, resultQuantityCaptured)` - Strips numbers
- `prependPackSize(ingredient, unit, containerSizeText, originalString)` - Prepends container size
- `removeCanPrefix(ingredient, unit)` - Removes "can"/"tin" prefixes
- `removeConjunctionsAndPrepositions(ingredient)` - Removes conjunctions
- `cleanToTasteText(ingredient, additionalParts, toTaste, toTasteAdditionalRegex, safeReplace)` - Cleans toTaste text

**Symbol Helper** (1 function):
- `getSymbol(unit, language)` - Gets unit symbol

**When to use**: Throughout parsing, especially SECTIONS 2, 6, and utility needs

**Used in**: Multiple sections (2, 3, 6, 7, 9, 12)

---

### 🔢 quantity.js (3 functions) ✅ Well-organized
**Purpose**: Extract quantities, handle numbers, fractions, ranges

**Functions**:
- `resultQuantityCaptured(qty)` - Checks if quantity is meaningful
- `getUnitAndRemainder(restOfIngredient, language)` - Extracts unit and remaining text
- `resolveRangeQuantities(quantity, originalString, language)` - Resolves quantity ranges

**When to use**: After text normalization (SECTION 3), before unit detection

**Used in**: SECTIONS 3, 4, 8 (lines 244, 284-290, 710-714 in index.js)

---

### 📏 unit-helpers.js (7 functions) ✅ Well-organized
**Purpose**: Detect units, handle size descriptors, container units

**Functions**:
- `processSlashSeparatedAlternativeUnit(restOfIngredient, ...)` - Handles "cup/150 grams sugar"
- `removeLeadingDashes(text)` - Normalizes "14-oz" → "oz"
- `extractInchSizeDescriptor(text, additionalParts)` - Extracts "3-inch" size descriptors
- `handleImplicitInchDescriptor(text, additionalParts)` - Handles "inch piece ginger"
- `extractContainerSize(text)` - Extracts "15-ounce" from "15-ounce cans"
- `preferContainerUnits(unit, restBeforeUnit, quantity, language, hadWordNumberCan)` - Prefers 'can' over 'ounce'
- `handleInchPieceConversion(unit, restBeforeUnit, ingredient, additionalParts, language)` - Converts "inch" → "piece"

**When to use**: After quantity extraction (SECTIONS 4, 5), before ingredient cleanup

**Used in**: SECTIONS 4, 5 (lines 255-337 in index.js)

---

### 🔄 alternatives.js (4 functions) ✅ Well-organized
**Purpose**: Process alternative ingredients and "or" patterns

**Functions**:
- `processAlternatives({ingredientLine, additionalParts, ...})` - Main alternative processing
- `processOrAlternatives(ingredient, includeAlternatives, alternatives, ...)` - Handles "1 cup flour or 2 cups sugar"
- `cleanupAlternatives(alternatives, result, ...)` - Normalizes alternative entries
- `handleFallbackAlternatives(alternatives, result, ...)` - Extracts fallback alternatives

**When to use**: After initial parsing (SECTIONS 2, 8, 11), when "or" or "/" separators detected

**Used in**: SECTIONS 2, 8, 11 (lines 115-140, 718-726, 850-864 in index.js)

---

### ✨ result-helpers.js (12 functions) ✅ Well-organized
**Purpose**: Final result assembly, edge case handling, post-processing

**Functions**:
- `handlePieceInchSize(result, unit, originalString)` - Adds inch size to additional for pieces
- `handleWeightRange(result, originalString, restBeforeUnit, includeUnitSystems)` - Handles "3-4 lb chicken"
- `handleCountPlusRange(result, originalString, includeUnitSystems)` - Handles "1 3-4 lb chicken"
- `handleLeadingWeightSizeRange(result, originalUnit, restBeforeUnit, includeUnitSystems)` - Handles leading ranges
- `fallbackUnitGuess(result, forceUnitNull, originalString, language, includeUnitSystems)` - Guesses unit
- `fallbackIngredientGuess(result, originalString)` - Guesses ingredient
- `filterAdditionalStopwords(result, additionalStopwords)` - Filters stopwords
- `detectAndCleanApproxWords(result, approx, approxWords)` - Detects approx words
- `applyPostProcessingFlags(result, approx, toTaste, forceUnitNull, includeUnitSystems)` - Applies flags
- `processOptionalFlag(result, optional, optionalRegex)` - Processes optional flag
- `processToServeFlag(result, toServe, toServeRegex)` - Processes toServe flag
- `processToTasteFlag(result, toTaste, toTasteRegex, toTasteAdditionalRegex)` - Processes toTaste flag

**When to use**: Final stages of parsing (SECTIONS 10, 12)

**Used in**: SECTIONS 10, 12 (lines 826-841, 1078-1091 in index.js)

---

### 🔗 combine.js (1 function) ✅ Well-organized
**Purpose**: Combine multiple parsed ingredients

**Functions**:
- `combine(ingredientArray)` - Combines array of parsed ingredients

**When to use**: When parsing multiple ingredient lines together

**Exported as**: `combine` in index.js (line 1208)

---

### 🔢 convert.js (5 functions) ✅ Well-organized
**Purpose**: Number and fraction conversion utilities

**Functions**:
- `convertFromFraction(value, language)` - Converts fractional strings to decimals
- `getFirstMatch(line, regex)` - Returns first regex match
- `text2num(s, language)` - Converts spelled-out numbers to numeric
- `feach(w, g, n, language)` - Helper for text2num
- `findQuantityAndConvertIfUnicode(ingredientLine, language)` - Extracts and converts quantities

**When to use**: Throughout parsing, particularly in quantity extraction

**Used in**: SECTION 3, quantity.js, parser-helpers.js, normalize.js

---

## Function Index by Category

### Text Cleaning & Normalization (8 functions)
- `removeOptionalLabel()` - normalize.js
- `removeListMarkers()` - normalize.js
- `normalizeWordNumberCans()` - normalize.js
- `normalizeAmpersandFractions()` - normalize.js
- `normalizeStrayFractionSeparators()` - normalize.js
- `extractCommaAdditional()` - normalize.js
- `extractMultiplier()` - parser-helpers.js
- `extractParentheticalSegments()` - parser-helpers.js

### Quantity & Number Handling (9 functions)
- `resultQuantityCaptured()` - quantity.js
- `getUnitAndRemainder()` - quantity.js
- `resolveRangeQuantities()` - quantity.js
- `convertToNumber()` - parser-helpers.js
- `convertFromFraction()` - convert.js
- `findQuantityAndConvertIfUnicode()` - convert.js
- `text2num()` - convert.js
- `feach()` - convert.js
- `getFirstMatch()` - convert.js

### Unit Detection & Processing (9 functions)
- `getUnit()` - parser-helpers.js
- `getUnitSystem()` - parser-helpers.js
- `getSymbol()` - parser-helpers.js
- `processSlashSeparatedAlternativeUnit()` - unit-helpers.js
- `removeLeadingDashes()` - unit-helpers.js
- `extractInchSizeDescriptor()` - unit-helpers.js
- `handleImplicitInchDescriptor()` - unit-helpers.js
- `extractContainerSize()` - unit-helpers.js
- `preferContainerUnits()` - unit-helpers.js
- `handleInchPieceConversion()` - unit-helpers.js

### Ingredient Text Cleanup (19 functions)
All in parser-helpers.js:
- `fixSizeAdjectiveSpacing()`
- `removeFillerQualifiers()`
- `extractLeadingSizeDescriptor()`
- `stripLeadingInstructions()`
- `processLeadingSizeAdjectives()`
- `splitGluedInstructions()`
- `fallbackIngredientFromAlternatives()`
- `extractDashSeparatedNotes()`
- `removeStandaloneAdverbs()`
- `demoteLeftoverUnits()`
- `removeLeadingAdverbs()`
- `stripLeadingNumericTokens()`
- `prependPackSize()`
- `removeCanPrefix()`
- `removeConjunctionsAndPrepositions()`
- `cleanToTasteText()`

### Instruction Extraction (2 functions)
- `extractInstructions()` - parser-helpers.js
- `getPreposition()` - parser-helpers.js

### Flag Detection (7 functions)
All in flags.js:
- `buildFlagRegexes()`
- `safeTest()`
- `safeReplace()`
- `detectApproxFlag()`
- `detectOptionalFlag()`
- `detectToServeFlag()`
- `detectToTasteFlag()`

### Alternative Ingredients (4 functions)
All in alternatives.js:
- `processAlternatives()`
- `processOrAlternatives()`
- `cleanupAlternatives()`
- `handleFallbackAlternatives()`

### Result Post-Processing (12 functions)
All in result-helpers.js:
- `handlePieceInchSize()`
- `handleWeightRange()`
- `handleCountPlusRange()`
- `handleLeadingWeightSizeRange()`
- `fallbackUnitGuess()`
- `fallbackIngredientGuess()`
- `filterAdditionalStopwords()`
- `detectAndCleanApproxWords()`
- `applyPostProcessingFlags()`
- `processOptionalFlag()`
- `processToServeFlag()`
- `processToTasteFlag()`

### Combining Results (1 function)
- `combine()` - combine.js

## Quick Reference: "I need to..."

### "I need to normalize text before parsing"
→ [normalize.js](normalize.js) - 6 functions for early text cleanup

### "I need to extract a quantity or number"
→ [quantity.js](quantity.js) - 3 functions for quantity extraction
→ [convert.js](convert.js) - 5 functions for number/fraction conversion

### "I need to detect a unit"
→ [unit-helpers.js](unit-helpers.js) - 7 functions for unit detection
→ [parser-helpers.js](parser-helpers.js) - `getUnit()`, `getUnitSystem()`, `getSymbol()`

### "I need to clean up ingredient text"
→ [parser-helpers.js](parser-helpers.js) - 19 ingredient cleanup functions

### "I need to detect a flag (approx, optional, etc.)"
→ [flags.js](flags.js) - 7 functions for flag detection

### "I need to handle alternative ingredients"
→ [alternatives.js](alternatives.js) - 4 functions for alternatives

### "I need to post-process a result or handle edge cases"
→ [result-helpers.js](result-helpers.js) - 12 post-processing functions

### "I need to combine multiple ingredients"
→ [combine.js](combine.js) - 1 function for combining

## File Size Analysis

| File | Functions | Notes |
|------|-----------|-------|
| normalize.js | 6 | ✅ Well-sized, focused |
| flags.js | 7 | ✅ Well-sized, focused |
| quantity.js | 3 | ✅ Well-sized, focused |
| unit-helpers.js | 7 | ✅ Well-sized, focused |
| alternatives.js | 4 | ✅ Well-sized, focused |
| result-helpers.js | 12 | ✅ Well-sized, focused |
| combine.js | 1 | ✅ Single purpose |
| convert.js | 5 | ✅ Well-sized, focused |
| **parser-helpers.js** | **22** | ⚠️ **Large, mixed responsibilities** |

## Notes on parser-helpers.js

While `parser-helpers.js` is large with 22 functions, it's been significantly improved from the original:
- **Before Phase 2**: Contained many more functions with unclear organization
- **After Phase 2**: Reduced by extracting specialized functions to dedicated files
- **Current state**: Contains core parsing utilities that are interdependent and difficult to split further

**Key dependencies** preventing further splitting:
- `extractMultiplier()` depends on `convertToNumber()` and `getUnit()`
- Many ingredient cleanup functions depend on core helpers
- Circular dependency risks if split too aggressively

## Contributing Guidelines

When adding new helper functions:

1. **Identify the stage**: Where in the parsing pipeline does this function operate?
2. **Choose the appropriate file**:
   - Early text cleaning → normalize.js
   - Flag detection → flags.js
   - Quantity extraction → quantity.js
   - Number conversion → convert.js
   - Unit detection → unit-helpers.js
   - Ingredient cleanup → parser-helpers.js
   - Alternative handling → alternatives.js
   - Final post-processing → result-helpers.js
   - Combining ingredients → combine.js

3. **Document thoroughly**: Add JSDoc comments with clear descriptions, parameters, examples
4. **Test comprehensively**: All 466 tests must pass after adding new functions
5. **Update this doc**: Add your function to the relevant section

## Refactoring History

- **Phase 1**: Added 12 section markers to main parse() function (1154 lines)
- **Phase 2**: Extracted 485 lines from parse() into helpers
  - Created normalize.js (6 functions)
  - Created unit-helpers.js (7 functions)
  - Created result-helpers.js (12 functions)
  - Extended flags.js (4 functions)
  - Extended alternatives.js (4 functions)
  - Extended parser-helpers.js (22 functions)
- **Result**: Main parse() reduced from 1224 lines to 739 lines (~40% reduction)
- **Tests**: All 466 tests passing throughout refactoring
- **Phase 2 Cleanup**: Removed redundant workaround functions after verifying `extractInstructions()` properly handles word boundaries:
  - Removed `ensureLukewarmInstruction()` - "lukewarm" now detected correctly by word boundary matching
  - Removed `cleanLukeTruncations()` - no longer creates "luke" truncations with proper word boundaries
  - Removed `handleUnsaltedPrefix()` - "unsalted" now detected correctly (not split into "un" + "salted")

## Future Considerations

### Potential Further Refactoring

If parser-helpers.js continues to grow, consider:

1. **Split by sub-domain**:
   - `text-extraction.js` - extractMultiplier, extractParentheticalSegments
   - `ingredient-cleanup.js` - All 16 cleanup functions
   - `core-helpers.js` - getUnit, getUnitSystem, convertToNumber, getSymbol

2. **Address circular dependencies** by:
   - Passing dependencies as parameters (dependency injection)
   - Creating a shared `core.js` with minimal cross-cutting concerns

3. **Only proceed if**:
   - parser-helpers.js exceeds 30+ functions
   - Clear logical groupings emerge
   - Team agrees benefits outweigh reorganization cost

## Questions?

When in doubt:
- **Check the pipeline diagram** at the top - it shows the natural flow
- **Look at existing patterns** - where do similar functions live?
- **Consider dependencies** - will this create circular imports?
- **Favor clarity** - sometimes one larger file is clearer than many tiny ones
