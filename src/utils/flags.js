/**
 * Build regexes for language-specific flags like approx/optional/to-serve.
 * Returns null when no words are provided to keep call sites simple.
 */
export function buildFlagRegexes({
  approxWords = [],
  optionalWords = [],
  toServeWords = [],
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

  return {approxRegex, optionalRegex, toServeRegex};
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
