import {i18nMap} from './i18n';

function keepThreeDecimals(val, delimiter) {
  const strVal = val.toString();
  return (
    strVal.split('.')[0] + delimiter + strVal.split('.')[1].substring(0, 3)
  );
}

export function convertFromFraction(value, language) {
  const {isCommaDelimited} = i18nMap[language];

  const delimiter = isCommaDelimited ? ',' : '.';

  // number comes in, for example: 1 1/3
  if (value && value.split(' ').length > 1) {
    const [whole, fraction] = value.split(' ');
    const [a, b] = fraction.split('/');
    const remainder = parseFloat(a) / parseFloat(b);
    const wholeAndFraction = parseInt(whole)
      ? parseInt(whole) + remainder
      : remainder;
    return keepThreeDecimals(wholeAndFraction, delimiter);
  } else if (!value || value.split('-').length > 1) {
    return value;
  } else {
    const [a, b] = value.split('/');
    return b ? keepThreeDecimals(parseFloat(a) / parseFloat(b), delimiter) : a;
  }
}

export function getFirstMatch(line, regex) {
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
export function text2num(s, language) {
  const a = s.toString().split(/[\s-]+/);
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

export function feach(w, g, n, language) {
  const {numbersSmall, numbersMagnitude} = i18nMap[language];

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

export function findQuantityAndConvertIfUnicode(ingredientLine, language) {
  let trimmedLine = ingredientLine.trim(); // Ensure the string is trimmed

  const {joiners, isCommaDelimited} = i18nMap[language];

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

  const numericAndFractionRegex = new RegExp(
    `(\\d+\\/\\d+|\\d+\\s\\d+\\/\\d+|\\d+(?:${magnitudeSeperator}?\\d+)*${delimiter}\\d+|\\d+)`,
    'g',
  );

  const numericRangeWithSpaceRegex = new RegExp(
    `(\\d+[\\-–]\\d+)|(\\d+\\s[\\-–]\\s\\d+)|(\\d+\\s(?:${joiners.join(
      '|',
    )})\\s\\d+)`,
    'g',
  );

  // for ex: "1 to 2" or "1 - 2"
  // const unicodeFractionRegex = /(\d*)\s*([^\u0000-\u007F]+)/g;
  const unicodeFractionRegex = new RegExp(
    `(\\d*)\\s*(${Object.keys(unicodeObj).join('|')})`,
    '',
  );
  const wordUntilSpace = /[^\s]+/g;

  // found a unicode quantity inside our regex, for ex: '⅝', '1½', or '1 ½'
  const unicodeQuantityMatch = ingredientLine.match(unicodeFractionRegex);
  if (unicodeQuantityMatch) {
    const match = unicodeQuantityMatch[0]; // full match e.g. "1 ½" or "½"
    const parts = match.match(/(\d*)\s*([^\u0000-\u007F]+)/); // Extract numericPart and unicodePart
    if (parts && parts.length === 3) {
      const numericPart = parseFloat(parts[1] || '0');
      const unicodeStr = unicodeObj[parts[2]]; // e.g., '1/2'
      const [num, denom] = unicodeStr.split('/').map(Number);
      const unicodeValue = denom ? num / denom : 0;
      const totalQuantity = numericPart + unicodeValue;
      const rest = ingredientLine.replace(match, '').trim();

      return [totalQuantity.toString(), rest];
    }
  }

  // found a quantity range, for ex: "2 to 3"
  const quantityRangeMatch = ingredientLine.match(numericRangeWithSpaceRegex);
  if (quantityRangeMatch) {
    const quantity = getFirstMatch(ingredientLine, numericRangeWithSpaceRegex)
      .replace(new RegExp(`${joiners.join('|')}`), '-')
      .split(' ')
      .join('');
    const restOfIngredient = ingredientLine
      .replace(getFirstMatch(ingredientLine, numericRangeWithSpaceRegex), '')
      .trim();
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
