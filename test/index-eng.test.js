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
    it('of "to taste of water"', () => {
      expect(parse('to taste of water', 'eng').unit).to.equal('t.t.');
    });
    it('of "To taste of water"', () => {
      expect(parse('To taste of water', 'eng').unit).to.equal('t.t.');
    });
    it('of "t.t. of water"', () => {
      expect(parse('t.t. of water', 'eng').unit).to.equal('t.t.');
    });
    it('of "t.t. of water"', () => {
      expect(parse('t.t. of water', 'eng').unit).to.equal('t.t.');
    });
    it('of "TT of water"', () => {
      expect(parse('TT of water', 'eng').unit).to.equal('t.t.');
    });
    it('of "TT. of water"', () => {
      expect(parse('TT. of water', 'eng').unit).to.equal('t.t.');
    });
    it('of "T.t of water"', () => {
      expect(parse('T.t of water', 'eng').unit).to.equal('t.t.');
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
      it('does not detect words containing the same characters', () => {
        expect(parse('100g of butter', 'eng').unit).to.equal('gram');
        expect(parse('100g of butter', 'eng').ingredient).to.equal('butter');
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
          expect(result.ingredient).to.equal('fresh coriander');
          expect(result.additional).to.equal(null);
        });
      });
    });

    describe('translates teaspoons correctly', () => {
      const teaspoon = {
        ingredient: 'salt',
        maxQty: 1,
        minQty: 1,
        quantity: 1,
        additional: 'more to taste',
        originalString: '1 teaspoon salt, more to taste',
        symbol: 'tsp',
        unit: 'teaspoon',
        unitPlural: 'teaspoons',
      };
      it('of "1 teaspoon salt, more to taste"', () => {
        expect(parse('1 teaspoon salt, more to taste', 'eng')).to.deep.equal(
          teaspoon,
        );
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
      expect(parse('500 millilitres water', 'eng').unit).to.equal(
        'milliliter',
      );
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
      expect(parse('1 package sausage', 'eng').unit).to.equal('package');
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
      expect(result.ingredient).to.equal('water');
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
      expect(result.additional).to.equal('for garnish');
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
      const result = parse('about 1 cup ripe tomatoes, peeled and diced', 'eng');
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
      const result = parse(
        '450g (1 lb) of tinned tomatoes',
        'eng',
        opts,
      );
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

    it('keeps primary fraction and adds alt from parentheses', () => {
      const result = parse('1/3 cup warm water (95 to 105 degrees F)', 'eng', opts);
      expect(result.quantity).to.equal(0.333);
      expect(result.unit).to.equal('cup');
      expect(result.ingredient).to.equal('water');
      expect(result.alternatives).to.have.length(1);
      expect(result.alternatives[0].quantity).to.equal(95);
      expect(result.alternatives[0].maxQty).to.equal(105);
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
      expect(res.ingredient).to.equal('raw honey');
    });

    it('parses 1⁄2 cup carrot with instruction', () => {
      const res = parse('1⁄2 cup carrot, shredded', 'eng', opts);
      expect(res.quantity).to.equal(0.5);
      expect(res.unit).to.equal('cup');
      expect(res.ingredient).to.equal('carrot');
      expect(res.instructions).to.deep.equal(['shredded']);
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
      expect(result.additional).to.equal('for garnish');
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
