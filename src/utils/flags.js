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
          return body ? new RegExp(`\\b${body}\\b`, 'gi') : null;
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

/**
 * Detects and removes approx flag from ingredient line.
 * Returns updated flag and cleaned line.
 *
 * @param {string} line - The ingredient line to check
 * @param {boolean} currentFlag - Current approx flag value
 * @param {RegExp|null} approxRegex - Regex for approx keywords
 * @returns {{approx: boolean, line: string}} - Updated flag and line
 */
export function detectApproxFlag(line, currentFlag, approxRegex) {
  if (!approxRegex) {
    return {approx: currentFlag, line};
  }

  const match = line.match(approxRegex);
  if (match) {
    return {
      approx: true,
      line: line.replace(match[0], '').trim(),
    };
  }

  return {approx: currentFlag, line};
}

/**
 * Detects and removes optional flag from ingredient line.
 * Returns updated flag and cleaned line.
 *
 * @param {string} line - The ingredient line to check
 * @param {boolean} currentFlag - Current optional flag value
 * @param {RegExp|null} optionalRegex - Regex for optional keywords
 * @returns {{optional: boolean, line: string}} - Updated flag and line
 */
export function detectOptionalFlag(line, currentFlag, optionalRegex) {
  if (safeTest(optionalRegex, line)) {
    return {
      optional: true,
      line: safeReplace(line, optionalRegex).trim(),
    };
  }
  return {optional: currentFlag, line};
}

/**
 * Detects and removes toServe flag from ingredient line.
 * Returns updated flag and cleaned line.
 *
 * @param {string} line - The ingredient line to check
 * @param {boolean} currentFlag - Current toServe flag value
 * @param {RegExp|null} toServeRegex - Regex for toServe keywords
 * @returns {{toServe: boolean, line: string}} - Updated flag and line
 */
export function detectToServeFlag(line, currentFlag, toServeRegex) {
  if (safeTest(toServeRegex, line)) {
    return {
      toServe: true,
      line: safeReplace(line, toServeRegex).trim(),
    };
  }
  return {toServe: currentFlag, line};
}

/**
 * Detects and removes toTaste flag from ingredient line.
 * Returns updated flag and cleaned line.
 *
 * @param {string} line - The ingredient line to check
 * @param {boolean} currentFlag - Current toTaste flag value
 * @param {RegExp|null} toTasteRegex - Regex for toTaste keywords
 * @returns {{toTaste: boolean, line: string}} - Updated flag and line
 */
export function detectToTasteFlag(line, currentFlag, toTasteRegex) {
  if (safeTest(toTasteRegex, line)) {
    return {
      toTaste: true,
      line: safeReplace(line, toTasteRegex).trim(),
    };
  }
  return {toTaste: currentFlag, line};
}
