/**
 * Spanish (Español) language data for recipe ingredient parser
 *
 * Structure:
 * - unitTranslations: Spanish names/plurals for units defined in English
 * - All other data: Spanish-specific linguistic data (prepositions, instructions, etc.)
 *
 * Unit metadata (system, unitType, conversionFactor, etc.) comes from English.
 * This file only provides Spanish translations (names, plural, symbol).
 */

export const unitTranslations = {
  clove: {
    names: ['diente', 'diente de ajo'],
    singular: 'diente',
    plural: 'dientes',
    symbol: '',
  },
  gallon: {
    names: ['galón', 'gal'],
    singular: 'galón',
    plural: 'galones',
    symbol: 'gal',
  },
  ounce: {
    names: ['onza', 'oz', 'oz.'],
    singular: 'onza',
    plural: 'onzas',
    symbol: 'oz',
  },
  floz: {
    names: ['onza fluida', 'onz. fluida', 'fl oz', 'fl. oz', 'fluid ounce', 'fluid ounces'],
    singular: 'onza fluida',
    plural: 'onzas fluidas',
    symbol: 'fl oz',
  },
  pint: {
    names: ['pinta', 'pt', 'pt.'],
    singular: 'pinta',
    plural: 'pintas',
    symbol: 'pt',
  },
  pound: {
    names: ['libra', 'lb', 'lb.', 'libras'],
    singular: 'libra',
    plural: 'libras',
    symbol: 'lb',
  },
  quart: {
    names: ['cuarto', 'qt', 'qt.'],
    singular: 'cuarto',
    plural: 'cuartos',
    symbol: 'qt',
  },
  tablespoon: {
    names: ['cucharada', 'cda', 'cda.'],
    singular: 'cucharada',
    plural: 'cucharadas',
    symbol: 'cda',
  },
  teaspoon: {
    names: ['cucharadita', 'cdta', 'cdta.'],
    singular: 'cucharadita',
    plural: 'cucharaditas',
    symbol: 'cdta',
  },
  gram: {
    names: ['gramo', 'g', 'g.'],
    singular: 'gramo',
    plural: 'gramos',
    symbol: 'g',
  },
  kilogram: {
    names: ['kilogramo', 'kg', 'kg.'],
    singular: 'kilogramo',
    plural: 'kilogramos',
    symbol: 'kg',
  },
  liter: {
    names: ['litro', 'l', 'l.', 'lt'],
    singular: 'litro',
    plural: 'litros',
    symbol: 'l',
  },
  milligram: {
    names: ['miligramo', 'mg', 'mg.'],
    singular: 'miligramo',
    plural: 'miligramos',
    symbol: 'mg',
  },
  milliliter: {
    names: ['mililitro', 'ml', 'ml.'],
    singular: 'mililitro',
    plural: 'mililitros',
    symbol: 'ml',
  },
  pack: {
    names: ['paquete', 'pqt', 'pqt.', 'paquetes'],
    singular: 'paquete',
    plural: 'paquetes',
    symbol: 'pqt',
  },
  bag: {
    names: ['bolsa', 'blsa'],
    singular: 'bolsa',
    plural: 'bolsas',
    symbol: '',
  },
  box: {
    names: ['caja'],
    singular: 'caja',
    plural: 'cajas',
    symbol: '',
  },
  bottle: {
    names: ['botella', 'btl', 'btl.'],
    singular: 'botella',
    plural: 'botellas',
    symbol: 'bt',
  },
  container: {
    names: ['envase', 'envases'],
    singular: 'envase',
    plural: 'envases',
    symbol: '',
  },
  can: {
    names: ['lata', 'latas'],
    singular: 'lata',
    plural: 'latas',
    symbol: '',
  },
  cup: {
    names: ['taza', 'tz', 'tz.'],
    singular: 'taza',
    plural: 'tazas',
    symbol: 'tz',
  },
  stick: {
    names: ['barra'],
    singular: 'barra',
    plural: 'barras',
    symbol: '',
  },
  dozen: {
    names: ['docena'],
    singular: 'docena',
    plural: 'docenas',
    symbol: 'doc',
  },
  piece: {
    names: ['pieza', 'pz', 'pz.'],
    singular: 'pieza',
    plural: 'piezas',
    symbol: 'pz',
  },
  pinch: {
    names: ['pizca', 'pizcas'],
    singular: 'pizca',
    plural: 'pizcas',
    symbol: '',
  },
  drop: {
    names: ['gota', 'gotas'],
    singular: 'gota',
    plural: 'gotas',
    symbol: '',
  },
  drizzle: {
    names: ['chorrito', 'chorritos', 'llovizna'],
    singular: 'chorrito',
    plural: 'chorritos',
    symbol: '',
  },
  slice: {
    names: ['rebanada', 'rebanadas'],
    singular: 'rebanada',
    plural: 'rebanadas',
    symbol: '',
  },
  handful: {
    names: ['puñado', 'puñados'],
    singular: 'puñado',
    plural: 'puñados',
    symbol: '',
  },
  bunch: {
    names: ['manojo', 'manojos', 'ramo', 'ramos'],
    singular: 'manojo',
    plural: 'manojos',
    symbol: '',
  },
  serving: {
    names: ['porción', 'porciones', 'porcion'],
    singular: 'porción',
    plural: 'porciones',
    symbol: '',
  },
  inch: {
    names: ['pulgada', 'pulg.', 'pulgadas'],
    singular: 'pulgada',
    plural: 'pulgadas',
    symbol: 'pulg.',
  },
  centimetre: {
    names: ['centímetro', 'centimetro', 'cm', 'cm.'],
    singular: 'centímetro',
    plural: 'centímetros',
    symbol: 'cm',
  },
  ear: {
    names: ['oreja', 'orejas'],
    singular: 'oreja',
    plural: 'orejas',
    symbol: '',
  },
  few: {
    names: ['pocos'],
    singular: 'poco',
    plural: 'pocos',
    symbol: '',
  },
  knob: {
    names: ['perilla'],
    singular: 'perilla',
    plural: 'perillas',
    symbol: '',
  },
  thumb: {
    names: ['pulgar'],
    singular: 'pulgar',
    plural: 'pulgares',
    symbol: '',
  },
};

const prepositions = ['de'];

const joiners = ['a'];

const toTaste = ['al gusto'];

const toTasteAdditional = ['más', 'ajustar', 'sazonar', 'o', 'o más', 'un poco más'];

const additionalStopwords = [];

const optional = ['opcional', 'si se desea', 'a elección'];

const toServe = ['para servir', 'para decorar', 'para adornar', 'decorar'];

const approx = [
  'aprox',
  'aprox.',
  'aproximadamente',
  'cerca de',
  'alrededor de',
  'sobre',
  '~',
];

const instructions = [
  'picado',
  'cortado en cubos',
  'en rodajas',
  'rebanado',
  'cortado',
  'triturado',
  'machacado',
  'rallado',
  'en juliana',
  'partido por la mitad',
  'pelado',
  'sin hueso',
  'sin semillas',
  'enjuagado',
  'bien enjuagado',
  'escurrido',
  'bien escurrido',
  'prensado',
  'derretido',
  'suavizado',
  'tibio',
  'caliente',
  'frío',
  'enfriado',
  'helado',
  'maduro',
  'entero',
  'hervido',
  'pasado por agua',
  'duro cocido',
  'pochado',
  'molido',
  'tostado',
  'asado',
  'horneado',
  'a la parrilla',
  'frito',
  'sellado',
  'caramelizado',
  'dorado',
  'descongelado',
  'marinado',
  'remojado',
  'escaldado',
  'deshebrado',
  'estrujado',
  'hecho puré',
  'batido',
  'mezclado',
  'revuelto',
  'recortado',
  'desvenado',
  'en cubos',
  'desmenuzado',
  'pequeño',
  'mediano',
  'grande',
  'exprimido',
  'zesteado',
  'seco',
  'nivelado',
  'comprado en la tienda',
  'a temperatura ambiente',
  'para engrasar',
  'para engrasar la lata',
  'para la sartén',
  'drogado',
  'cocido',
  'se desmoronó',
  'crujiente',
  'curado en seco',
  'lleno',
  'fresco',
  'buena calidad',
  'casero',
  'amontonado',
  'abundante',
  'jugo de',
  'para freír',
  'reservado',
  'crudo',
  'salado',
  'sin sal',
  'grueso',
  'delgado',
  'corte grueso',
  'sin azúcar',
  'sin condimentar',
  'sin encerar',
  'licitación',
  'exprimido',
  'jugo',
  'entusiasmado',
  'roto',
  'agrietado',
  'desvenado',
  'descascarado',
  'cubicado',
  'rasgado',
];

const adverbs = ['finamente', 'gruesamente', 'delgadamente', 'recién', 'firmemente'];

const numbersSmall = {
  cero: 0,
  uno: 1,
  una: 1,
  un: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciséis: 16,
  dieciseis: 16, // without accent
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
};

const numbersMagnitude = {
  cien: 100,
  mil: 1000,
  millón: 1000000,
  millon: 1000000, // without accent
  'mil millones': 1000000000,
  billón: 1000000000000,
  billon: 1000000000000, // without accent
};

export const problematicUnits = {
  clove: ['ajo'],
  // Add more problematic units here as needed
};

export const langEsp = {
  unitTranslations,
  prepositions,
  joiners,
  toTaste,
  toTasteAdditional,
  additionalStopwords,
  optional,
  toServe,
  instructions,
  adverbs,
  approx,
  numbersSmall,
  numbersMagnitude,
  problematicUnits,
  isCommaDelimited: true,
};
