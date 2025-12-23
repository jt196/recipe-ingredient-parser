/**
 * Build regexes for language-specific flags like approx/optional/to-serve.
 * Returns null when no words are provided to keep call sites simple.
 */
export function buildFlagRegexes({
  approxWords = [],
  optionalWords = [],
  toServeWords = [],
  toTasteWords = [],
  toTasteAdditionalWords = [],
}) {
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
          `(?:^|[\\s,(])\\s*(${optionalWords
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

  const toTasteRegex =
    toTasteWords.length > 0
      ? (() => {
          const escapedWords = toTasteWords.map(w =>
            w.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&'),
          );
          const abbrevParts = toTasteWords
            .map(w => (w.match(/\b(\w)/g) || []).join(''))
            .filter(Boolean)
            .map(letters => `${letters.split('').join('\\.?')}\\.?`);
          const parts = [...escapedWords, ...abbrevParts];
          const body = parts.length ? `(?:${parts.join('|')})` : '';
          return body
            ? new RegExp(`\\b(?:adjust\\s+to\\s+)?${body}\\b`, 'gi')
            : null;
        })()
      : null;

  const toTasteAdditionalRegex =
    toTasteAdditionalWords.length > 0
      ? new RegExp(
          `\\b(${toTasteAdditionalWords
            .map(w => w.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&'))
            .join('|')})\\b`,
          'gi',
        )
      : null;

  return {
    approxRegex,
    optionalRegex,
    toServeRegex,
    toTasteRegex,
    toTasteAdditionalRegex,
  };
}

/**
 * Regex-safe test that resets lastIndex for global patterns.
 */
export function safeTest(regex, text) {
  if (!regex || typeof text !== 'string') return false;
  regex.lastIndex = 0;
  return regex.test(text);
}

/**
 * Regex-safe replace that resets lastIndex for global patterns.
 */
export function safeReplace(text, regex) {
  if (!regex || typeof text !== 'string') return text;
  regex.lastIndex = 0;
  return text.replace(regex, '');
}
