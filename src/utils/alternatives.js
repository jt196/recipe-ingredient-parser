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
