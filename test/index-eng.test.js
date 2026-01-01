import {expect} from 'chai';
import {parse} from '../src/index';

/* global expect, it, describe */

function testExpectation(inputString, expectation) {
  expectation.originalString = inputString.trim(); // Set the originalString dynamically
  const result = parse(inputString, 'eng');
  delete result.approx;
  delete result.optional;
  delete result.toServe;
  expect(result).to.deep.equal(expectation);
}

describe('recipe parser eng', () => {
  it('returns an object', () => {
    expect(typeof parse('1 cup water', 'eng')).to.equal('object');
  });

  describe('translates the quantity', () => {
    it('flags "to taste" variants and strips them from ingredient', () => {
      const variants = [
        'to taste of salt',
        'To taste of salt',
        't.t. of salt',
        'TT of salt',
        'TT. of salt',
        'T.t of salt',
        'salt, to taste',
        'salt to taste',
      ];
      variants.forEach(v => {
        const res = parse(v, 'eng');
        expect(res.toTaste).to.equal(true);
        expect(res.unit).to.equal(null);
        expect(res.quantity).to.equal(0);
        expect(res.ingredient).to.equal('salt');
      });
    });
    it('of "1 teaspoon water"', () => {
      expect(parse('1 teaspoon water', 'eng').quantity).to.equal(1);
    });
    it('of "A teaspoon water"', () => {
      expect(parse('A teaspoon water', 'eng').quantity).to.equal(1);
    });
    it('of "1 Tbs. water"', () => {
      expect(parse('1 Tbs. water', 'eng').unit).to.equal('tablespoon');
    });
    it('of "1.5 teaspoon water"', () => {
      expect(parse('1.5 teaspoon water', 'eng').quantity).to.equal(1.5);
    });
    it('of "1 1/2 teaspoon water"', () => {
      expect(parse('1 1/2 teaspoon water', 'eng').quantity).to.equal(1.5);
    });
    it('of "1/3 teaspoon water"', () => {
      expect(parse('1/3 cup water', 'eng').quantity).to.equal(0.333);
    });
    it('of "1/2 teaspoon water"', () => {
      expect(parse('1/2 teaspoon water', 'eng').quantity).to.equal(0.5);
    });
    it('of "10 1/2 teaspoon water"', () => {
      expect(parse('10 1/2 teaspoon water', 'eng').quantity).to.equal(10.5);
    });
    it('of "about 1/2 teaspoon water"', () => {
      expect(parse('about 1/2 teaspoon water', 'eng').quantity).to.equal(0.5);
    });

    it('of "1,500.50 teaspoon water"', () => {
      expect(parse('1,500.50 teaspoon water', 'eng').quantity).to.equal(1500.5);
    });

    describe('translates the quantity from string to number', () => {
      it('zero teaspoon water"', () => {
        expect(parse('zero teaspoon water', 'eng').quantity).to.equal(0);
      });
      it('one teaspoon water"', () => {
        expect(parse('one teaspoon water', 'eng').quantity).to.equal(1);
      });
      it('twenty-one teaspoon water"', () => {
        expect(parse('twenty-one teaspoon water', 'eng').quantity).to.equal(21);
      });
      it('five teaspoon water"', () => {
        expect(parse('five teaspoon water', 'eng').quantity).to.equal(5);
      });
    });

    describe('to taste detector', () => {
      it('does not set toTaste for normal ingredients', () => {
        const res = parse('100g of butter', 'eng');
        expect(res.unit).to.equal('gram');
        expect(res.ingredient).to.equal('butter');
        expect(res.toTaste).to.equal(undefined);
      });
      it('does not set toTaste for descriptive ingredients', () => {
        const input =
          '5 baby artichokes (use canned if you can’t find fresh), halved or quartered depending on size';
        const res = parse(input, 'eng');
        expect(res.toTaste).to.equal(undefined);
        expect(res.ingredient).to.include('baby artichokes');
      });
    });

    describe('unit + descriptor edge cases', () => {
      it('parses "200g medium oatmeal" correctly', () => {
        const result = parse('200g medium oatmeal', 'eng');
        expect(result.quantity).to.equal(200);
        expect(result.unit).to.equal('gram');
        expect(result.ingredient).to.equal('oatmeal');
        expect(result.instructions).to.deep.equal(['medium']);
      });

      it('parses "1kg piece of pork belly" correctly', () => {
        const result = parse('1kg piece of pork belly', 'eng');
        expect(result.quantity).to.equal(1);
        expect(result.unit).to.equal('kilogram');
        expect(result.ingredient).to.equal('piece of pork belly');
      });

      it('parses "25g walnut pieces (chopped)" correctly', () => {
        const result = parse('25g walnut pieces (chopped)', 'eng');
        expect(result.quantity).to.equal(25);
        expect(result.unit).to.equal('gram');
        expect(result.ingredient).to.equal('walnut pieces');
        expect(result.instructions).to.deep.equal(['chopped']);
        expect(result.additional).to.equal(null);
      });

      it('captures size note ahead of unit', () => {
        const result = parse('1 1-inch piece ginger', 'eng');
        expect(result.quantity).to.equal(1);
        expect(result.unit).to.equal('piece');
        expect(result.ingredient).to.equal('ginger');
        expect(result.additional).to.equal('1-inch');
      });
    });

    describe('translates the quantity range', () => {
      const expectation = {
        ingredient: 'water',
        maxQty: 20,
        minQty: 10,
        quantity: 10,
        additional: null,
        originalString: '',
        symbol: 'tsp',
        unit: 'teaspoon',
        unitPlural: 'teaspoons',
      };
      it('of "10-20 teaspoon water"', () => {
        testExpectation('10-20 teaspoon water', expectation);
      });
      it('of "10 - 20 teaspoon water"', () => {
        testExpectation('10 - 20 teaspoon water', expectation);
      });
      it('of "10 to 20 teaspoon water"', () => {
        testExpectation('10 to 20 teaspoon water', expectation);
      });

      describe('fraction ranges', () => {
        const fractionRangeExpectation = {
          ingredient: 'flour',
          maxQty: 0.5,
          minQty: 0.25,
          quantity: 0.25,
          additional: null,
          originalString: '',
          symbol: 'c',
          unit: 'cup',
          unitPlural: 'cups',
        };

        const fractionRangeInputs = [
          '¼-½ cup of flour',
          '¼ - ½ cup of flour',
          '1/4-1/2 cup of flour',
          '1/4 - 1/2 cup of flour',
        ];

        fractionRangeInputs.forEach(input => {
          it(`of "${input}"`, () => {
            testExpectation(input, fractionRangeExpectation);
          });
        });
      });

      describe('approximation flag', () => {
        const approxCases = [
          ['about 2 cups sugar', 2, 'cups sugar'],
          ['approx. 3 tsp salt', 3, 'tsp salt'],
          ['~1/4 cup milk', 0.25, 'cup milk'],
          ['roughly 5 grams yeast', 5, 'grams yeast'],
        ];

        approxCases.forEach(([input, qty, remainder]) => {
          it(`marks approx for "${input}"`, () => {
            const result = parse(input, 'eng');
            expect(result.approx).to.equal(true);
            expect(result.quantity).to.equal(qty);
            expect(result.ingredient).to.equal(
              remainder.replace(/^[^ ]+ /, '').trim() || result.ingredient,
            );
          });
        });
      });

      describe('optional flag', () => {
        it('marks optional trailing brackets', () => {
          const result = parse('1 cup sugar (optional)', 'eng');
          expect(result.optional).to.equal(true);
          expect(result.additional).to.equal(null);
          expect(result.ingredient).to.equal('sugar');
        });
        it('marks optional trailing comma', () => {
          const result = parse('1 cup sugar, optional', 'eng');
          expect(result.optional).to.equal(true);
          expect(result.additional).to.equal(null);
          expect(result.ingredient).to.equal('sugar');
        });
        it('marks optional leading', () => {
          const result = parse('optional 2 tbsp cream', 'eng');
          expect(result.optional).to.equal(true);
          expect(result.quantity).to.equal(2);
          expect(result.unit).to.equal('tablespoon');
          expect(result.ingredient).to.equal('cream');
          expect(result.additional).to.equal(null);
        });
      });

      describe('to serve flag', () => {
        it('marks trailing comma form', () => {
          const result = parse('1 cup cream, to serve', 'eng');
          expect(result.toServe).to.equal(true);
          expect(result.quantity).to.equal(1);
          expect(result.unit).to.equal('cup');
          expect(result.ingredient).to.equal('cream');
          expect(result.additional).to.equal(null);
        });
        it('marks bracketed form', () => {
          const result = parse('fresh coriander (to serve)', 'eng');
          expect(result.toServe).to.equal(true);
          expect(result.quantity).to.equal(0);
          expect(result.unit).to.equal(null);
          expect(result.ingredient).to.equal('coriander');
          expect(result.instructions).to.include('fresh');
          expect(result.additional).to.equal(null);
        });
      });
    });

    describe('translates teaspoons correctly', () => {
      it('of "1 teaspoon salt, more to taste"', () => {
        const res = parse('1 teaspoon salt, more to taste', 'eng');
        expect(res.quantity).to.equal(1);
        expect(res.unit).to.equal('teaspoon');
        expect(res.ingredient).to.equal('salt');
        expect(res.toTaste).to.equal(true);
        expect(res.additional).to.equal(null);
      });
    });

    describe('of unicode fractions', () => {
      const unicodeAmounts = [
        '¼',
        '½',
        '¾',
        '⅐',
        '⅑',
        '⅒',
        '⅓',
        '⅔',
        '⅕',
        '⅖',
        '⅗',
        '⅘',
        '⅙',
        '⅚',
        '⅛',
        '⅜',
        '⅝',
        '⅞',
      ];
      const unicodeExpectedAmounts = [
        0.25, 0.5, 0.75, 0.143, 0.111, 0.1, 0.333, 0.667, 0.2, 0.4, 0.6, 0.8,
        0.167, 0.833, 0.125, 0.375, 0.625, 0.875,
      ];

      for (let u = 0; u < unicodeAmounts.length; u++) {
        const element = unicodeAmounts[u];
        const expectedAmount = unicodeExpectedAmounts[u];
        it(`${element} to ${expectedAmount}`, () => {
          expect(parse(`${element} teaspoon water`, 'eng').quantity).to.equal(
            expectedAmount,
          );
        });
      }

      const mixedValues = [
        '1¼',
        '2½',
        '3¾',
        '4⅐',
        '5⅑',
        '6⅒',
        '7⅓',
        '8⅔',
        '9⅕',
        '10 ⅖',
        '11 ⅗',
        '12 ⅘',
        '13 ⅙',
        '14 ⅚',
        '15 ⅛',
        '16 ⅜',
        '17 ⅝',
        '18 ⅞',
      ];
      const mixedExpectedValues = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
      ];

      for (let u = 0; u < mixedValues.length; u++) {
        const element = mixedValues[u];
        const expectedAmount =
          Number(mixedExpectedValues[u]) + Number(unicodeExpectedAmounts[u]);
        it(`${element} to ${expectedAmount}`, () => {
          expect(parse(`${element} teaspoon water`, 'eng').quantity).to.equal(
            expectedAmount,
          );
        });
      }
    });

    it("doesn't freak out if a strange unicode character is present", () => {
      expect(parse('1/3 cup confectioners’ sugar', 'eng')).to.deep.equal({
        quantity: 0.333,
        additional: null,
        originalString: '1/3 cup confectioners’ sugar',
        unit: 'cup',
        unitPlural: 'cups',
        symbol: 'c',
        ingredient: 'confectioners’ sugar',
        minQty: 0.333,
        maxQty: 0.333,
      });
    });

    it('correctly removes unicode value from ingredient', () => {
      expect(parse('2 ½ cup confectioners’ sugar', 'eng')).to.deep.equal({
        quantity: 2.5,
        additional: null,
        originalString: '2 ½ cup confectioners’ sugar',
        unit: 'cup',
        unitPlural: 'cups',
        symbol: 'c',
        ingredient: 'confectioners’ sugar',
        minQty: 2.5,
        maxQty: 2.5,
      });

      expect(parse('1 ½ cup water', 'eng')).to.deep.equal({
        quantity: 1.5,
        additional: null,
        originalString: '1 ½ cup water',
        unit: 'cup',
        unitPlural: 'cups',
        symbol: 'c',
        ingredient: 'water',
        minQty: 1.5,
        maxQty: 1.5,
      });

      expect(parse('2½ cup confectioners’ sugar', 'eng')).to.deep.equal({
        quantity: 2.5,
        additional: null,
        originalString: '2½ cup confectioners’ sugar',
        unit: 'cup',
        unitPlural: 'cups',
        symbol: 'c',
        ingredient: 'confectioners’ sugar',
        minQty: 2.5,
        maxQty: 2.5,
      });
    });
  });

  describe('translates the literal units', () => {
    it('of "1 cup water"', () => {
      expect(parse('1 cup water', 'eng').unit).to.equal('cup');
    });
    it('of "1 gallon water"', () => {
      expect(parse('1 gallon water', 'eng').unit).to.equal('gallon');
    });
    it('of "1 ounce water"', () => {
      expect(parse('1 ounce water', 'eng').unit).to.equal('ounce');
    });
    it('of "1 pint water"', () => {
      expect(parse('1 pint water', 'eng').unit).to.equal('pint');
    });
    it('of "1 pound water"', () => {
      expect(parse('1 pound water', 'eng').unit).to.equal('pound');
    });
    it('of "1 quart water"', () => {
      expect(parse('1 quart water', 'eng').unit).to.equal('quart');
    });
    it('of "1 tablespoon water"', () => {
      expect(parse('1 tablespoon water', 'eng').unit).to.equal('tablespoon');
    });
    it('of "1 teaspoon water"', () => {
      expect(parse('1 teaspoon water', 'eng').unit).to.equal('teaspoon');
    });
    it('of "1 t/s salt"', () => {
      expect(parse('1 t/s salt', 'eng').unit).to.equal('teaspoon');
    });
    it('of "1 gram water"', () => {
      expect(parse('1 gram water', 'eng').unit).to.equal('gram');
    });
    it('of "1 kilogram water"', () => {
      expect(parse('1 kilogram water', 'eng').unit).to.equal('kilogram');
    });
    it('of "1 liter water"', () => {
      expect(parse('1 liter water', 'eng').unit).to.equal('liter');
    });
    it('of "1 milligram water"', () => {
      expect(parse('1 milligram water', 'eng').unit).to.equal('milligram');
    });
    it('of "1 milliliter water"', () => {
      expect(parse('1 milliliter water', 'eng').unit).to.equal('milliliter');
    });
    it('of "500 millilitres water"', () => {
      expect(parse('500 millilitres water', 'eng').unit).to.equal('milliliter');
    });
    it('of "1 large onion"', () => {
      const result = parse('1 large onion', 'eng');
      expect(result.unit).to.equal(null);
      expect(result.ingredient).to.equal('onion');
      expect(result.instructions).to.deep.equal(['large']);
    });
    it('of "1 whole onion"', () => {
      expect(parse('1 whole onion', 'eng').unit).to.equal(null);
    });
    it('of "1 clove garlic"', () => {
      expect(parse('1 clove garlic', 'eng').unit).to.equal('clove');
    });
    it('of "1 bag garlic"', () => {
      expect(parse('1 bag garlic', 'eng').unit).to.equal('bag');
    });
    it('of "1 package sausage"', () => {
      expect(parse('1 package sausage', 'eng').unit).to.equal('pack');
    });
    it('"1 pinch water"', () => {
      expect(parse('1 pinch salt', 'eng').unit).to.equal('pinch');
    });
    it('"3 drops vanilla"', () => {
      expect(parse('3 drops vanilla', 'eng').unit).to.equal('drop');
    });
    it('"1 dash bitters"', () => {
      expect(parse('1 dash bitters', 'eng').unit).to.equal('dash');
    });
    it('"2 bunches parsley"', () => {
      const result = parse('2 bunches parsley', 'eng');
      expect(result.unit).to.equal('bunch');
      expect(result.unitPlural).to.equal('bunches');
    });
    it('"4 servings rice"', () => {
      const result = parse('4 servings rice', 'eng');
      expect(result.unit).to.equal('serving');
      expect(result.unitPlural).to.equal('servings');
    });
    it('"1 (14.5 oz) can tomatoes"', () => {
      expect(parse('1 (14.5 oz) can tomatoes', 'eng')).to.deep.equal({
        unit: 'can',
        unitPlural: 'cans',
        symbol: null,
        quantity: 1,
        additional: '14.5 oz',
        originalString: '1 (14.5 oz) can tomatoes',
        ingredient: 'tomatoes',
        minQty: 1,
        maxQty: 1,
      });
    });
    it('handles nested parentheses without breaking additional', () => {
      const result = parse('1 (14.5 oz (410g)) can tomatoes', 'eng');
      expect(result.quantity).to.equal(1);
      expect(result.unit).to.equal('can');
      expect(result.ingredient).to.equal('tomatoes');
      expect(result.additional).to.equal('14.5 oz (410g)');
    });
    it('"3 cloves"', () => {
      expect(parse('3 cloves', 'eng')).to.deep.equal({
        unit: null,
        unitPlural: null,
        symbol: null,
        quantity: 3,
        additional: null,
        originalString: '3 cloves',
        ingredient: 'cloves',
        minQty: 3,
        maxQty: 3,
      });
    });
    it('"1 3-inch cinammon stick"', () => {
      const result = parse('1 3-inch cinammon stick', 'eng');
      expect(result.quantity).to.equal(1);
      expect(result.unit).to.equal('stick');
      expect(result.ingredient).to.equal('cinammon');
      expect(result.additional).to.equal('3-inch');
      expect(result.minQty).to.equal(1);
      expect(result.maxQty).to.equal(1);
    });
    it('"25 lb beef stew chunks (or buy a roast and chop into small cubes)"', () => {
      expect(
        parse(
          '25 lb beef stew chunks (or buy a roast and chop into small cubes)',
          'eng',
        ),
      ).to.deep.equal({
        unit: 'pound',
        unitPlural: 'pounds',
        symbol: 'lb',
        quantity: 25,
        additional: 'or buy a roast and chop into cubes',
        originalString:
          '25 lb beef stew chunks (or buy a roast and chop into small cubes)',
        ingredient: 'beef stew chunks',
        instructions: ['small'],
        minQty: 25,
        maxQty: 25,
      });
    });
    it('"parses ingredient with range: 1 to 2 chicken breasts"', () => {
      expect(parse('1 to 2 chicken breasts', 'eng')).to.deep.equal({
        unit: null,
        unitPlural: null,
        symbol: null,
        quantity: 1,
        additional: null,
        originalString: '1 to 2 chicken breasts',
        ingredient: 'chicken breasts',
        minQty: 1,
        maxQty: 2,
      });
    });
    it('"parses ingredient with range: 1 - 2 chicken breasts"', () => {
      expect(parse('1 - 2 chicken breasts', 'eng')).to.deep.equal({
        unit: null,
        unitPlural: null,
        symbol: null,
        quantity: 1,
        additional: null,
        originalString: '1 - 2 chicken breasts',
        ingredient: 'chicken breasts',
        minQty: 1,
        maxQty: 2,
      });
    });
    it('"parses ingredient with range: 1-2 chicken breasts"', () => {
      expect(parse('1-2 chicken breasts', 'eng')).to.deep.equal({
        unit: null,
        unitPlural: null,
        symbol: null,
        quantity: 1,
        additional: null,
        originalString: '1-2 chicken breasts',
        ingredient: 'chicken breasts',
        minQty: 1,
        maxQty: 2,
      });
    });
    it('"1 (16 oz) box pasta"', () => {
      expect(parse('1 (16 oz) box pasta', 'eng')).to.deep.equal({
        unit: 'box',
        unitPlural: 'boxes',
        symbol: null,
        quantity: 1,
        additional: '16 oz',
        originalString: '1 (16 oz) box pasta',
        ingredient: 'pasta',
        minQty: 1,
        maxQty: 1,
      });
    });
    it('"1 slice cheese"', () => {
      expect(parse('1 slice cheese', 'eng')).to.deep.equal({
        unit: 'slice',
        unitPlural: 'slices',
        symbol: null,
        quantity: 1,
        additional: null,
        originalString: '1 slice cheese',
        ingredient: 'cheese',
        minQty: 1,
        maxQty: 1,
      });
    });
  });

  it('translates unit when no unit provided', () => {
    expect(parse('1 tortilla', 'eng')).to.deep.equal({
      unit: null,
      unitPlural: null,
      symbol: null,
      ingredient: 'tortilla',
      quantity: 1,
      additional: null,
      originalString: '1 tortilla',
      minQty: 1,
      maxQty: 1,
    });
  });

  it("doesn't explode when no unit and no quantity provided", () => {
    expect(parse('Powdered Sugar', 'eng')).to.deep.equal({
      ingredient: 'Powdered Sugar',
      quantity: 0,
      additional: null,
      originalString: 'Powdered Sugar',
      unit: null,
      unitPlural: null,
      symbol: null,
      minQty: 0,
      maxQty: 0,
    });
  });

  describe('translates the abbreviated units of', () => {
    it('"1 cup water"', () => {
      expect(parse('1 c water', 'eng').unit).to.equal('cup');
      expect(parse('2 c. water', 'eng').unit).to.equal('cup');
      expect(parse('2 cups water', 'eng').unit).to.equal('cup');
    });
    it('"1 gallon water"', () => {
      expect(parse('1 gal water', 'eng').unit).to.equal('gallon');
      expect(parse('1 gallons water', 'eng').unit).to.equal('gallon');
    });
    it('"1 ounce water"', () => {
      expect(parse('1 oz water', 'eng').unit).to.equal('ounce');
      expect(parse('1 oz. water', 'eng').unit).to.equal('ounce');
      expect(parse('2 ounces water', 'eng').unit).to.equal('ounce');
    });
    it('"1 pint water"', () => {
      expect(parse('1 pt water', 'eng').unit).to.equal('pint');
      expect(parse('2 pts water', 'eng').unit).to.equal('pint');
      expect(parse('1 pt. water', 'eng').unit).to.equal('pint');
      expect(parse('2 pints water', 'eng').unit).to.equal('pint');
    });
    it('"1 pound water"', () => {
      expect(parse('1 lb water', 'eng').unit).to.equal('pound');
      expect(parse('1 lb. water', 'eng').unit).to.equal('pound');
      expect(parse('2 lbs water', 'eng').unit).to.equal('pound');
      expect(parse('2 pounds water', 'eng').unit).to.equal('pound');
    });
    it('"1 quart water"', () => {
      expect(parse('1 qt water', 'eng').unit).to.equal('quart');
      expect(parse('1 qt. water', 'eng').unit).to.equal('quart');
      expect(parse('1 qts water', 'eng').unit).to.equal('quart');
      expect(parse('1 quarts water', 'eng').unit).to.equal('quart');
    });
    it('"1 tablespoon water"', () => {
      expect(parse('1 tbs water', 'eng').unit).to.equal('tablespoon');
      expect(parse('1 tbsp water', 'eng').unit).to.equal('tablespoon');
      expect(parse('1 tbspn water', 'eng').unit).to.equal('tablespoon');
      expect(parse('2 tablespoons water', 'eng').unit).to.equal('tablespoon');
      expect(parse('1 Tablespoon water', 'eng').unit).to.equal('tablespoon');
      expect(parse('2 Tablespoons water', 'eng').unit).to.equal('tablespoon');
    });
    it('"1 teaspoon water"', () => {
      expect(parse('1 tsp water', 'eng').unit).to.equal('teaspoon');
      expect(parse('1 tspn water', 'eng').unit).to.equal('teaspoon');
      expect(parse('1 t water', 'eng').unit).to.equal('teaspoon');
      expect(parse('1 t. water', 'eng').unit).to.equal('teaspoon');
      expect(parse('2 teaspoons water', 'eng').unit).to.equal('teaspoon');
    });
    it('"1 gram water"', () => {
      expect(parse('1 g water', 'eng').unit).to.equal('gram');
      expect(parse('1 g. water', 'eng').unit).to.equal('gram');
      expect(parse('2 grams water', 'eng').unit).to.equal('gram');
    });
    it('"1 kilogram water"', () => {
      expect(parse('1 kg water', 'eng').unit).to.equal('kilogram');
      expect(parse('1 kg. water', 'eng').unit).to.equal('kilogram');
      expect(parse('2 kilograms water', 'eng').unit).to.equal('kilogram');
    });
    it('"1 liter water"', () => {
      expect(parse('1 l water', 'eng').unit).to.equal('liter');
      expect(parse('1 l. water', 'eng').unit).to.equal('liter');
      expect(parse('2 liters water', 'eng').unit).to.equal('liter');
    });
    it('"1 milligram water"', () => {
      expect(parse('1 mg water', 'eng').unit).to.equal('milligram');
      expect(parse('1 mg. water', 'eng').unit).to.equal('milligram');
      expect(parse('1 milligrams water', 'eng').unit).to.equal('milligram');
    });
    it('"1 milliliter water"', () => {
      expect(parse('1 ml water', 'eng').unit).to.equal('milliliter');
      expect(parse('1 ml. water', 'eng').unit).to.equal('milliliter');
      expect(parse('1 milliliters water', 'eng').unit).to.equal('milliliter');
    });
    it('"1 pinch water"', () => {
      expect(parse('2 pinches salt', 'eng').unit).to.equal('pinch');
    });
  });

  describe('translates the ingredient of', () => {
    it('"1 teaspoon water"', () => {
      expect(parse('1 teaspoon of water', 'eng').ingredient).to.equal('water');
    });
    it('"1 teaspoon  milk"', () => {
      expect(parse('1 teaspoon of milk', 'eng').ingredient).to.equal('milk');
    });
    it('"1 teaspoon  of milk"', () => {
      expect(parse('1 teaspoon of milk', 'eng').ingredient).to.equal('milk');
    });
    it('"1 teaspoon  of milk"', () => {
      expect(parse('1 teaspoon of powdered sugar', 'eng').ingredient).to.equal(
        'powdered sugar',
      );
    });
  });

  describe('leading list markers', () => {
    it('ignores leading dash bullet', () => {
      const result = parse('- 500 g water', 'eng');
      expect(result.quantity).to.equal(500);
      expect(result.unit).to.equal('gram');
      expect(result.ingredient.toLowerCase()).to.equal('water');
    });
  });

  describe('brackets handling', () => {
    it('keeps nested bracket content intact in additional', () => {
      const result = parse('1 (14.5 oz (410g)) can tomatoes', 'eng');
      expect(result.additional).to.equal('14.5 oz (410g)');
    });

    it('cleans optional/to serve from additional but keeps other notes', () => {
      const result = parse(
        '(optional) finely chopped parsley (for garnish), to serve',
        'eng',
      );
      expect(result.optional).to.equal(true);
      expect(result.toServe).to.equal(true);
      expect(result.ingredient).to.equal('parsley');
      expect(result.additional).to.equal(null);
      expect(result.instructions).to.deep.equal(['finely chopped']);
    });
  });

  describe('instructions extraction', () => {
    it('captures adverb + instruction and removes from ingredient', () => {
      const result = parse('2 cloves garlic, finely chopped', 'eng');
      expect(result.ingredient).to.equal('garlic');
      expect(result.instructions).to.deep.equal(['finely chopped']);
      expect(result.additional).to.equal(null);
    });

    it('captures multiple instructions and keeps other flags', () => {
      const result = parse(
        'about 1 cup ripe tomatoes, peeled and diced',
        'eng',
      );
      expect(result.approx).to.equal(true);
      expect(result.ingredient).to.equal('tomatoes');
      expect(result.instructions).to.deep.equal(['ripe', 'peeled', 'diced']);
    });

    it('pulls instruction from parentheses and preserves optional', () => {
      const result = parse('1 cup olives (pitted) (optional)', 'eng');
      expect(result.optional).to.equal(true);
      expect(result.instructions).to.deep.equal(['pitted']);
      expect(result.ingredient).to.equal('olives');
      expect(result.additional).to.equal(null);
    });

    it('does not drop additional non-instruction notes', () => {
      const result = parse('1 cup nuts (toasted), finely chopped', 'eng');
      expect(result.instructions).to.deep.equal(['toasted', 'finely chopped']);
      expect(result.additional).to.equal(null);
    });
  });

  describe('alternatives and unit systems (opt-in)', () => {
    const opts = {includeAlternatives: true, includeUnitSystems: true};

    it('captures bracketed alternative unit with system tagging', () => {
      const result = parse('450g (1 lb) of tinned tomatoes', 'eng', opts);
      expect(result.unit).to.equal('gram');
      expect(result.unitSystem).to.equal('metric');
      expect(result.ingredient).to.equal('tinned tomatoes');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].unit).to.equal('pound');
      expect(result.alternatives[0].unitSystem).to.equal('imperial');
    });

    it('captures ml alternative and preserves primary ingredient', () => {
      const result = parse('1 cup oats (250 ml)', 'eng', opts);
      expect(result.unit).to.equal('cup');
      expect(result.unitSystem).to.equal('americanVolumetric');
      expect(result.ingredient).to.equal('oats');
      expect(result.alternatives[0].quantity).to.equal(250);
      expect(result.alternatives[0].unit).to.equal('milliliter');
      expect(result.alternatives[0].unitSystem).to.equal('metric');
    });

    it('captures slash alternative unit', () => {
      const result = parse('8 oz / 225g pasta', 'eng', opts);
      expect(result.unit).to.equal('ounce');
      expect(result.unitSystem).to.equal('imperial');
      expect(result.ingredient).to.equal('pasta');
      expect(result.alternatives[0].unit).to.equal('gram');
      expect(result.alternatives[0].quantity).to.equal(225);
    });

    it('captures alternative ingredient via or', () => {
      const result = parse('2 cups oats or quinoa', 'eng', opts);
      expect(result.ingredient).to.equal('oats');
      expect(result.alternatives[0].ingredient).to.equal('quinoa');
    });

    it('parses or-alternative with its own quantity and unit', () => {
      const result = parse(
        '1/4 teaspoon Cutting Edge Cultures - or 1/2 cup of kefir whey',
        'eng',
        opts,
      );
      expect(result.quantity).to.equal(0.25);
      expect(result.unit).to.equal('teaspoon');
      expect(result.ingredient).to.equal('Cutting Edge Cultures');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].quantity).to.equal(0.5);
      expect(result.alternatives[0].unit).to.equal('cup');
      expect(result.alternatives[0].ingredient).to.equal('kefir whey');
    });

    it('parses unicode half with or-alternative correctly', () => {
      const result = parse(
        '1/4 teaspoon Cutting Edge Cultures - or ½ cup of kefir whey',
        'eng',
        opts,
      );
      expect(result.quantity).to.equal(0.25);
      expect(result.unit).to.equal('teaspoon');
      expect(result.ingredient).to.equal('Cutting Edge Cultures');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].quantity).to.equal(0.5);
      expect(result.alternatives[0].unit).to.equal('cup');
      expect(result.alternatives[0].ingredient).to.equal('kefir whey');
    });

    it('parses mojibake half with or-alternative correctly', () => {
      const result = parse(
        '1/4 teaspoon Cutting Edge Cultures - or ¬Ω cup of kefir whey',
        'eng',
        opts,
      );
      expect(result.quantity).to.equal(0.25);
      expect(result.unit).to.equal('teaspoon');
      expect(result.ingredient).to.equal('Cutting Edge Cultures');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].quantity).to.equal(0.5);
      expect(result.alternatives[0].unit).to.equal('cup');
      expect(result.alternatives[0].ingredient).to.equal('kefir whey');
    });

    it('parses ampersand mixed fraction correctly', () => {
      const result = parse('1 & 1/2 Cups Water, room temperature', 'eng');
      expect(result.quantity).to.equal(1.5);
      expect(result.unit).to.equal('cup');
      expect(result.ingredient.toLowerCase()).to.equal('water');
      expect(result.minQty).to.equal(1.5);
      expect(result.maxQty).to.equal(1.5);
      expect(result.additional).to.equal('room temperature');
    });

    it('inherits quantity and unit for or-alternative without its own numbers', () => {
      const result = parse('75g yellow split peas or toor dal', 'eng', opts);
      expect(result.quantity).to.equal(75);
      expect(result.unit).to.equal('gram');
      expect(result.ingredient).to.equal('yellow split peas');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].quantity).to.equal(null);
      expect(result.alternatives[0].unit).to.equal(null);
      expect(result.alternatives[0].ingredient).to.equal('toor dal');
    });

    it('keeps alt ingredient only when no numbers present', () => {
      const res = parse('1/2 teaspoon black or white pepper', 'eng', opts);
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('teaspoon');
      expect(res.ingredient).to.equal('black');
      expect(res.alternatives?.[0].ingredient).to.equal('white pepper');
      expect(res.alternatives?.[0].quantity).to.equal(null);
      expect(res.alternatives?.[0].unit).to.equal(null);
      expect(res.alternatives?.[0].unitSystem).to.equal(null);
    });

    it('keeps alt quantity/unit when explicitly provided', () => {
      const res = parse(
        '1/2 teaspoon black or 1 tsp white pepper',
        'eng',
        opts,
      );
      expect(res.alternatives?.[0].quantity).to.equal(1);
      expect(res.alternatives?.[0].unit).to.equal('teaspoon');
      expect(res.alternatives?.[0].ingredient).to.equal('white pepper');
    });

    it('captures parenthetical alt unit without inheriting primary unit', () => {
      const res = parse('1/2 teaspoon (3g) black pepper', 'eng', opts);
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('teaspoon');
      expect(res.ingredient).to.equal('black pepper');
      expect(res.alternatives?.[0].quantity).to.equal(3);
      expect(res.alternatives?.[0].unit).to.equal('gram');
      expect(res.alternatives?.[0].ingredient).to.equal(null);
    });

    it('prefers unit-bearing second number and keeps alt ingredient', () => {
      const result = parse(
        '1 14-oz can storebought pizza sauce or homemade marinara sauce',
        'eng',
        opts,
      );
      expect(result.quantity).to.equal(14);
      expect(result.unit).to.equal('ounce');
      expect(result.ingredient).to.equal('storebought pizza sauce');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].quantity).to.equal(null);
      expect(result.alternatives[0].unit).to.equal(null);
      expect(result.alternatives[0].ingredient).to.equal('marinara sauce');
      expect(result.instructions).to.include('homemade');
    });

    it('parses half package with attached size descriptor cleanly', () => {
      const result = parse(
        '1/2 of a 3.5-ounce package prepared achiote seasoning',
        'eng',
        opts,
      );
      expect(result.quantity).to.equal(0.5);
      expect(result.unit).to.equal('pack');
      expect(result.ingredient).to.equal(
        '3.5-ounce prepared achiote seasoning',
      );
      expect(result.additional).to.equal(null);
    });

    it('promotes leftover text to ingredient after instruction stripping', () => {
      const res = parse(
        '120 grams chopped, roasted nuts (optional)',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(120);
      expect(res.unit).to.equal('gram');
      expect(res.ingredient).to.equal('nuts');
      expect(res.instructions).to.deep.equal(['chopped', 'roasted']);
      expect(res.optional).to.equal(true);
      expect(res.additional).to.equal(null);
    });

    it('keeps prep notes, avoids treating them as alternatives', () => {
      const res = parse(
        '8 ounces cold, unsalted butter, cut into 1-inch chunks (about 16 tablespoons; 225g)',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(8);
      expect(res.unit).to.equal('ounce');
      expect(res.ingredient).to.equal('butter');
      expect(res.instructions).to.include('cold');
      expect(res.instructions).to.include('unsalted');
      expect(res.additional).to.equal('cut into 1-inch chunks');
      expect(res.alternatives?.[0].unit).to.equal('tablespoon');
    });

    it('keeps weight range as additional when prefixed by count', () => {
      const result = parse('1 3-4 lb whole chicken', 'eng', opts);
      expect(result.quantity).to.equal(1);
      expect(result.unit).to.equal(null);
      expect(result.ingredient).to.equal('whole chicken');
      expect(result.additional).to.equal('3-4 lb');
    });

    it('keeps primary fraction and adds alt from parentheses', () => {
      const result = parse(
        '1/3 cup warm water (95 to 105 degrees F)',
        'eng',
        opts,
      );
      expect(result.quantity).to.equal(0.333);
      expect(result.unit).to.equal('cup');
      expect(result.ingredient).to.equal('water');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].quantity).to.equal(95);
      expect(result.alternatives[0].maxQty).to.equal(105);
    });

    it('does not leak alt units into primary ingredient', () => {
      const res = parse(
        '3 cup (750 ml) coconut water (Indonesian: air kelapa) (Note 1)',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(3);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('coconut water');
      expect(res.additional || '').to.contain('Indonesian: air kelapa');
      expect(res.additional || '').to.contain('Note 1');
      expect(res.alternatives?.[0].unit).to.equal('milliliter');
      expect(res.alternatives?.[0].ingredient).to.equal(null);
    });

    it('keeps mixed-number primary and ignores slash as fraction', () => {
      const result = parse('1 1/2 cups milk', 'eng', opts);
      expect(result.quantity).to.equal(1.5);
      expect(result.unit).to.equal('cup');
      expect(result.ingredient).to.equal('milk');
      expect(result.alternatives).to.be.undefined;
    });

    it('captures alt unit from parentheses with unicode fraction', () => {
      const result = parse(
        '23 grams (2½ tablespoons) medium-grind cornmeal',
        'eng',
        opts,
      );
      expect(result.quantity).to.equal(23);
      expect(result.unit).to.equal('gram');
      expect(result.ingredient).to.equal('medium-grind cornmeal');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].unit).to.equal('tablespoon');
      expect(result.alternatives[0].quantity).to.equal(2.5);
    });

    it('parses mixed teaspoon with apostrophe apostrophe noise', () => {
      const res = parse('1 dash ​​ground cinnamon', 'eng', opts);
      expect(res.quantity).to.equal(1);
      expect(res.unit).to.equal('dash');
      expect(res.ingredient).to.equal('cinnamon');
      expect(res.instructions).to.deep.equal(['ground']);
    });

    it('parses half-cup with zero-width punctuation intact', () => {
      const res = parse('½ cup raw honey', 'eng', opts);
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('honey');
      expect(res.instructions).to.include('raw');
    });

    it('parses 1⁄2 cup carrot with instruction', () => {
      const res = parse('1⁄2 cup carrot, shredded', 'eng', opts);
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('carrot');
      expect(res.instructions).to.deep.equal(['shredded']);
    });

    it('handles spaced slash fractions', () => {
      const res = parse('1 /2 cup Sprinkling Crumbs (page 237 )', 'eng', opts);
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('Sprinkling Crumbs');
    });

    it('parses mojibake fraction slash', () => {
      const res = parse('1 â„ 4 cup (60 mL) kefir or active whey', 'eng', opts);
      expect(res.quantity).to.equal(0.25);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('kefir');
      expect(res.alternatives?.[0].unit).to.equal('milliliter');
    });

    it('parses multiplier with slash alternative units', () => {
      const res = parse(
        '2 x 150g/5½oz salmon fillets, skinned and thinly sliced',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(300);
      expect(res.unit).to.equal('gram');
      expect(res.ingredient).to.equal('salmon fillets');
      expect(res.alternatives?.[0].quantity).to.equal(5.5);
      expect(res.alternatives?.[0].unit).to.equal('ounce');
    });

    it('keeps ingredient clean with leading alt size', () => {
      const res = parse(
        '1/2 1-pound package banana leaves, defrosted if frozen (optional)',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('pack');
      expect(res.ingredient).to.equal('1-pound banana leaves');
      expect(res.optional).to.equal(true);
    });
  });

  describe('broken2 regressions', () => {
    const opts = {includeAlternatives: true, includeUnitSystems: true};

    it('parses sized ginger piece with instructions', () => {
      const res = parse(
        '1 2½-inch piece ginger, peeled, finely grated',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(1);
      expect(res.unit).to.equal('piece');
      expect(res.ingredient).to.equal('ginger');
      expect(res.instructions).to.include.members(['peeled', 'finely grated']);
      expect(res.additional).to.contain('2½-inch');
    });

    it('marks optional to-taste fish sauce cleanly', () => {
      const res = parse('fish sauce optional, to taste', 'eng', opts);
      expect(res.optional).to.equal(true);
      expect(res.ingredient).to.equal('fish sauce');
      expect(res.toTaste).to.equal(true);
      expect(res.additional).to.equal(null);
    });

    it('keeps brussels sprouts instructions', () => {
      const res = parse(
        '1 pound Brussels sprouts trimmed and halved',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(1);
      expect(res.unit).to.equal('pound');
      expect(res.ingredient).to.equal('Brussels sprouts');
      expect(res.instructions).to.include.members(['trimmed', 'halved']);
    });

    it('stones cherries and keeps stalk note', () => {
      const res = parse(
        '450 g cherries - stalks removed and stoned',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(450);
      expect(res.unit).to.equal('gram');
      expect(res.ingredient).to.equal('cherries');
      expect(res.instructions).to.include('stoned');
      expect(res.additional).to.contain('stalks removed');
    });

    it('preserves to-taste chili powder range', () => {
      const res = parse(
        '¼ to ½ cup Chili powder (Gebhardt) to taste, the brand is important',
        'eng',
        opts,
      );
      expect(res.minQty).to.equal(0.25);
      expect(res.maxQty).to.equal(0.5);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('Chili powder');
      expect(res.additional).to.contain('Gebhardt');
      expect(res.toTaste).to.equal(true);
      expect(res.additional || '').to.not.contain('to taste');
    });

    it('handles garnish sticks without quantity', () => {
      const res = parse('cinnamon sticks for garnish', 'eng', opts);
      expect(res.quantity).to.equal(0);
      expect(res.unit).to.equal('stick');
      expect(res.ingredient).to.equal('cinnamon');
      expect(res.toServe).to.equal(true);
    });

    it('keeps ground tomatoes wording', () => {
      const res = parse(
        '85 grams cup plus 2 ground tomatoes, preferably 7/11 or DiNapoli',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(85);
      expect(res.unit).to.equal('gram');
      expect(res.ingredient).to.contain('tomato');
      expect(res.instructions).to.include('ground');
    });

    it('handles ml with generous cup note', () => {
      const res = parse(
        '60ml cup (generous) superfine granulated sugar',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(60);
      expect(res.unit).to.equal('milliliter');
      expect(res.ingredient).to.equal('superfine granulated sugar');
      expect(res.additional || '').to.contain('generous');
    });

    it('captures cup primary with gram alternative sugar', () => {
      const res = parse('3/4 cup/150 grams granulated sugar', 'eng', opts);
      expect(res.quantity).to.equal(0.75);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('granulated sugar');
      expect(res.alternatives?.[0].unit).to.equal('gram');
      expect(res.alternatives?.[0].quantity).to.equal(150);
    });

    it('captures cup primary with gram alternative almonds', () => {
      const res = parse('1/2 cup/45 grams sliced almonds', 'eng', opts);
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('almonds');
      expect(res.instructions).to.include('sliced');
      expect(res.alternatives?.[0].unit).to.equal('gram');
      expect(res.alternatives?.[0].quantity).to.equal(45);
    });

    it('captures milliliter alternative with canola note', () => {
      const res = parse(
        '1/4 cup/60 milliliters flavorless oil, such as canola',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(0.25);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('flavorless oil');
      expect(res.additional).to.contain('canola');
      expect(res.alternatives?.[0].unit).to.equal('milliliter');
      expect(res.alternatives?.[0].quantity).to.equal(60);
    });

    it('keeps to-taste pinch wording', () => {
      const res = parse('1 tbs pepper adjust to taste', 'eng', opts);
      expect(res.unit).to.equal('tablespoon');
      expect(res.ingredient).to.equal('pepper');
      expect(res.toTaste).to.equal(true);
      expect(res.additional).to.equal(null);
    });

    it('keeps to-taste pinch wording', () => {
      const res = parse('1 tbs pepper season to taste', 'eng', opts);
      expect(res.unit).to.equal('tablespoon');
      expect(res.ingredient).to.equal('pepper');
      expect(res.toTaste).to.equal(true);
      expect(res.additional).to.equal(null);
    });

    it('to taste with instructions', () => {
      const res = parse('Freshly ground black pepper, to taste', 'eng', opts);
      expect(res.unit).to.equal(null);
      expect(res.ingredient).to.equal('black pepper');
      expect(res.toTaste).to.equal(true);
      expect(res.additional).to.equal(null);
      expect(res.instructions).to.include.members(['Freshly ground']);
    });

    it('to taste with instructions', () => {
      const res = parse('Freshly ground black pepper (to taste)', 'eng', opts);
      expect(res.unit).to.equal(null);
      expect(res.ingredient).to.equal('black pepper');
      expect(res.toTaste).to.equal(true);
      expect(res.additional).to.equal(null);
      expect(res.instructions).to.include.members(['Freshly ground']);
    });

    it('cleans healthy pinch each', () => {
      const res = parse('1 healthy pinch each salt and pepper', 'eng', opts);
      expect(res.unit).to.equal('pinch');
      expect(res.ingredient).to.equal('salt and pepper');
    });

    it('handles large bag salad leaves', () => {
      const res = parse('1 large bag salad leaves', 'eng', opts);
      expect(res.quantity).to.equal(1);
      expect(res.unit).to.equal('bag');
      expect(res.ingredient).to.equal('salad leaves');
      expect(res.instructions).to.include('large');
    });

    it('parses lukewarm water grams', () => {
      const res = parse('152g lukewarm water', 'eng', opts);
      expect(res.quantity).to.equal(152);
      expect(res.unit).to.equal('gram');
      expect(res.ingredient).to.equal('water');
      expect(res.instructions).to.include('lukewarm');
    });

    it('parses uncooked semolina without partial leftovers', () => {
      const res = parse('1 cup uncooked semolina', 'eng', opts);
      expect(res.quantity).to.equal(1);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('semolina');
      expect(res.additional).to.equal(null);
      expect(res.instructions).to.deep.equal(['uncooked']);
    });

    it('omits instruction-only additional fragments', () => {
      const res = parse('3/4 cup water, lukewarm', 'eng', opts);
      expect(res.quantity).to.equal(0.75);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('water');
      expect(res.instructions).to.include('lukewarm');
      expect(res.additional).to.equal(null);
    });

    it('parses garlic cloves with or instructions', () => {
      const res = parse(
        '6 large cloves of garlic, diced or grated',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(6);
      expect(res.unit).to.equal('clove');
      expect(res.ingredient).to.equal('garlic');
      expect(res.instructions).to.include.members(['large', 'diced', 'grated']);
    });

    it('parses handfuls with additional greens list', () => {
      const res = parse(
        '8 large handfuls of greens, e.g. baby spinach, spinach, winter leaves, kale',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(8);
      expect(res.unit).to.equal('handful');
      expect(res.ingredient).to.equal('greens');
      expect(res.instructions).to.include('large');
      expect(res.additional || '').to.contain('baby spinach');
    });

    it('marks optional riboflavin pinch', () => {
      const res = parse(
        'Optional: Pinch of Riboflavin (this adds color, I just estimate it. A little goes a LONG way)',
        'eng',
        opts,
      );
      expect(res.optional).to.equal(true);
      expect(res.unit).to.equal('pinch');
      expect(res.ingredient).to.equal('Riboflavin');
      expect(res.additional || '').to.contain('adds color');
    });

    it('parses another sized ginger piece with instructions', () => {
      const res = parse(
        'One 1-inch piece ginger, peeled and thinly sliced',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(1);
      expect(res.unit).to.equal('piece');
      expect(res.ingredient).to.equal('ginger');
      expect(res.additional || '').to.contain('1-inch');
      expect(res.instructions).to.include.members(['peeled', 'thinly sliced']);
    });

    it('captures slices with gram alternative for sand ginger', () => {
      const res = parse('3 slices or ~2g sand ginger (沙姜)', 'eng', opts);
      expect(res.quantity).to.equal(3);
      expect(res.unit).to.equal('slice');
      expect(res.ingredient).to.equal('sand ginger');
      expect(res.alternatives?.[0].quantity).to.equal(2);
      expect(res.alternatives?.[0].unit).to.equal('gram');
    });

    it('handles garlic clove ranges', () => {
      const res = parse('3 or 4 garlic cloves, unpeeled', 'eng', opts);
      expect(res.unit).to.equal('clove');
      expect(res.minQty).to.equal(3);
      expect(res.maxQty).to.equal(4);
      expect(res.ingredient).to.equal('garlic');
    });

    it('keeps peppercorn instructions', () => {
      const res = parse(
        '2 tsp freshly ground or whole black peppercorns',
        'eng',
        opts,
      );
      expect(res.unit).to.equal('teaspoon');
      expect(res.ingredient).to.equal('black peppercorns');
      expect(res.instructions).to.include.members(['freshly ground', 'whole']);
    });

    it('parses raw chopped almonds', () => {
      const res = parse('480g raw almonds chopped coarsely', 'eng', opts);
      expect(res.quantity).to.equal(480);
      expect(res.unit).to.equal('gram');
      expect(res.ingredient).to.equal('almonds');
      expect(res.instructions).to.include.members(['raw', 'chopped']);
    });

    it('parses scant tablespoon scallion', () => {
      const res = parse(
        '1 scant tablespoon thinly sliced scallion (green and white)',
        'eng',
        opts,
      );
      expect(res.unit).to.equal('tablespoon');
      expect(res.ingredient).to.equal('scallion');
      expect(res.instructions).to.include('thinly sliced');
      expect(res.additional || '').to.contain('green and white');
    });

    it('handles small pack basil with garnish note', () => {
      const res = parse(
        'small pack basil, leaves picked, ¾ finely chopped and the rest left whole for garnish',
        'eng',
        opts,
      );
      expect(res.ingredient).to.equal('basil');
      expect(res.instructions).to.include('finely chopped');
      expect(res.instructions).to.include('whole');
      expect(res.toServe).to.equal(true);
    });

    it('handles small bunch chives snipped', () => {
      const res = parse('small bunch chives , snipped', 'eng', opts);
      expect(res.unit).to.equal('bunch');
      expect(res.ingredient).to.equal('chives');
      expect(res.instructions).to.include('snipped');
    });

    it('parses small bunch cilantro', () => {
      const res = parse('1 small bunch cilantro', 'eng', opts);
      expect(res.quantity).to.equal(1);
      expect(res.unit).to.equal('bunch');
      expect(res.ingredient).to.equal('cilantro');
      expect(res.instructions).to.include('small');
    });

    it('keeps spicy bean paste intact', () => {
      const res = parse(
        '2 tablespoons spicy bean paste douban jiang',
        'eng',
        opts,
      );
      expect(res.unit).to.equal('tablespoon');
      expect(res.ingredient).to.equal('spicy bean paste douban jiang');
    });

    it('parses hominy cans and drained instruction', () => {
      const res = parse('Three 15-ounce cans of hominy, drained', 'eng', opts);
      expect(res.unit).to.equal('can');
      expect(res.ingredient).to.equal('hominy');
      expect(res.instructions).to.include('drained');
    });

    it('parses dairy alternatives as alternatives', () => {
      const res = parse(
        '1/2 cup yogurt / vegan yogurt / coconut milk',
        'eng',
        opts,
      );
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('yogurt');
      expect(res.alternatives?.length).to.be.greaterThan(1);
    });
  });

  describe('multipliers and stacked quantities', () => {
    it('multiplies explicit x patterns', () => {
      const result = parse('2 x 100 g tomatoes', 'eng');
      expect(result.quantity).to.equal(200);
      expect(result.perItemQuantity).to.equal(100);
      expect(result.unit).to.equal('gram');
      expect(result.ingredient).to.equal('tomatoes');
      expect(result.multiplier).to.equal(2);
      expect(result.minQty).to.equal(200);
      expect(result.maxQty).to.equal(200);
    });

    it('multiplies compact x patterns', () => {
      const result = parse('3x250ml broth', 'eng');
      expect(result.quantity).to.equal(750);
      expect(result.perItemQuantity).to.equal(250);
      expect(result.unit).to.equal('milliliter');
      expect(result.ingredient).to.equal('broth');
      expect(result.multiplier).to.equal(3);
    });

    it('prefers the second number when it carries the unit', () => {
      const result = parse('1 1.8kg chicken', 'eng');
      expect(result.quantity).to.equal(1.8);
      expect(result.unit).to.equal('kilogram');
      expect(result.ingredient).to.equal('chicken');
    });
  });

  describe('brackets handling', () => {
    it('keeps nested bracket content intact in additional', () => {
      const result = parse('1 (14.5 oz (410g)) can tomatoes', 'eng');
      expect(result.additional).to.equal('14.5 oz (410g)');
    });

    it('cleans optional/to serve from additional but keeps other notes', () => {
      const result = parse(
        '(optional) finely chopped parsley (for garnish), to serve',
        'eng',
      );
      expect(result.optional).to.equal(true);
      expect(result.toServe).to.equal(true);
      expect(result.ingredient).to.equal('parsley');
      expect(result.additional).to.equal(null);
      expect(result.instructions).to.deep.equal(['finely chopped']);
    });
  });

  describe('multi-word unit edge cases', () => {
    it('parses "3 fl oz vegetable oil" correctly', () => {
      const result = parse('3 fl oz vegetable oil', 'eng');
      expect(result.quantity).to.equal(3);
      expect(result.unit).to.equal('floz');
      expect(result.ingredient).to.equal('vegetable oil');
    });
  });

  it('correctly parses range in middle of string', () => {
    expect(parse('Juice from 1–2 limes', 'eng')).to.deep.equal({
      quantity: 1,
      additional: null,
      originalString: 'Juice from 1–2 limes',
      unit: null,
      unitPlural: null,
      symbol: null,
      ingredient: 'Juice from limes',
      minQty: 1,
      maxQty: 2,
    });
  });

  it('correctly parses numbers in middle of string', () => {
    expect(
      parse(
        '2 cans full-fat coconut milk, 13.5 ounces, do not use “lite” – and if you like an even richer broth, add a third can.',
        'eng',
      ),
    ).to.deep.equal({
      quantity: 2,
      additional:
        '13.5 ounces, do not use “lite” – and if you like an even richer broth, add a third can.',
      originalString:
        '2 cans full-fat coconut milk, 13.5 ounces, do not use “lite” – and if you like an even richer broth, add a third can.',
      unit: 'can',
      unitPlural: 'cans',
      symbol: null,
      ingredient: 'full-fat coconut milk',
      minQty: 2,
      maxQty: 2,
    });
  });
});
