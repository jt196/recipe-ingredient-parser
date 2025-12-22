import {expect} from 'chai';
import {combine} from '../src/index';

/* global expect, it, describe */

describe('combine ingredients', () => {
  it('accepts an empty array', () => {
    expect(combine([])).to.deep.equal([]);
  });

  it('returns sorted ingredients', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'apples',
        quantity: 2,
        unit: 'pound',
        symbol: 'lb',
        minQty: 2,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'apples',
        quantity: 2,
        unit: 'pound',
        symbol: 'lb',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
    ]);
  });

  it('combines two ingredient objects into one', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'butter',
        quantity: 4,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 4,
        maxQty: 4,
      },
    ]);
  });

  it('combines three ingredient objects into one', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'butter',
        quantity: 6,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 6,
        maxQty: 6,
      },
    ]);
  });

  it('combines four ingredient objects into two', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'apple',
        quantity: 2,
        unit: 'pound',
        symbol: 'lb',
        minQty: 2,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'apple',
        quantity: 2,
        unit: 'pound',
        symbol: 'lb',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 6,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 6,
        maxQty: 6,
      },
    ]);
  });

  it('combines 2 ingredients that have a quantity range', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 3,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 1,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'butter',
        quantity: 4,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 3,
        maxQty: 5,
      },
    ]);
  });

  it('combines 1 ingredient with no range, and 1 with a range', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 10,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 1,
        maxQty: 10,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'butter',
        quantity: 12,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 3,
        maxQty: 12,
      },
    ]);
  });

  it('combines 2 ingredient with a range, and 1 different ingredient without a range', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 10,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 1,
        maxQty: 10,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'apple',
        quantity: 2,
        unit: null,
        symbol: null,
        minQty: 2,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'apple',
        quantity: 2,
        unit: null,
        symbol: null,
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 12,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 3,
        maxQty: 12,
      },
    ]);
  });

  it('does not combine if ingredients have different units (for now)', () => {
    const ingredientArray = [
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 2,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 1,
        unit: 'stick',
        symbol: null,
        minQty: 1,
        maxQty: 1,
      },
      {
        ingredient: 'apple',
        quantity: 2,
        unit: 'pound',
        symbol: 'lb',
        minQty: 2,
        maxQty: 2,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'apple',
        quantity: 2,
        unit: 'pound',
        symbol: 'lb',
        minQty: 2,
        maxQty: 2,
      },
      {
        ingredient: 'butter',
        quantity: 4,
        unit: 'tablespoon',
        symbol: 'tbs',
        minQty: 4,
        maxQty: 4,
      },
      {
        ingredient: 'butter',
        quantity: 1,
        unit: 'stick',
        symbol: null,
        minQty: 1,
        maxQty: 1,
      },
    ]);
  });

  it('handles the no-unit case', () => {
    const ingredientArray = [
      {
        ingredient: 'tortilla',
        quantity: 10,
        unit: null,
        symbol: null,
        minQty: 10,
        maxQty: 10,
      },
      {
        ingredient: 'tortilla',
        quantity: 5,
        unit: null,
        symbol: null,
        minQty: 5,
        maxQty: 5,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'tortilla',
        quantity: 15,
        unit: null,
        symbol: null,
        minQty: 15,
        maxQty: 15,
      },
    ]);
  });

  it('handles the no-unit and no-quantity case', () => {
    const ingredientArray = [
      {
        ingredient: 'Powdered Sugar',
        quantity: 0,
        unit: null,
        symbol: null,
        minQty: 0,
        maxQty: 0,
      },
      {
        ingredient: 'Powdered Sugar',
        quantity: 0,
        unit: null,
        symbol: null,
        minQty: 0,
        maxQty: 0,
      },
    ];
    expect(combine(ingredientArray)).to.deep.equal([
      {
        ingredient: 'Powdered Sugar',
        quantity: 0,
        unit: null,
        symbol: null,
        minQty: 0,
        maxQty: 0,
      },
    ]);
  });
});
