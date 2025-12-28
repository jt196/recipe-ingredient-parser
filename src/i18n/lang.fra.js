/**
 * French (Français) language data for recipe ingredient parser
 *
 * Structure:
 * - unitTranslations: French names/plurals for units defined in English
 * - All other data: French-specific linguistic data (prepositions, instructions, etc.)
 *
 * Unit metadata (system, unitType, conversionFactor, etc.) comes from English.
 * This file only provides French translations (names, plural, symbol).
 */

/**
 * French translations for units defined in English base (lang.eng.js).
 *
 * Keys are English canonical unit names.
 * Values contain French-specific data:
 * - names: Array of French unit name variants
 * - plural: French plural form
 * - symbol: French symbol (if different from English)
 */
export const unitTranslations = {
  gram: {
    names: ['gramme', 'g', 'g.'],
    singular: 'gramme',
    plural: 'grammes',
    symbol: 'g',
  },
  milligram: {
    names: ['milligramme', 'mg', 'mg.'],
    singular: 'milligramme',
    plural: 'milligrammes',
    symbol: 'mg',
  },
  kilogram: {
    names: ['kilogramme', 'kg', 'kg.'],
    singular: 'kilogramme',
    plural: 'kilogrammes',
    symbol: 'kg',
  },
  milliliter: {
    names: ['millilitre', 'ml', 'ml.'],
    singular: 'millilitre',
    plural: 'millilitres',
    symbol: 'ml',
  },
  liter: {
    names: ['litre', 'l', 'l.', 'lt'],
    singular: 'litre',
    plural: 'litres',
    symbol: 'l',
  },
  teaspoon: {
    names: ['cuillère à café', 'càc', 'cuillère-c', 'cc'],
    singular: 'cuillère à café',
    plural: 'cuillères à café',
    symbol: 'càc',
  },
  tablespoon: {
    names: ['cuillère à soupe', 'càs', 'cuillère-s', 'cs'],
    singular: 'cuillère à soupe',
    plural: 'cuillères à soupe',
    symbol: 'càs',
  },
  cup: {
    names: ['tasse', 't'],
    singular: 'tasse',
    plural: 'tasses',
    symbol: 't',
  },
  gallon: {
    names: ['gallon', 'gal'],
    singular: 'gallon',
    plural: 'gallons',
    symbol: 'gal',
  },
  ounce: {
    names: ['once', 'oz', 'oz.'],
    singular: 'once',
    plural: 'onces',
    symbol: 'oz',
  },
  floz: {
    names: ['once liquide', 'fl oz', 'fl. oz', 'once liquides'],
    singular: 'once liquide',
    plural: 'onces liquides',
    symbol: 'fl oz',
  },
  pint: {
    names: ['pinte', 'pt', 'pt.'],
    singular: 'pinte',
    plural: 'pintes',
    symbol: 'pt',
  },
  pound: {
    names: ['livre', 'lb', 'lb.', 'livres'],
    singular: 'livre',
    plural: 'livres',
    symbol: 'lb',
  },
  quart: {
    names: ['quart', 'qt', 'qt.'],
    singular: 'quart',
    plural: 'quarts',
    symbol: 'qt',
  },
  dozen: {
    names: ['douzaine'],
    singular: 'douzaine',
    plural: 'douzaines',
    symbol: 'dz',
  },
  piece: {
    names: ['pièce', 'pz', 'pz.'],
    singular: 'pièce',
    plural: 'pièces',
    symbol: 'pz',
  },
  pinch: {
    names: ['pincée', 'pincées'],
    singular: 'pincée',
    plural: 'pincées',
    symbol: '',
  },
  drop: {
    names: ['goutte', 'gouttes'],
    singular: 'goutte',
    plural: 'gouttes',
    symbol: '',
  },
  drizzle: {
    names: ['trait', 'traits'],
    singular: 'trait',
    plural: 'traits',
    symbol: '',
  },
  slice: {
    names: ['tranche', 'tranches'],
    singular: 'tranche',
    plural: 'tranches',
    symbol: '',
  },
  clove: {
    names: ['gousse', "gousse d'ail"],
    singular: 'gousse',
    plural: 'gousses',
    symbol: '',
  },
  handful: {
    names: ['poignée', 'poignées'],
    singular: 'poignée',
    plural: 'poignées',
    symbol: '',
  },
  bunch: {
    names: ['botte', 'bottes'],
    singular: 'botte',
    plural: 'bottes',
    symbol: '',
  },
  serving: {
    names: ['portion', 'portions'],
    singular: 'portion',
    plural: 'portions',
    symbol: '',
  },
  can: {
    names: ['conserve', 'boîte de conserve'],
    singular: 'conserve',
    plural: 'conserves',
    symbol: '',
  },
  bottle: {
    names: ['bouteille', 'bt', 'bt.'],
    singular: 'bouteille',
    plural: 'bouteilles',
    symbol: 'bt',
  },
  pack: {
    names: ['paquet', 'pkt', 'paquets'],
    singular: 'paquet',
    plural: 'paquets',
    symbol: 'pkt',
  },
  bag: {
    names: ['sac'],
    singular: 'sac',
    plural: 'sacs',
    symbol: '',
  },
  box: {
    names: ['boîte', 'boites'],
    singular: 'boîte',
    plural: 'boîtes',
    symbol: '',
  },
  container: {
    names: ['récipient', 'récipients'],
    singular: 'récipient',
    plural: 'récipients',
    symbol: '',
  },
  stick: {
    names: ['barre'],
    singular: 'barre',
    plural: 'barres',
    symbol: '',
  },
  inch: {
    names: ['pouce', 'po', 'pouces'],
    singular: 'pouce',
    plural: 'pouces',
    symbol: 'po',
  },
  centimetre: {
    names: ['centimètre', 'cm', 'cm.'],
    singular: 'centimètre',
    plural: 'centimètres',
    symbol: 'cm',
  },
  ear: {
    names: ['oreille', 'oreilles'],
    singular: 'oreille',
    plural: 'oreilles',
    symbol: '',
  },
  few: {
    names: ['peu'],
    singular: 'peu',
    plural: 'peu',
    symbol: '',
  },
  knob: {
    names: ['bouton'],
    singular: 'bouton',
    plural: 'boutons',
    symbol: '',
  },
  thumb: {
    names: ['pouce'],
    singular: 'pouce',
    plural: 'pouces',
    symbol: '',
  },
};

const prepositions = ['de'];
const joiners = ['à'];
const toTaste = ['selon le goût'];
const toTasteAdditional = [
  'plus',
  'ajuster',
  'assaisonner',
  'ou',
  'ou plus',
  'encore un peu',
];
const additionalStopwords = [];
const approx = [
  'env.',
  'environ',
  'approx',
  'approx.',
  'approximativement',
  'presque',
  '~',
];
const optional = ['optionnel', 'facultatif', 'si désiré'];
const toServe = ['pour servir', 'pour garnir', 'garnir', 'décorer'];
const instructions = [
  'haché',
  'coupé en dés',
  'en tranches',
  'émincé',
  'coupé',
  'écrasé',
  'râpé',
  'en julienne',
  'coupé en deux',
  'pelé',
  'dénoyauté',
  'épépiné',
  'rincé',
  'bien rincé',
  'égoutté',
  'bien égoutté',
  'pressé',
  'fondu',
  'ramolli',
  'tiède',
  'chaud',
  'froid',
  'refroidi',
  'glacé',
  'mûr',
  'entier',
  'bouilli',
  'mollet',
  'dur',
  'poché',
  'moulu',
  'grillé',
  'rôti',
  'cuit au four',
  'sauté',
  'poêlé',
  'caramélisé',
  'doré',
  'décongelé',
  'mariné',
  'trempé',
  'blanchi',
  'effiloché',
  'déchiré',
  'mixé',
  'battu',
  'mélangé',
  'remué',
  'paré',
  'équeuté',
  'équeutées',
  'coupé en cubes',
  'zesté',
  'pressé',
  'sec',
  'nivelé',
  'nivelé',
  'acheté en magasin',
  'à température ambiante',
  'pour le graissage',
  'pour graisser la boîte',
  'pour la poêle',
  'lapidé',
  'cuit',
  'en miettes',
  'croustillant',
  'croustillant',
  'séché',
  'séché à sec',
  'emballé',
  'frais',
  'bonne qualité',
  'entassé',
  'copieux',
  'fait maison',
  'glacé',
  'glacé',
  'jus de',
  'pour la friture',
  'réservé',
  'brut',
  'salé',
  'non salé',
  'épais',
  'mince',
  'coupe épaisse',
  'non sucré',
  'non assaisonné',
  'non ciré',
  'tendre',
  'pressé',
  'jus',
  'zesté',
  'cassé',
  'fissuré',
  'déveiné',
  'décortiqué',
  'en cubes',
  'déchiré',
];
const adverbs = [
  'finement',
  'grossièrement',
  'finement tranché',
  'fraîchement',
  'fermement',
];

const numbersSmall = {
  zéro: 0,
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
  onze: 11,
  douze: 12,
  treize: 13,
  quatorze: 14,
  quinze: 15,
  seize: 16,
  'dix-sept': 17,
  'dix-huit': 18,
  'dix-neuf': 19,
  vingt: 20,
  trente: 30,
  quarante: 40,
  cinquante: 50,
  soixante: 60,
  'soixante-dix': 70,
  'quatre-vingts': 80,
  'quatre-vingt-dix': 90,
};

const numbersMagnitude = {
  cent: 100,
  mille: 1000,
  million: 1000000,
  milliard: 1000000000,
  billion: 1000000000000,
};

const problematicUnits = {
  clove: ['ail'],
  // Add more problematic units here if needed
};

export const langFra = {
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
  isCommaDelimited: true,
};
