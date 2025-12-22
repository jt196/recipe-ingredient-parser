import {i18nMap} from '../i18n';

/**
 * Escape text for safe usage inside RegExp character classes.
 * @param {string} value
 * @returns {string}
 */
const escapeRegex = value => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * Round a numeric string to three decimals while respecting the locale delimiter.
 * @param {string|number} val
 * @param {string} delimiter '.' or ','
 * @returns {string}
 */
function keepThreeDecimals(val, delimiter) {
  const strVal = val.toString();
  if (!strVal.includes('.')) return strVal;
  const [whole, fraction = ''] = strVal.split('.');
  return `${whole}${delimiter}${fraction.substring(0, 3)}`;
}

/**
 * Convert fractional strings (including unicode fractions and ranges) into decimal strings.
 * Returns the original value for non-fractional inputs.
 *
 * @param {string|number|null} value
 * @param {string} language
 * @returns {string|number|null}
 */
export function convertFromFraction(value, language) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number') return value;

  const langMap = i18nMap[language] || {isCommaDelimited: false};
  const {isCommaDelimited} = langMap;
  const delimiter = isCommaDelimited ? ',' : '.';

  let working = String(value).trim();
  if (!working) return working;

  if (Object.prototype.hasOwnProperty.call(unicodeObj, working)) {
    working = unicodeObj[working];
  }

  // number comes in, for example: 1 1/3
  if (working.includes(' ')) {
    const [whole, fraction] = working.split(' ');
    const [a, b] = fraction.split('/');
    const remainder = parseFloat(a) / parseFloat(b);
    const wholeAndFraction = parseInt(whole, 10)
      ? parseInt(whole, 10) + remainder
      : remainder;
    return keepThreeDecimals(wholeAndFraction, delimiter);
  }

  // fractional range (recursively convert both sides)
  if (working.includes('-') || working.includes('–')) {
    const parts = working
      .split(/-|–/)
      .map(part => convertFromFraction(part.trim(), language));
    return parts.join('-');
  }

  const [a, b] = working.split('/');
  return b
    ? keepThreeDecimals(parseFloat(a) / parseFloat(b), delimiter)
    : working;
}

/**
 * Return the first regex match or an empty string.
 * @param {string} line
 * @param {RegExp} regex
 * @returns {string}
 */
export function getFirstMatch(line, regex) {
  if (!line) return '';
  const match = line.match(regex);
  return (match && match[0]) || '';
}

const unicodeObj = {
  '½': '1/2',
  '⅓': '1/3',
  '⅔': '2/3',
  '¼': '1/4',
  '¾': '3/4',
  '⅕': '1/5',
  '⅖': '2/5',
  '⅗': '3/5',
  '⅘': '4/5',
  '⅙': '1/6',
  '⅚': '5/6',
  '⅐': '1/7',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
  '⅑': '1/9',
  '⅒': '1/10',
};
/**
 * Convert a spelled-out number into its numeric equivalent.
 * Returns null when unable to parse.
 *
 * @param {string|number} s
 * @param {string} language
 * @returns {number|null}
 */
export function text2num(s, language) {
  const langMap = i18nMap[language];
  if (!langMap) return null;

  const a = s
    .toString()
    .trim()
    .split(/[\s-]+/);
  let values = [0, 0];
  a.forEach(x => {
    values = feach(x, values[0], values[1], language);
  });
  const total = values[0] + values[1];
  if (total < 0) {
    return null;
  } else {
    return total;
  }
}

/**
 * Helper for text2num to accumulate values by word.
 * @param {string} w
 * @param {number} g
 * @param {number} n
 * @param {string} language
 * @returns {number[]}
 */
export function feach(w, g, n, language) {
  const {numbersSmall, numbersMagnitude} = i18nMap[language];
  if (!numbersSmall || !numbersMagnitude) return [-1, -1];

  let x = numbersSmall[w];
  if (x != null) {
    g = g + x;
  } else if (100 == numbersMagnitude[w]) {
    if (g > 0) {
      g = g * 100;
    } else {
      g = 100;
    }
  } else {
    x = numbersMagnitude[w];
    if (x != null) {
      n = n + g * x;
      g = 0;
    } else {
      return [-1, -1];
    }
  }
  return [g, n];
}

/**
 * Extract a leading quantity (including unicode fractions and ranges) and the remainder of the ingredient line.
 *
 * @param {string} ingredientLine
 * @param {string} language
 * @returns {[string|null, string]} tuple of [quantityStringOrNull, restOfIngredient]
 */
export function findQuantityAndConvertIfUnicode(ingredientLine, language) {
  if (typeof ingredientLine !== 'string') {
    return [null, ''];
  }
  const langMap = i18nMap[language];
  if (!langMap) {
    const trimmed = ingredientLine.trim();
    return [null, trimmed];
  }

  let trimmedLine = ingredientLine
    // remove zero-width and BOM-like chars
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // drop control chars that leak from bad copies
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    // fix mojibake for 1/2 (¬Ω) that sometimes appears in exports
    .replace(/¬Ω/g, '1/2')
    // fix common mojibake for fraction slash and stray Â
    .replace(/â„/g, '/')
    .replace(/Â/g, '')
    // normalize fraction slash
    .replace(/\u2044/g, '/')
    // normalize ampersand-separated mixed numbers like "1 & 1/2" -> "1 1/2"
    .replace(/(\d)\s*&\s*(\d+\/\d+)/g, '$1 $2')
    // normalize spaced fractions like "1 /2"
    .replace(/(\d)\s*\/\s*(\d)/g, '$1/$2')
    .trim(); // Ensure the string is trimmed

  const {joiners = [], isCommaDelimited} = langMap;

  // Check if the line starts with "a " and handle it as quantity "1"
  if (trimmedLine.toLowerCase().startsWith('a ')) {
    const restOfIngredient = trimmedLine.substring(2).trim(); // Remove "a " from the start
    return ['1', restOfIngredient];
  }

  // Remove commas (thousands separators) if not using comma-delimited decimals
  if (!isCommaDelimited) {
    ingredientLine = trimmedLine.replace(/,/g, '');
  }

  const delimiter = isCommaDelimited ? ',' : '\\.';
  const magnitudeSeperator = isCommaDelimited ? '\\.' : ',';
  const quantityPattern = `(\\d+\\s*\\/\\s*\\d+|\\d+\\s+\\d+\\s*\\/\\s*\\d+|\\d+(?:${magnitudeSeperator}?\\d+)*${delimiter}\\d+|\\d+)`;
  const joinersEscaped = joiners.map(escapeRegex);
  const joinersPattern = joinersEscaped.length ? joinersEscaped.join('|') : '';

  const numericAndFractionRegex = new RegExp(quantityPattern, 'g');

  const numericRangeWithSpaceRegex = new RegExp(
    `${quantityPattern}\\s*(?:[\\-–]${
      joinersPattern ? `|(?:${joinersPattern})` : ''
    })\\s*${quantityPattern}`,
    'g',
  );

  // for ex: "1 to 2" or "1 - 2"
  // const unicodeFractionRegex = /(\d*)\s*([^\u0000-\u007F]+)/g;
  const unicodeFractionRegex = new RegExp(
    `(\\d*)\\s*(${Object.keys(unicodeObj).join('|')})`,
    '',
  );
  const wordUntilSpace = /[^\s]+/g;
  const unicodeQuantityPartsRegex = /(\d*)\s*([^\p{ASCII}]+)/u;

  // found a unicode quantity inside our regex, for ex: '⅝', '1½', or '1 ½'
  const unicodeQuantityMatch = unicodeFractionRegex.exec(ingredientLine);
  if (unicodeQuantityMatch && unicodeQuantityMatch.index === 0) {
    const match = unicodeQuantityMatch[0]; // full match e.g. "1 ½" or "½"
    const parts = match.match(unicodeQuantityPartsRegex); // Extract numericPart and unicodePart
    if (parts && parts.length === 3) {
      const numericPart = parseFloat(parts[1] || '0');
      const unicodeStr = unicodeObj[parts[2]]; // e.g., '1/2'
      const [num, denom] = unicodeStr.split('/').map(Number);
      const unicodeValue = denom ? num / denom : 0;
      const totalQuantity = numericPart + unicodeValue;
      const rest = ingredientLine.replace(match, '').trim();
      const rangeDashMatch = rest.match(/^[-–]\s*([^\s]+)/);
      if (rangeDashMatch) {
        const secondQty = convertFromFraction(rangeDashMatch[1], language);
        const restOfIngredient = rest.replace(rangeDashMatch[0], '').trim();
        return [`${totalQuantity}-${secondQty}`, restOfIngredient];
      }
      const rangeJoinerMatch = rest.match(
        new RegExp(`^(${joinersPattern})\\s*([^\\s]+)`, 'i'),
      );
      if (joinersPattern && rangeJoinerMatch) {
        const secondQty = convertFromFraction(rangeJoinerMatch[2], language);
        const restOfIngredient = rest.replace(rangeJoinerMatch[0], '').trim();
        return [`${totalQuantity}-${secondQty}`, restOfIngredient];
      }

      return [totalQuantity.toString(), rest];
    }
  }

  // choose range only if it appears before any standalone number
  const rangeMatch = numericRangeWithSpaceRegex.exec(ingredientLine);
  const rangeIndex = rangeMatch ? rangeMatch.index : -1;

  numericAndFractionRegex.lastIndex = 0;
  const numberMatch = numericAndFractionRegex.exec(ingredientLine);
  const numberIndex = numberMatch ? numberMatch.index : -1;

  if (rangeIndex !== -1 && (numberIndex === -1 || rangeIndex <= numberIndex)) {
    const rawRange = rangeMatch[0];
    const normalizedRange = joinersPattern
      ? rawRange.replace(new RegExp(`${joinersPattern}`), '-')
      : rawRange;
    const quantity = normalizedRange.split(' ').join('');
    const restOfIngredient = ingredientLine.replace(rawRange, '').trim();
    return [quantity, restOfIngredient];
  }

  // found a numeric/fraction quantity, for example: "1 1/3"
  const numericFractionMatch = ingredientLine.match(numericAndFractionRegex);
  if (numericFractionMatch) {
    const quantity = getFirstMatch(ingredientLine, numericAndFractionRegex);
    const restOfIngredient = ingredientLine
      .replace(getFirstMatch(ingredientLine, numericAndFractionRegex), '')
      .trim();
    return [quantity, restOfIngredient];
  }

  // found a word which we can test for numeric value
  const wordUntilSpaceMatch = ingredientLine.match(wordUntilSpace);
  if (wordUntilSpaceMatch) {
    const quantity = getFirstMatch(ingredientLine, wordUntilSpace);
    const quantityNumber = text2num(quantity.toLowerCase(), language);

    if (quantityNumber !== null) {
      // ✅ allow 0, but still exclude null
      const restOfIngredient = ingredientLine
        .replace(getFirstMatch(ingredientLine, wordUntilSpace), '')
        .trim();
      const quantityString = isCommaDelimited
        ? `${quantityNumber}`.replace('.', ',')
        : `${quantityNumber}`;
      return [quantityString, restOfIngredient];
    }

    return [null, ingredientLine];
  }

  return [null, ingredientLine];
}
