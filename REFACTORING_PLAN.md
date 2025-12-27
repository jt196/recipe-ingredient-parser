# Parse Function Refactoring Plan

## Current State
- **Function length**: 1154 lines (too long!)
- **Complexity**: High - many nested conditions and sequential transformations
- **Maintainability**: Difficult to understand flow and modify safely

## Proposed Refactoring Strategy

### Phase 1: Add Section Markers (Immediate - Low Risk)
Add clear section comments with visual separators to make navigation easier:

```javascript
// ============================================================================
// SECTION 1: INPUT VALIDATION & SETUP
// ============================================================================

// ============================================================================
// SECTION 2: TEXT NORMALIZATION
// ============================================================================
```

**Benefit**: Immediate improvement in code navigability
**Risk**: None - just comments
**Effort**: 30 minutes

### Phase 2: Extract Helper Functions (Incremental - Medium Risk)
Move logical sections into separate functions in existing helper files:

#### 2a. Extract to `src/utils/normalize.js` (NEW FILE)
```javascript
export function normalizeLeadingMarkers(text, langMap)
export function normalizeWrittenNumbers(text, langMap)
export function normalizeFractions(text)
export function extractParentheticalContent(text) // Already exists, might enhance
```

#### 2b. Extract to `src/utils/quantity.js` (EXISTS - extend it)
```javascript
export function extractPrimaryQuantity(text, langMap)
export function resolveQuantityRanges(qty, minQty, maxQty)
// Already has: resultQuantityCaptured, getUnitAndRemainder, resolveRangeQuantities
```

#### 2c. Extract to `src/utils/ingredient-text.js` (NEW FILE)
```javascript
export function cleanIngredientText(text, instructionsFound, additionalStopwords)
export function splitGluedInstructions(text, instructionWords) // Already done in main!
export function promoteLeftoversToIngredient(ingredient, additionalParts)
```

#### 2d. Extract to `src/utils/unit-detection.js` (NEW FILE)
```javascript
export function detectUnit(text, langMap)
export function handleSizeDescriptors(text)
export function preferContainerUnits(unit, context)
```

### Phase 3: Simplify Main Parse Flow (Final - Higher Risk)
After extracting helpers, the main `parse()` function should look like:

```javascript
export function parse(ingredientString, language, options = {}) {
  // 1. Validate & setup
  const state = initializeParsingState(ingredientString, language, options);
  if (!state.isValid) return state.emptyResult;

  // 2. Normalize text
  state.text = normalizeLeadingMarkers(state.text, state.langMap);
  state.text = normalizeFractions(state.text);
  const {text, parentheticals} = extractParentheticalContent(state.text);
  state.text = text;
  state.additionalParts = parentheticals;

  // 3. Extract quantity & multiplier
  const {quantity, multiplier, remainingText} = extractPrimaryQuantity(state.text, state.langMap);
  state.quantity = quantity;
  state.multiplier = multiplier;
  state.text = remainingText;

  // 4. Detect unit
  const unitInfo = detectUnit(state.text, state.langMap);
  state.unit = unitInfo.unit;
  state.unitPlural = unitInfo.unitPlural;
  state.symbol = unitInfo.symbol;
  state.text = unitInfo.remainingText;

  // 5. Clean ingredient text
  state.ingredient = cleanIngredientText(state.text, state.instructionsFound);

  // 6. Process alternatives (if requested)
  if (options.includeAlternatives) {
    state.alternatives = processAlternatives(state);
  }

  // 7. Build & return result
  return buildFinalResult(state, options);
}
```

**Benefit**: Dramatic improvement in readability and maintainability
**Risk**: Medium-High - requires careful testing
**Effort**: Multiple days

## Recommended Approach

### Option A: Conservative (Recommended)
1. ✅ **Phase 1 COMPLETED** - Added 12 major section markers throughout parse() function
2. 🔄 **Phase 2a-2d incrementally** - Extract one section at a time, test after each
3. ⏸️ **Evaluate Phase 3** - Only if team wants major refactor

## Phase 1 Completion Summary

Added comprehensive section markers to the 1154-line parse() function:

1. **SECTION 1: INITIALIZATION** (Lines 72-77)
   - Working copies of input string setup

2. **SECTION 2: TEXT NORMALIZATION** (Lines 79-142)
   - Remove markers, extract parentheticals, process alternatives

3. **SECTION 3: FLAG DETECTION & QUANTITY EXTRACTION** (Lines 144-256)
   - Detect flags (approx, optional, to serve, to taste)
   - Extract quantity and multiplier

4. **SECTION 4: UNIT DETECTION & SIZE DESCRIPTORS** (Lines 258-322)
   - Handle slash-separated units, size descriptors (inch, container sizes)
   - Detect primary unit

5. **SECTION 5: UNIT RESOLUTION & PREPOSITION HANDLING** (Lines 387-414)
   - Prefer container units over weight/volume when appropriate
   - Remove prepositions, handle inch+piece special case

6. **SECTION 6: INGREDIENT TEXT CLEANUP & INSTRUCTION EXTRACTION** (Lines 416-677)
   - Split glued instruction words
   - Extract instruction phrases, remove adverbs
   - Clean up size descriptors and filler qualifiers

7. **SECTION 7: INGREDIENT PROMOTION & LEADING FRACTION HANDLING** (Lines 680-729)
   - Promote additional parts to ingredient if empty
   - Handle leading fractions, final ingredient text cleanups

8. **SECTION 8: RANGE QUANTITY RESOLUTION & ALTERNATIVE PROCESSING** (Lines 731-807)
   - Resolve quantity ranges (min/max)
   - Process "or" alternatives (both fully-specified and simple ingredient swaps)

9. **SECTION 9: RESULT OBJECT ASSEMBLY** (Lines 809-854)
   - Build main result object
   - Apply multipliers, set unit systems, handle flags

10. **SECTION 10: POST-PROCESSING & EDGE CASES** (Lines 856-971)
    - Handle special patterns: weight ranges with counts
    - Stopword filtering, flag cleanup

11. **SECTION 11: ALTERNATIVES CLEANUP & NORMALIZATION** (Lines 972-1094)
    - Clean up alternative entries: convert quantities, remove duplicates
    - Handle fallback extraction from "or" and slash separators

12. **SECTION 12: FINAL CLEANUPS & EDGE CASE HANDLING** (Lines 1095-1250)
    - Add instructions to result
    - Clean up alternative quantity prefixes
    - Handle inch+piece special cases, weight ranges, unit/ingredient fallbacks

**Result**: All 466 tests passing. Code is now much more navigable and ready for Phase 2 extraction work.

### Option B: Aggressive
1. Do all phases at once
2. Higher risk of breaking tests
3. Requires extensive testing

## Immediate Next Steps

1. Add comprehensive section markers (Phase 1)
2. Identify 2-3 easy extraction candidates that:
   - Have clear inputs/outputs
   - Are already somewhat isolated
   - Have good test coverage
3. Extract those candidates one at a time
4. Run full test suite after each extraction

## Notes
- Keep all existing tests passing
- Don't change behavior, only structure
- Add JSDoc comments to new functions
- Consider adding unit tests for new helper functions
