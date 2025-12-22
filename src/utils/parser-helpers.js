import * as convert from '../convert';
import {i18nMap} from '../i18n';

export function toTasteRecognize(input, language) {
  if (typeof input !== 'string') return ['', '', false];
  const langMap = i18nMap[language];
  if (!langMap || !langMap.toTaste) return ['', '', false];
  const {toTaste} = langMap;

  for (const toTasteItem of toTaste) {
    const firstLetter = toTasteItem.match(/\b(\w)/g);

    if (firstLetter) {
      let regEx = new RegExp(toTasteItem, 'gi');
      if (input.match(regEx)) {
        return [
          (firstLetter.join('.') + '.').toLocaleLowerCase(),
          convert.getFirstMatch(input, regEx),
          true,
        ];
      }
      const regExString = firstLetter.join('[.]?') + '[.]?';
      regEx = new RegExp('(\\b' + regExString + '\\b)', 'gi');
      if (input.match(regEx)) {
        return [
          (firstLetter.join('.') + '.').toLocaleLowerCase(),
          convert.getFirstMatch(input, regEx),
          false,
        ];
      }
    }
  }

  return ['', '', false];
}

function getEarliestMatch(allMatches, input) {
  let bestMatch = null;
  for (const match of allMatches) {
    const idx = input.indexOf(match[3]);
    if (
      bestMatch === null ||
      idx < bestMatch.index ||
      (idx === bestMatch.index &&
        match[3].trim().length > bestMatch.match[3].trim().length)
    ) {
      bestMatch = {match, index: idx};
    }
  }
  return bestMatch ? bestMatch.match : [];
}

export function getUnit(input, language) {
  if (typeof input !== 'string') return [];
  const langMap = i18nMap[language];
  if (!langMap) return [];
  const {units, pluralUnits, symbolUnits, problematicUnits} = langMap;
  const [toTaste, toTasteMatch] = toTasteRecognize(input, language);

  let allMatches = [];

  const addMatch = (unit, pluralUnit, match) => {
    const symbol = symbolUnits[unit];
    allMatches.push([unit, pluralUnit, symbol, match]);
  };

  if (toTaste) {
    addMatch(toTaste, toTaste, toTasteMatch);
  }

  for (const unit of Object.keys(units)) {
    for (const shorthand of units[unit]) {
      const regex = new RegExp(
        `(?:^|[^A-Za-z0-9])${shorthand.replace(/\./g, '\\.')}(?:$|[^A-Za-z0-9])`,
        'gi',
      );
      const match = input.match(regex);
      if (match) {
        addMatch(unit, pluralUnits[unit], match[0]);
      }
    }
  }

  for (const pluralUnit of Object.keys(pluralUnits)) {
    const regex = new RegExp(
      `(?:^|[^A-Za-z0-9])${pluralUnits[pluralUnit]}(?:$|[^A-Za-z0-9])`,
      'gi',
    );
    const match = input.match(regex);
    if (match) {
      addMatch(pluralUnit, pluralUnits[pluralUnit], match[0]);
    }
  }

  for (const problematicUnit in problematicUnits) {
    const contextClues = problematicUnits[problematicUnit];
    if (
      allMatches.some(match => match[0] === problematicUnit) &&
      !contextClues.some(clue => input.includes(clue))
    ) {
      allMatches = allMatches.filter(match => match[0] !== problematicUnit);
    }
  }

  if (allMatches.length === 0) {
    return [];
  }
  return getEarliestMatch(allMatches, input);
}

export function getPreposition(input, language) {
  const {prepositions} = i18nMap[language];

  for (const preposition of prepositions) {
    const regex = new RegExp('^' + preposition);
    if (convert.getFirstMatch(input, regex)) {
      return preposition;
    }
  }

  return null;
}

export const getSymbol = (unit, language) => {
  const langMap = i18nMap[language];
  if (!unit || !langMap?.units || !langMap?.symbolUnits) return '';

  const normalizedKey = Object.keys(langMap.units).find(key =>
    langMap.units[key].includes(unit),
  );

  return langMap.symbolUnits[normalizedKey] || '';
};

export const getUnitSystem = (unit, language) => {
  if (!unit) return null;
  const langMap = i18nMap[language];
  const unitSystems = langMap?.unitSystems;
  if (unitSystems && unitSystems[unit]) {
    return unitSystems[unit];
  }
  return null;
};

export function convertToNumber(value, language) {
  const {isCommaDelimited} = i18nMap[language] || {};
  if (value === null || value === undefined) return 0;

  const raw =
    typeof value === 'string'
      ? value.replace(isCommaDelimited ? ',' : '.', '.')
      : value;
  const num = Number(raw);

  if (Number.isNaN(num)) return 0;

  return Math.round(num * 1000) / 1000;
}

export const resultQuantityCaptured = qty =>
  qty !== null && qty !== undefined && `${qty}`.trim() !== '';

export function extractMultiplier(line, language) {
  if (typeof line !== 'string') return {multiplier: 1, line: ''};

  let working = line.trim();

  const explicitMatch = working.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(.+)$/i);
  if (explicitMatch) {
    const multiplier = convertToNumber(explicitMatch[1], language) || 1;
    return {multiplier, line: explicitMatch[2].trim()};
  }

  if (/^\d+\s+\d+\/\d+/.test(working)) {
    return {multiplier: 1, line: working};
  }

  const stackedMatch = working.match(/^(\d+)\s+(.+)$/);
  if (stackedMatch) {
    const candidateRest = stackedMatch[2].trim();

    if (/^\d+\s*[-–]?\s*inch(?:es)?\b/i.test(candidateRest)) {
      return {multiplier: 1, line: working};
    }

    const {joiners = []} = i18nMap[language] || {};
    const escape = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const joinerPattern = joiners.map(escape).join('|');
    const rangeRegex = joinerPattern
      ? new RegExp(`^(?:[\\-–]|(?:${joinerPattern})\\b)\\s*\\d`, 'i')
      : new RegExp('^[\\-–]\\s*\\d');
    if (rangeRegex.test(candidateRest)) {
      return {multiplier: 1, line: working};
    }

    if (
      /^(?:[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)/u.test(candidateRest)
    ) {
      return {multiplier: 1, line: working};
    }

    const numberWithUnit = candidateRest.match(
      /^(\d+(?:[.,]\d+)?)(?:\s*[-–]?\s*)([A-Za-z\p{L}])/u,
    );
    if (numberWithUnit) {
      const [candidateQty, candidateRemainder] =
        convert.findQuantityAndConvertIfUnicode(candidateRest, language);
      const candidateUnitParts =
        candidateQty && candidateRemainder ? getUnit(candidateRemainder, language) : [];
      const hasUnit = candidateUnitParts.length > 0;

      const sizeLikeUnit =
        candidateUnitParts[0] &&
        ['inch', 'centimeter', 'millimeter'].includes(candidateUnitParts[0]);

      if (hasUnit && !sizeLikeUnit) {
        const multiplier = convertToNumber(stackedMatch[1], language) || 1;
        return {multiplier, line: candidateRest};
      }
    }
  }

  return {multiplier: 1, line: working};
}

export function extractParentheticalSegments(text) {
  if (typeof text !== 'string') return {cleaned: '', segments: []};
  let cleaned = '';
  const segments = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') {
      if (depth === 0) current = '';
      else current += ch;
      depth++;
      continue;
    }
    if (ch === ')') {
      if (depth > 1) current += ch;
      depth = Math.max(0, depth - 1);
      if (depth === 0 && current.trim()) {
        segments.push(current.trim());
        current = '';
      }
      continue;
    }
    if (depth > 0) {
      current += ch;
    } else {
      cleaned += ch;
    }
  }

  return {cleaned: cleaned.trim().replace(/\s+/g, ' '), segments};
}

export function extractInstructions(
  ingredientText,
  additionalParts,
  instructionsList,
  adverbs,
) {
  if (!Array.isArray(instructionsList) || instructionsList.length === 0) {
    return {ingredientText, additionalParts, instructions: []};
  }

  const escaped = [...instructionsList]
    .sort((a, b) => b.length - a.length)
    .map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const escapedAdverbs = (adverbs || []).map(w =>
    w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
  );

  const adverbPart =
    escapedAdverbs.length > 0 ? `(?:${escapedAdverbs.join('|')})\\s+` : '';
  const regex = new RegExp(
    `(?<!-)\\b(?:${adverbPart})?(?:${escaped.join('|')})\\b(?!-)`,
    'gi',
  );

  const found = [];
  const strip = text =>
    typeof text === 'string'
      ? text.replace(regex, match => {
          found.push(match.trim().replace(/\s+/g, ' '));
          return ' ';
        })
      : text;

  const newIngredient = strip(ingredientText);
  const newAdditionalParts = (additionalParts || []).map(part =>
    strip(part).trim(),
  );

  return {
    ingredientText:
      typeof newIngredient === 'string'
        ? newIngredient.replace(/\s+/g, ' ').trim()
        : ingredientText,
    additionalParts: newAdditionalParts.filter(Boolean),
    instructions: found,
  };
}
