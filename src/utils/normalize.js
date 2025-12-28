import * as convert from './convert';

/**
 * Removes leading "Optional:" label from ingredient line.
 *
 * @param {string} line - The ingredient line to process
 * @returns {{line: string, hadOptionalLabel: boolean}} - Processed line and flag
 */
export function removeOptionalLabel(line) {
  const hadOptionalLabel = /^optional:/i.test(line);
  const cleaned = line.replace(/^optional:\s*/i, '').trim();
  return {line: cleaned, hadOptionalLabel};
}

/**
 * Removes leading list markers like "- " or "• " from ingredient line.
 *
 * @param {string} line - The ingredient line to process
 * @returns {string} - Line with list markers removed
 */
export function removeListMarkers(line) {
  return line.replace(/^\s*[-•]\s+/, '').trim();
}

/**
 * Normalizes written number followed by numeric size and canned unit.
 * Example: "Three 15-ounce cans ..." → "3 cans ..." with "15-ounce" in additionalParts
 *
 * @param {string} line - The ingredient line to process
 * @param {string} language - The language key
 * @returns {{line: string, additionalParts: string[], hadWordNumberCan: boolean}} - Normalized line and extracted size
 */
export function normalizeWordNumberCans(line, language) {
  const wordNumberCanMatch = line.match(
    /^([A-Za-z]+)\s+([\d.,/¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞-]+)\s+(cans?)\b\s*(.*)/iu,
  );

  if (!wordNumberCanMatch) {
    return {line, additionalParts: [], hadWordNumberCan: false};
  }

  const wordQty = convert.text2num(wordNumberCanMatch[1], language);
  if (!wordQty || wordQty <= 0) {
    return {line, additionalParts: [], hadWordNumberCan: false};
  }

  const sizePart = wordNumberCanMatch[2].trim();
  const rest = wordNumberCanMatch[4] || '';
  const additionalParts = sizePart ? [sizePart] : [];
  const normalizedLine = `${wordQty} ${wordNumberCanMatch[3]} ${rest}`.trim();

  return {
    line: normalizedLine,
    additionalParts,
    hadWordNumberCan: true,
  };
}

/**
 * Extracts comma-separated additional content from ingredient line.
 * Uses negative lookbehind/ahead to avoid splitting numbers like "1,500".
 *
 * @param {string} line - The ingredient line to process
 * @returns {{line: string, additionalParts: string[]}} - Cleaned line and extracted parts
 */
export function extractCommaAdditional(line) {
  const additionalParts = [];
  const commaAdditionalRegex = /(?<![0-9]),\s*([^,]+)\s*(?![0-9])/g;
  let commaMatch;

  while ((commaMatch = commaAdditionalRegex.exec(line))) {
    if (commaMatch[1]) {
      additionalParts.push(commaMatch[1].trim());
    }
  }

  const cleaned = line.replace(commaAdditionalRegex, '').trim();
  return {line: cleaned, additionalParts};
}

/**
 * Normalizes ampersand-separated mixed numbers like "1 & 1/2" → "1 1/2".
 *
 * @param {string} line - The ingredient line to process
 * @returns {string} - Normalized line
 */
export function normalizeAmpersandFractions(line) {
  return line.replace(/(\d)\s*&\s*(\d+\/\d+)/g, '$1 $2');
}

/**
 * Converts stray non-dash separators between digits into fraction slash.
 * Ignores hyphen/dash ranges.
 *
 * @param {string} line - The ingredient line to process
 * @returns {string} - Normalized line
 */
export function normalizeStrayFractionSeparators(line) {
  let normalized = line.replace(
    /(\d)\s*[^\dA-Za-z\s\-–.,&]\s*(\d)/g,
    '$1/$2',
  );
  // Handle specific encoding issues (â character)
  normalized = normalized.replace(/(\d)\s*â[^\dA-Za-z]+(\d)/g, '$1/$2');
  return normalized;
}
