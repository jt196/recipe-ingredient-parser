/**
 * Portuguese (Português) language data for recipe ingredient parser
 *
 * Structure:
 * - unitTranslations: Portuguese names/plurals for units defined in English
 * - All other data: Portuguese-specific linguistic data (prepositions, instructions, etc.)
 *
 * Unit metadata (system, unitType, conversionFactor, etc.) comes from English.
 * This file only provides Portuguese translations (names, plural, symbol).
 */

/**
 * Portuguese translations for units defined in English base (lang.eng.js).
 *
 * Keys are English canonical unit names.
 * Values contain Portuguese-specific data:
 * - names: Array of Portuguese unit name variants
 * - plural: Portuguese plural form
 * - symbol: Portuguese symbol (if different from English)
 */
export const unitTranslations = {
  gram: {
    names: ['grama', 'g', 'g.'],
    singular: 'grama',
    plural: 'gramas',
    symbol: 'g',
  },
  milligram: {
    names: ['miligrama', 'mg', 'mg.'],
    singular: 'miligrama',
    plural: 'miligramas',
    symbol: 'mg',
  },
  kilogram: {
    names: ['quilo', 'kg', 'kg.'],
    singular: 'quilo',
    plural: 'quilos',
    symbol: 'kg',
  },
  milliliter: {
    names: ['mililitro', 'ml', 'ml.'],
    singular: 'mililitro',
    plural: 'mililitros',
    symbol: 'ml',
  },
  liter: {
    names: ['litro', 'l', 'l.', 'lt'],
    singular: 'litro',
    plural: 'litros',
    symbol: 'l',
  },
  teaspoon: {
    names: ['colher de chá', 'c.c.', 'cc'],
    singular: 'colher de chá',
    plural: 'colheres de chá',
    symbol: 'c.c.',
  },
  tablespoon: {
    names: ['colher de sopa', 'c.s.', 'cs'],
    singular: 'colher de sopa',
    plural: 'colheres de sopa',
    symbol: 'c.s.',
  },
  cup: {
    names: ['xícara', 'xicara'],
    singular: 'xícara',
    plural: 'xícaras',
    symbol: 'xic',
  },
  gallon: {
    names: ['galão', 'gal', 'gal.'],
    singular: 'galão',
    plural: 'galões',
    symbol: 'gal',
  },
  ounce: {
    names: ['onça', 'oz', 'oz.'],
    singular: 'onça',
    plural: 'onças',
    symbol: 'oz',
  },
  floz: {
    names: ['onça fluida', 'fl oz', 'fl. oz', 'onças fluidas'],
    singular: 'onça fluida',
    plural: 'onças fluidas',
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
    names: ['quarto', 'qt', 'qt.'],
    singular: 'quarto',
    plural: 'quartos',
    symbol: 'qt',
  },
  dozen: {
    names: ['dúzia', 'duzia'],
    singular: 'dúzia',
    plural: 'dúzias',
    symbol: 'dz',
  },
  piece: {
    names: ['pedaço', 'pç', 'pç.'],
    singular: 'pedaço',
    plural: 'pedaços',
    symbol: 'pç',
  },
  pinch: {
    names: ['pitada'],
    singular: 'pitada',
    plural: 'pitadas',
    symbol: '',
  },
  drop: {
    names: ['gota', 'gotas'],
    singular: 'gota',
    plural: 'gotas',
    symbol: '',
  },
  drizzle: {
    names: ['borrifo', 'borrifos'],
    singular: 'borrifo',
    plural: 'borrifos',
    symbol: '',
  },
  slice: {
    names: ['fatia', 'fatias'],
    singular: 'fatia',
    plural: 'fatias',
    symbol: '',
  },
  clove: {
    names: ['dente', 'dente de alho'],
    singular: 'dente',
    plural: 'dentes',
    symbol: '',
  },
  handful: {
    names: ['punhado', 'punhados'],
    singular: 'punhado',
    plural: 'punhados',
    symbol: '',
  },
  bunch: {
    names: ['maço', 'maços', 'ramo', 'ramos'],
    singular: 'maço',
    plural: 'maços',
    symbol: '',
  },
  serving: {
    names: ['porção', 'porções', 'porcao', 'porcoes'],
    singular: 'porção',
    plural: 'porções',
    symbol: '',
  },
  can: {
    names: ['lata', 'latas'],
    singular: 'lata',
    plural: 'latas',
    symbol: '',
  },
  bottle: {
    names: ['garrafa', 'grf'],
    singular: 'garrafa',
    plural: 'garrafas',
    symbol: 'grf',
  },
  pack: {
    names: ['pacote', 'pct', 'pac.', 'pacotes'],
    singular: 'pacote',
    plural: 'pacotes',
    symbol: 'pct',
  },
  bag: {
    names: ['saco'],
    singular: 'saco',
    plural: 'sacos',
    symbol: '',
  },
  box: {
    names: ['caixa'],
    singular: 'caixa',
    plural: 'caixas',
    symbol: '',
  },
  container: {
    names: ['recipiente', 'recip.'],
    singular: 'recipiente',
    plural: 'recipientes',
    symbol: '',
  },
  stick: {
    names: ['barra'],
    singular: 'barra',
    plural: 'barras',
    symbol: '',
  },
  inch: {
    names: ['polegada', 'pol', 'pol.'],
    singular: 'polegada',
    plural: 'polegadas',
    symbol: 'pol',
  },
  centimetre: {
    names: ['centímetro', 'centimetro', 'cm', 'cm.'],
    singular: 'centímetro',
    plural: 'centímetros',
    symbol: 'cm',
  },
  ear: {
    names: ['orelha', 'orelhas'],
    singular: 'orelha',
    plural: 'orelhas',
    symbol: '',
  },
  few: {
    names: ['alguns'],
    singular: 'algum',
    plural: 'alguns',
    symbol: '',
  },
  knob: {
    names: ['botão'],
    singular: 'botão',
    plural: 'botões',
    symbol: '',
  },
  thumb: {
    names: ['dedão'],
    singular: 'dedão',
    plural: 'dedões',
    symbol: '',
  },
  // Time units
  second: {
    names: ['segundo', 'segundos', 'seg', 'seg.', 's'],
    singular: 'segundo',
    plural: 'segundos',
    symbol: 's',
  },
  minute: {
    names: ['minuto', 'minutos', 'min', 'min.', 'm'],
    singular: 'minuto',
    plural: 'minutos',
    symbol: 'min',
  },
  hour: {
    names: ['hora', 'horas', 'h'],
    singular: 'hora',
    plural: 'horas',
    symbol: 'h',
  },
  // Temperature units
  celsius: {
    names: ['celsius', 'centígrados', 'C', '°C', 'ºC', 'graus C', 'graus celsius'],
    singular: 'celsius',
    plural: 'celsius',
    symbol: '°C',
  },
  fahrenheit: {
    names: ['fahrenheit', 'F', '°F', 'ºF', 'graus F', 'graus fahrenheit'],
    singular: 'fahrenheit',
    plural: 'fahrenheit',
    symbol: '°F',
  },
};

const prepositions = ['de'];
const joiners = ['a'];
const toTaste = ['a gosto'];
const toTasteAdditional = [
  'mais',
  'ajustar',
  'temperar',
  'ou',
  'ou mais',
  'um pouco mais',
];
const additionalStopwords = [];
const approx = [
  'aprox',
  'aprox.',
  'aproximadamente',
  'cerca de',
  'por volta de',
  'quase',
  '~',
];
const optional = ['opcional', 'se desejado'];
const toServe = ['para servir', 'para enfeitar', 'enfeitar', 'decorar'];
const instructions = [
  'picado',
  'cortado em cubos',
  'fatiado',
  'cortado',
  'triturado',
  'amassado',
  'ralado',
  'em tiras',
  'cortado ao meio',
  'descascado',
  'sem caroço',
  'sem sementes',
  'enxaguado',
  'bem enxaguado',
  'escorrido',
  'bem escorrido',
  'prensado',
  'derretido',
  'amolecido',
  'morno',
  'quente',
  'frio',
  'resfriado',
  'gelado',
  'maduro',
  'inteiro',
  'fervido',
  'cozido',
  'ovo mole',
  'ovo duro',
  'pochê',
  'moído',
  'torrado',
  'assado',
  'grelhado',
  'frito',
  'selado',
  'caramelizado',
  'dourado',
  'descongelado',
  'marinado',
  'demolhado',
  'branqueado',
  'desfiado',
  'espremido',
  'em purê',
  'batido',
  'misturado',
  'mexido',
  'pequeno',
  'médio',
  'grande',
  'aparado',
  'sem talo',
  'em cubos',
  'rasgado',
  'quebrado',
  'espremido',
  'com raspas',
  'seco',
  'nivelado',
  'nivelado',
  'comprado em loja',
  'à temperatura ambiente',
  'para lubrificação',
  'para untar a lata',
  'para a panela',
  'apedrejado',
  'cozido',
  'desmoronou',
  'crocante',
  'nítido',
  'seco',
  'curado a seco',
  'embalado',
  'fresco',
  'de boa qualidade',
  'amontoado',
  'saudável',
  'caseiro',
  'gelado',
  'gelado',
  'suco de',
  'para fritar',
  'reservado',
  'cru',
  'salgado',
  'sem sal',
  'espesso',
  'afinar',
  'corte grosso',
  'sem açúcar',
  'sem tempero',
  'não encerado',
  'macio',
  'espremido',
  'suco',
  'entusiasmado',
  'quebrado',
  'rachado',
  'desenvolvido',
  'descascado',
  'em cubos',
  'rasgado',
];
const adverbs = [
  'finamente',
  'grosseiramente',
  'delicadamente',
  'recém',
  'firmemente',
];

const numbersSmall = {
  zero: 0,
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  três: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  quatorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
  vinte: 20,
  trinta: 30,
  quarenta: 40,
  cinquenta: 50,
  sessenta: 60,
  setenta: 70,
  oitenta: 80,
  noventa: 90,
};

const numbersMagnitude = {
  cem: 100,
  mil: 1000,
  milhão: 1000000,
  bilhão: 1000000000,
  trilhão: 1000000000000,
};

const problematicUnits = {
  clove: ['alho'],
  // Add more problematic units here if needed
};

const badgeLabels = {
  approx: {
    short: 'aprox',
    label: 'aprox.',
    title: 'Aproximado',
  },
  optional: {
    short: 'opc',
    label: 'opcional',
    title: 'Opcional',
  },
  toServe: {
    short: 'srv',
    label: 'para servir',
    title: 'Para servir',
  },
  toTaste: {
    short: 'gosto',
    label: 'a gosto',
    title: 'A gosto',
  },
};

const languageName = 'Português';

export const langPor = {
  unitTranslations,
  badgeLabels,

  languageName,
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
