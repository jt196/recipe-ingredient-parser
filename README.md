# recipe-ingredient-parser-v3

Natural language parser for recipe ingredients with multi-language support. Parses ingredient strings into structured objects and can combine multiple ingredient objects.

## About

This project was built on top of code written by [nsafai](https://github.com/nsafai/recipe-parser).

### Key Features

- **Multi-language support**: 10 languages including English, German, Italian, Spanish, French, Portuguese, Russian, Hindi, Indonesian, and Arabic
- **No external NLP libraries**: Lightweight and fast
- **Cross-platform**: Works with Node.js, browser, and React Native
- **Smart parsing**: Handles fractions (including Unicode), ranges, and numbers written as words
- **Unit system detection**: Automatically classifies ingredients by measurement system (metric, imperial, US volumetric)
- **Alternative measurements**: Extracts alternative units and ingredient substitutions (parenthetical, slash-separated, "or" alternatives)
- **Flexible input**: Supports prepositions and natural language variations

## Installation

```bash
npm install recipe-ingredient-parser-v3
```

or

```bash
yarn add recipe-ingredient-parser-v3
```

## Basic Usage

```javascript
import { parse } from 'recipe-ingredient-parser-v3';

// English
parse('1 teaspoon basil', 'eng');

// Italian
parse('1 grammo di zucchero', 'ita');

// German
parse('2 Esslöffel Olivenöl', 'deu');
```

## API Reference

### `parse(ingredientString, language, options?)`

Parses a single ingredient string into a structured object.

**Parameters:**

- `ingredientString` (string): The ingredient text to parse
- `language` (string): Language code (see [Languages Supported](#languages-supported))
- `options` (object, optional):
  - `includeUnitSystems` (boolean): Include `unitSystem` in output (default: false)
  - `includeAlternatives` (boolean): Parse alternative measurements/ingredients (default: false)

**Returns:** Ingredient object with the following structure:

```javascript
{
  quantity: number,        // Numeric quantity (average if range)
  unit: string,           // Canonical unit name (e.g., 'teaspoon', 'gram')
  ingredient: string,     // Name of the ingredient
  minQty: number,         // Minimum quantity (same as quantity if not a range)
  maxQty: number,         // Maximum quantity (same as quantity if not a range)
  unitSystem: string,     // Only if includeUnitSystems=true: 'metric', 'imperial', 'americanVolumetric', or null
  preparation: string,    // Preparation instructions (e.g., 'chopped', 'diced')
  alternatives: array     // Only if includeAlternatives=true: Alternative measurements/ingredients
}
```

**Example:**

```javascript
parse('2-3 cups diced tomatoes', 'eng', { includeUnitSystems: true });

// Returns:
{
  quantity: 2.5,
  unit: 'cup',
  ingredient: 'tomatoes',
  minQty: 2,
  maxQty: 3,
  unitSystem: 'americanVolumetric',
  preparation: 'diced'
}
```

### `combine(ingredientArray)`

Combines multiple ingredient objects with the same unit and ingredient name.

**Parameters:**

- `ingredientArray` (array): Array of ingredient objects from `parse()`

**Returns:** Array of combined ingredient objects

**Example:**

```javascript
import { combine } from 'recipe-ingredient-parser-v3';

combine([
  {
    quantity: 1,
    unit: 'teaspoon',
    ingredient: 'basil',
    minQty: 1,
    maxQty: 2,
  },
  {
    quantity: 2,
    unit: 'teaspoon',
    ingredient: 'basil',
    minQty: 2,
    maxQty: 2
  }
]);

// Returns:
[{
  quantity: 3,
  unit: 'teaspoon',
  ingredient: 'basil',
  minQty: 3,
  maxQty: 4
}]
```

## Languages Supported

| Language   | Code  | Units | Example                          |
|------------|-------|-------|----------------------------------|
| English    | `eng` | 47    | `1 cup flour`                    |
| German     | `deu` | 27    | `1 Tasse Mehl`                   |
| Spanish    | `esp` | 38    | `1 taza de harina`               |
| Italian    | `ita` | 31    | `1 tazza di farina`              |
| French     | `fra` | 33    | `1 tasse de farine`              |
| Portuguese | `por` | 34    | `1 xícara de farinha`            |
| Russian    | `rus` | 36    | `1 чашка муки`                   |
| Hindi      | `hin` | 37    | `1 कप आटा`                      |
| Indonesian | `ind` | 38    | `1 cangkir tepung`               |
| Arabic     | `ara` | 37    | `1 فنجان دقيق`                   |

## Parsing Capabilities

### Fractions

The parser handles both ASCII and Unicode fractions:

```javascript
parse('1/2 cup sugar', 'eng');        // quantity: 0.5
parse('1½ cups flour', 'eng');        // quantity: 1.5
parse('2 ¾ teaspoons salt', 'eng');   // quantity: 2.75
```

### Ranges

Ingredient ranges are parsed with min/max quantities:

```javascript
parse('2-3 tablespoons butter', 'eng');
// { quantity: 2.5, minQty: 2, maxQty: 3, ... }
```

### Word Numbers

Numbers can be written as words:

```javascript
parse('six cups milk', 'eng');
// { quantity: 6, unit: 'cup', ingredient: 'milk', ... }

parse('drei Esslöffel Öl', 'deu');
// { quantity: 3, unit: 'Esslöffel', ... }
```

### Prepositions

Handles natural language with prepositions:

```javascript
parse('6 cups of milk', 'eng');           // English
parse('6 tazze di latte', 'ita');         // Italian
parse('6 Tassen von Milch', 'deu');       // German
```

### Unit Systems

When `includeUnitSystems: true`, the parser classifies units:

- **`metric`**: grams, kilograms, milliliters, liters, etc.
- **`imperial`**: ounces, pounds, fluid ounces, pints, gallons
- **`americanVolumetric`**: cups, quarts
- **`null`**: System-agnostic (teaspoon, tablespoon) or count-based units (pieces, cloves)

```javascript
parse('100 grams flour', 'eng', { includeUnitSystems: true });
// { ..., unitSystem: 'metric' }

parse('2 teaspoons salt', 'eng', { includeUnitSystems: true });
// { ..., unitSystem: null }  // teaspoons are system-agnostic
```

### Alternative Measurements

When `includeAlternatives: true`, the parser extracts alternative measurements or ingredients. This is useful for recipes that provide metric and imperial measurements, or offer ingredient substitutions.

**Supported formats:**

#### Parenthetical Alternatives

Alternative units in parentheses or brackets:

```javascript
parse('450g (1 lb) of tinned tomatoes', 'eng', {
  includeAlternatives: true,
  includeUnitSystems: true
});

// Returns:
{
  quantity: 450,
  unit: 'gram',
  unitSystem: 'metric',
  ingredient: 'tinned tomatoes',
  alternatives: [
    {
      quantity: 1,
      unit: 'pound',
      unitSystem: 'imperial',
      ingredient: null,
      minQty: 1,
      maxQty: 1
    }
  ]
}
```

#### Slash-Separated Alternatives

Alternative measurements separated by slashes:

```javascript
parse('1 cup / 250ml milk', 'eng', { includeAlternatives: true });

// Returns:
{
  quantity: 1,
  unit: 'cup',
  ingredient: 'milk',
  alternatives: [
    {
      quantity: 250,
      unit: 'milliliter',
      ingredient: null
    }
  ]
}
```

#### "Or" Alternatives

Ingredient or measurement substitutions using "or":

```javascript
parse('1 cup flour or 2 cups sugar', 'eng', { includeAlternatives: true });

// Returns:
{
  quantity: 1,
  unit: 'cup',
  ingredient: 'flour',
  alternatives: [
    {
      quantity: 2,
      unit: 'cup',
      ingredient: 'sugar',
      minQty: 2,
      maxQty: 2
    }
  ]
}
```

**Alternative object structure:**

Each alternative has the same structure as the main ingredient:

```javascript
{
  quantity: number,
  unit: string,
  unitPlural: string,
  symbol: string,
  ingredient: string,      // null if only alternative unit, not ingredient
  minQty: number,
  maxQty: number,
  originalString: string,
  unitSystem: string       // Only if includeUnitSystems=true
}
```

## Developer Guide

### Architecture

The parser uses a centralized architecture:

- **`src/i18n/index.js`**: Single source of truth for unit metadata (conversion factors, systems, decimal places)
- **`src/i18n/lang.*.js`**: Language-specific translations (unit names, singular/plural forms, symbols, linguistic data)
- **Runtime merging**: Metadata + translations combined at import time

### Adding a New Language

To add support for a new language:

#### 1. Create Language File

Create `src/i18n/lang.XXX.js` (where XXX is the ISO 639-3 code):

```javascript
export const unitTranslations = {
  // For each unit in baseUnitsData (src/i18n/index.js):
  gram: {
    names: ['gram', 'grams', 'g', 'g.'],  // All recognized variants
    singular: 'gram',                      // Must match the unit key
    plural: 'grams',                       // Plural form for display
    symbol: 'g',                           // Symbol/abbreviation
  },
  // ... add all other units
};

const prepositions = ['of', 'with'];      // Language-specific prepositions
const joiners = ['to', 'or'];             // Range connectors
const toTaste = ['to taste'];             // "To taste" variations
const toTasteAdditional = ['more', 'adjust'];
const additionalStopwords = ['and', 'or'];
const approx = ['about', 'approximately', '~'];
const optional = ['optional', 'if desired'];
const toServe = ['to serve', 'for serving'];

const instructions = [
  'chopped', 'diced', 'sliced', 'minced',
  // ... preparation instructions
];

const adverbs = ['finely', 'coarsely', 'thinly'];

const numbersSmall = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  // ... up to 90
};

const numbersMagnitude = {
  hundred: 100,
  thousand: 1000,
  million: 1000000,
  // ...
};

const problematicUnits = {
  clove: ['garlic'],  // Context clues for ambiguous units
};

export const langXXX = {
  unitTranslations,
  prepositions,
  joiners,
  toTaste,
  toTasteAdditional,
  additionalStopwords,
  approx,
  optional,
  toServe,
  instructions,
  adverbs,
  numbersSmall,
  numbersMagnitude,
  problematicUnits,
  isCommaDelimited: false,  // Set true if language uses commas for decimals
};
```

#### 2. Import in Index

Add your language to `src/i18n/index.js`:

```javascript
import {langXXX} from './lang.XXX.js';

// Add to i18nMap:
export const i18nMap = {
  eng: prepareLangExport(langEng),
  deu: prepareLangExport(langDeu),
  // ... other languages
  XXX: prepareLangExport(langXXX),  // Add your language
};
```

#### 3. Unit Translations

You don't need to translate all 47 units immediately - start with common ones:

**Essential units** (minimum for basic functionality):

- Volume: teaspoon, tablespoon, cup, milliliter, liter
- Weight: gram, kilogram, ounce, pound
- Count: piece, clove, pinch

**Reference**: Check `src/i18n/lang.eng.js` for the complete list of units.

#### 4. Test Your Language

Create test cases in `test/`:

```javascript
import { parse } from '../src/index.js';

describe('Language XXX parsing', () => {
  it('should parse basic ingredient', () => {
    const result = parse('1 [translated unit] [ingredient]', 'XXX');
    expect(result.quantity).toBe(1);
    expect(result.unit).toBe('[canonical unit name]');
    expect(result.ingredient).toBe('[ingredient]');
  });
});
```

### Unit Metadata Reference

All units are defined in `baseUnitsData` (`src/i18n/index.js`) with:

- **`system`**: `'metric'`, `'imperial'`, `'americanVolumetric'`, or `null`
  - Set to `null` for system-agnostic units (teaspoon, tablespoon) or count-based units
- **`unitType`**: `'volume'`, `'weight'`, `'count'`, `'length'`
- **`conversionFactor`**: Conversion to base units (e.g., `{ milliliters: 4.92 }` for teaspoon)
- **`skipConversion`**: `true` for units that shouldn't be converted (very small or count-based)
- **`decimalPlaces`**: Precision for conversions

### Linguistic Data Guidelines

- **prepositions**: Words that connect quantity/unit to ingredient ("of", "de", "di")
- **joiners**: Words for ranges ("to", "or", "bis", "à")
- **instructions**: Preparation methods (chopped, diced, etc.) - these are stripped from ingredient name
- **problematicUnits**: Units that need context (e.g., "clove" only with "garlic")

## Development

### Setup

```bash
git clone [repository]
cd recipe-ingredient-parser
npm install
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

### Building

```bash
npm run build         # Compile TypeScript to lib/
npm run build:test    # Compile tests to testDist/
npm run watch         # Watch mode for development
```

### Code Quality

```bash
npm run lint          # Check linting
npm run fmt           # Format and fix linting issues
npm run test:ci       # Lint + test (pre-publish)
```

## Publishing

Checkout [npm publishing docs](https://docs.npmjs.com/getting-started/publishing-npm-packages) for more info.

The `prepublish` hook automatically runs `npm run build` to refresh `lib/` before publishing.

## License

MIT

## Credits

- Original parser by [nsafai](https://github.com/nsafai/recipe-parser)
- Multi-language support and architecture improvements by contributors
