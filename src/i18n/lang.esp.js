const units = {
  // Ingredients/food portions
  diente: ['diente', 'diente de ajo'],
  galón: ['galón', 'gal'],
  onza: ['onza', 'oz', 'oz.'],
  floz: [
    'onza fluida',
    'onz. fluida',
    'fl oz',
    'fl. oz',
    'fluid ounce',
    'fluid ounces',
  ],
  pinta: ['pinta', 'pt', 'pt.'],
  libra: ['libra', 'lb', 'lb.', 'libras'],
  cuarto: ['cuarto', 'qt', 'qt.'],
  cucharada: ['cucharada', 'cda', 'cda.'],
  cucharadita: ['cucharadita', 'cdta', 'cdta.'],
  gramo: ['gramo', 'g', 'g.'],
  kilogramo: ['kilogramo', 'kg', 'kg.'],
  litro: ['litro', 'l', 'l.', 'lt'],
  miligramo: ['miligramo', 'mg', 'mg.'],
  mililitro: ['mililitro', 'ml', 'ml.'],
  paquete: ['paquete', 'pqt', 'pqt.'],
  bolsa: ['bolsa', 'blsa'],
  caja: ['caja'],
  botella: ['botella', 'btl', 'btl.'],
  envase: ['envase', 'envases'],
  lata: ['lata', 'latas'],
  taza: ['taza', 'tz', 'tz.'],
  barra: ['barra'], // e.g. stick of butter => "barra de mantequilla"
  docena: ['docena'],
  pieza: ['pieza', 'pz', 'pz.'],
  pizca: ['pizca', 'pizcas'],
  rebanada: ['rebanada', 'rebanadas'],
  puñado: ['puñado', 'puñados'],
  pulgada: ['pulgada', 'pulg.', 'pulgadas'],
};

const pluralUnits = {
  diente: 'dientes',
  galón: 'galones',
  onza: 'onzas',
  floz: 'onzas fluidas',
  pinta: 'pintas',
  libra: 'libras',
  cuarto: 'cuartos',
  cucharada: 'cucharadas',
  cucharadita: 'cucharaditas',
  gramo: 'gramos',
  kilogramo: 'kilogramos',
  litro: 'litros',
  miligramo: 'miligramos',
  mililitro: 'mililitros',
  paquete: 'paquetes',
  bolsa: 'bolsas',
  caja: 'cajas',
  botella: 'botellas',
  envase: 'envases',
  lata: 'latas',
  taza: 'tazas',
  barra: 'barras',
  docena: 'docenas',
  pieza: 'piezas',
  pizca: 'pizcas',
  rebanada: 'rebanadas',
  puñado: 'puñados',
  pulgada: 'pulgadas',
};

const symbolUnits = {
  diente: '',
  galón: 'gal',
  onza: 'oz',
  floz: 'fl oz',
  pinta: 'pt',
  libra: 'lb',
  cuarto: 'qt',
  cucharada: 'cda',
  cucharadita: 'cdta',
  gramo: 'g',
  kilogramo: 'kg',
  litro: 'l',
  miligramo: 'mg',
  mililitro: 'ml',
  paquete: 'pqt',
  bolsa: '',
  caja: '',
  botella: 'bt',
  envase: '',
  lata: '',
  taza: 'tz',
  barra: '',
  docena: 'doc',
  pieza: 'pz',
  pizca: '',
  rebanada: '',
  puñado: '',
  pulgada: 'pulg.',
};

const prepositions = ['de'];

const joiners = ['a'];

const toTaste = ['al gusto'];

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
  diente: ['ajo'],
  // Add more problematic units here as needed
};

export const langEsp = {
  units,
  pluralUnits,
  symbolUnits,
  prepositions,
  joiners,
  toTaste,
  numbersSmall,
  numbersMagnitude,
  problematicUnits,
  isCommaDelimited: true,
};
