import type { Paginated, VehicleCard, VehicleDetail, VehicleQuery } from './api';

/**
 * Catálogo estático de respaldo: cuando la API no es alcanzable (deploy sin
 * API_INTERNAL_URL, túnel caído, backend reiniciándose) la web sigue mostrando
 * inventario real en vez de esqueletos infinitos. Si la API responde, sus datos
 * siempre tienen prioridad: el fallback solo se usa en el catch.
 * Las imágenes son /media/vehicles/*.webp, assets locales del deploy.
 */

type Seed = {
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: VehicleCard['fuelType'];
  bodyType: VehicleCard['bodyType'];
  transmission: VehicleCard['transmission'];
  driveType: VehicleCard['driveType'];
  horsepower: number;
  color: string;
  engineSize: number;
  doors: number;
  seats: number;
  vin: string;
  views: number;
  description: string;
  features: string[];
};

const SEEDS: Seed[] = [
  {
    slug: 'porsche-911',
    brand: 'Porsche',
    model: '911 Carrera',
    year: 2023,
    price: 128900,
    mileage: 12400,
    fuelType: 'GASOLINE',
    bodyType: 'COUPE',
    transmission: 'AUTOMATIC',
    driveType: 'RWD',
    horsepower: 379,
    color: 'Gris Arctic',
    engineSize: 3.0,
    doors: 2,
    seats: 4,
    vin: 'WP0AB2A99PS214507',
    views: 2418,
    description:
      '911 Carrera de octava generación, importada y inspeccionada. Motor boxer biturbo de 3.0 L, chasis PDK y estado de colección. Lista para matrícula con papeles al día.',
    features: ['Asientos calefactables', 'Suspensión deportiva', 'Cámara de visión trasera', 'Sistema Bose', 'Llantas de 20"'],
  },
  {
    slug: 'tesla-model-s',
    brand: 'Tesla',
    model: 'Model S Plaid',
    year: 2022,
    price: 89500,
    mileage: 18200,
    fuelType: 'ELECTRIC',
    bodyType: 'SEDAN',
    transmission: 'AUTOMATIC',
    driveType: 'AWD',
    horsepower: 1020,
    color: 'Blanco Perla',
    engineSize: 0,
    doors: 4,
    seats: 5,
    vin: '5YJSA1E26NF123847',
    views: 1987,
    description:
      'Model S Plaid con tracción total y 1020 HP. Batería con salud verificada, autonomía certificada y acceso a red Supercharger. Unidad lista para entrega inmediata.',
    features: ['Autopilot', 'Techo panorámico de vidrio', 'Pantalla táctil 17"', 'Audio premium', 'Carga rápida DC'],
  },
  {
    slug: 'bmw-m4',
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2023,
    price: 79900,
    mileage: 15600,
    fuelType: 'GASOLINE',
    bodyType: 'COUPE',
    transmission: 'AUTOMATIC',
    driveType: 'AWD',
    horsepower: 503,
    color: 'Negro Brooklyn',
    engineSize: 3.0,
    doors: 2,
    seats: 4,
    vin: 'WBS3R9C04PCK12871',
    views: 1642,
    description:
      'M4 Competition xDrive con paquete M Driver y frenos de carbono. Motor S58 biturbo de 503 HP, transmisión M Steptronic de 8 velocidades.',
    features: ['Asientos M deportivos', 'Head-up display', 'Faros láser', 'Dirección deportiva M', 'Audio Harman Kardon'],
  },
  {
    slug: 'mercedes-c-class',
    brand: 'Mercedes-Benz',
    model: 'C 300',
    year: 2024,
    price: 54900,
    mileage: 8900,
    fuelType: 'GASOLINE',
    bodyType: 'SEDAN',
    transmission: 'AUTOMATIC',
    driveType: 'AWD',
    horsepower: 255,
    color: 'Blanco Polar',
    engineSize: 2.0,
    doors: 4,
    seats: 5,
    vin: 'W1KAF4GB1RR204913',
    views: 1210,
    description:
      'C 300 4MATIC de tercera generación con interior MBUX de última generación. Prácticamente nueva, un solo dueño y garantía de fábrica vigente.',
    features: ['MBUX 4MATIC', 'Asientos de cuero', 'Climatización de zona doble', 'Asistente de carril', 'Llantas AMG 19"'],
  },
  {
    slug: 'audi-e-tron-gt',
    brand: 'Audi',
    model: 'e-tron GT',
    year: 2023,
    price: 96500,
    mileage: 11300,
    fuelType: 'ELECTRIC',
    bodyType: 'SEDAN',
    transmission: 'AUTOMATIC',
    driveType: 'AWD',
    horsepower: 522,
    color: 'Gris Daytona',
    engineSize: 0,
    doors: 4,
    seats: 5,
    vin: 'WUAAWAFR4PA901284',
    views: 987,
    description:
      'e-tron GT quattro con tracción total eléctrica y 522 HP. Carga de 800 V, autonomía de 480 km y suspensión adaptativa neumática.',
    features: ['Carga rápida 270 kW', 'Matrix LED', 'Sonido Bang & Olufsen', 'Butacas ventiladas', 'Head-up display'],
  },
  {
    slug: 'ford-mustang',
    brand: 'Ford',
    model: 'Mustang GT',
    year: 2023,
    price: 58900,
    mileage: 14700,
    fuelType: 'GASOLINE',
    bodyType: 'COUPE',
    transmission: 'AUTOMATIC',
    driveType: 'RWD',
    horsepower: 450,
    color: 'Rojo Rapid',
    engineSize: 5.0,
    doors: 2,
    seats: 4,
    vin: '1FA6P8CF4P5102934',
    views: 1533,
    description:
      'Mustang GT con motor V8 Coyote de 5.0 L y escape activo. Paquete Performance Pack con diferencial限 slip y llantas forjadas.',
    features: ['Modos de conducción', 'Diferencial limited-slip', 'Asientos Recaro', 'Pantalla 12.4"', 'Frenos Brembo'],
  },
  {
    slug: 'land-rover-range-rover-sport',
    brand: 'Land Rover',
    model: 'Range Rover Sport',
    year: 2023,
    price: 112000,
    mileage: 16400,
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    transmission: 'AUTOMATIC',
    driveType: 'AWD',
    horsepower: 395,
    color: 'Verde British Racing',
    engineSize: 3.0,
    doors: 4,
    seats: 5,
    vin: 'SAL1L9FU0PA208471',
    views: 1401,
    description:
      'Range Rover Sport HSE con aire suspendido y cámara 360°. Interior Windsor en cuero y sistema Meridian Surround.',
    features: ['Suspensión neumática', 'Cámara 360°', 'Techo panorámico', 'Meridian Surround', 'Arranque remoto'],
  },
  {
    slug: 'bmw-x5',
    brand: 'BMW',
    model: 'X5 xDrive40i',
    year: 2022,
    price: 67500,
    mileage: 24100,
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    transmission: 'AUTOMATIC',
    driveType: 'AWD',
    horsepower: 335,
    color: 'Azul Carbon',
    engineSize: 3.0,
    doors: 4,
    seats: 5,
    vin: '5UXCR6C0XL9C18402',
    views: 1108,
    description:
      'X5 xDrive40i con paquete M Sport y asientos de cuero Vernasca. Servicio BMW documentado y ruedas de temporada incluidas.',
    features: ['Pantalla curva 12.3"', 'Asientos calefactables', 'Audí Bowers & Wilkins', 'Control de crucero adaptativo', 'Carga inalámbrica'],
  },
  {
    slug: 'jeep-wrangler',
    brand: 'Jeep',
    model: 'Wrangler Rubicon',
    year: 2023,
    price: 52300,
    mileage: 19800,
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    transmission: 'AUTOMATIC',
    driveType: 'FOUR_X_FOUR',
    horsepower: 285,
    color: 'Verde Sarge',
    engineSize: 3.6,
    doors: 4,
    seats: 5,
    vin: '1C4HJXFG6PW512946',
    views: 1756,
    description:
      'Wrangler Rubicon 4x4 con bloqueos Dana 44 y barra estabilizadora desacoplable. Capota y puertas removibles, listo para cualquier terreno.',
    features: ['Bloqueos de diferencial', 'Sky One-Touch', 'Sistema Alpine premium', 'Protección de caja', 'Ganchos de remolque'],
  },
  {
    slug: 'toyota-tacoma',
    brand: 'Toyota',
    model: 'Tacoma TRD Off-Road',
    year: 2023,
    price: 46800,
    mileage: 21500,
    fuelType: 'GASOLINE',
    bodyType: 'PICKUP',
    transmission: 'AUTOMATIC',
    driveType: 'FOUR_X_FOUR',
    horsepower: 270,
    color: 'Gris Cemento',
    engineSize: 2.4,
    doors: 4,
    seats: 5,
    vin: '3TMCZ5AN4PM581037',
    views: 1322,
    description:
      'Tacoma TRD Off-Road con suspensión de 2.5" y control de descenso. Cabina doble con caja forrada y techo solar.',
    features: ['Multi-Terrain Select', 'Cámara multi-vista', 'Apple CarPlay', 'Caja forrada', 'Estabilizador de remolque'],
  },
  {
    slug: 'tesla-model-3',
    brand: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2023,
    price: 42900,
    mileage: 16800,
    fuelType: 'ELECTRIC',
    bodyType: 'SEDAN',
    transmission: 'AUTOMATIC',
    driveType: 'AWD',
    horsepower: 394,
    color: 'Blanco Perla',
    engineSize: 0,
    doors: 4,
    seats: 5,
    vin: '5YJ3E1EB8PF614829',
    views: 2087,
    description:
      'Model 3 Long Range AWD con 629 km de autonomía. Interior renovado con iluminación ambiental y pantalla 15.4".',
    features: ['Autopilot básico', 'Carga inalámbrica', 'Asientos ventilados', 'Techo de vidrio', 'Supercharger'],
  },
  {
    slug: 'volkswagen-golf-gti',
    brand: 'Volkswagen',
    model: 'Golf GTI',
    year: 2023,
    price: 33900,
    mileage: 18300,
    fuelType: 'GASOLINE',
    bodyType: 'HATCHBACK',
    transmission: 'AUTOMATIC',
    driveType: 'FWD',
    horsepower: 241,
    color: 'Gris Moonstone',
    engineSize: 2.0,
    doors: 4,
    seats: 5,
    vin: '3VW5T7AU1PM024615',
    views: 1465,
    description:
      'Golf GTI Mk8 con transmisión DSG de 7 velocidades y diferencial electrónico autoblocante. Paquete Decor con llantas de 19".',
    features: ['Diferencial VAQ', 'Asientos Clark', 'Digital Cockpit Pro', 'Climatizador 3 zonas', 'Faros IQ.Light'],
  },
];

function specsOf(s: Seed): VehicleDetail['specifications'] {
  const entries: { name: string; category: string; value: string }[] = [
    { name: 'Motor', category: 'Motor', value: s.engineSize > 0 ? `${s.engineSize} L` : 'Eléctrico' },
    { name: 'Potencia', category: 'Motor', value: `${s.horsepower} HP` },
    { name: 'Transmisión', category: 'Transmisión', value: s.transmission },
    { name: 'Tracción', category: 'Transmisión', value: s.driveType },
    { name: 'Kilometraje', category: 'General', value: `${s.mileage.toLocaleString('en-US')} mi` },
    { name: 'Año', category: 'General', value: String(s.year) },
    { name: 'Color exterior', category: 'Interior', value: s.color },
    { name: 'Puertas / asientos', category: 'Interior', value: `${s.doors} / ${s.seats}` },
  ];
  return entries.map((e, i) => ({
    id: `${s.slug}-spec-${i}`,
    value: e.value,
    specification: { name: e.name, category: e.category, icon: null },
  }));
}

function toCard(s: Seed): VehicleCard {
  return {
    id: `fallback-${s.slug}`,
    slug: s.slug,
    brand: s.brand,
    model: s.model,
    year: s.year,
    price: s.price,
    mileage: s.mileage,
    fuelType: s.fuelType,
    bodyType: s.bodyType,
    transmission: s.transmission,
    driveType: s.driveType,
    horsepower: s.horsepower,
    color: s.color,
    status: 'AVAILABLE',
    isFeatured: true,
    countryOfOrigin: null,
    primaryImageUrl: `/media/vehicles/${s.slug}.webp`,
    thumbnailUrl: `/media/vehicles/${s.slug}.webp`,
    primaryImage: `/media/vehicles/${s.slug}.webp`,
    media: [],
  };
}

function toDetail(s: Seed): VehicleDetail {
  return {
    ...toCard(s),
    vin: s.vin,
    engineSize: s.engineSize,
    interiorColor: 'Negro',
    doors: s.doors,
    seats: s.seats,
    description: s.description,
    viewsCount: s.views,
    portOfEntry: 'Puerto de Cartagena',
    importDate: '2025-09-12',
    features: s.features,
    createdAt: new Date(s.year).toISOString(),
    specifications: specsOf(s),
  };
}

export const FALLBACK_VEHICLES: VehicleCard[] = SEEDS.map(toCard);

export function fallbackVehicles(q: VehicleQuery = {}): Paginated<VehicleCard> {
  let items = [...FALLBACK_VEHICLES];
  const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  if (q.brand) items = items.filter((v) => eq(v.brand, q.brand as string));
  if (q.bodyType) items = items.filter((v) => v.bodyType === q.bodyType);
  if (q.fuelType) items = items.filter((v) => v.fuelType === q.fuelType);
  if (q.transmission) items = items.filter((v) => v.transmission === q.transmission);
  if (q.driveType) items = items.filter((v) => v.driveType === q.driveType);
  if (q.status) items = items.filter((v) => v.status === q.status);
  if (q.yearMin) items = items.filter((v) => v.year >= (q.yearMin as number));
  if (q.yearMax) items = items.filter((v) => v.year <= (q.yearMax as number));
  if (q.priceMin) items = items.filter((v) => Number(v.price) >= (q.priceMin as number));
  if (q.priceMax) items = items.filter((v) => Number(v.price) <= (q.priceMax as number));
  if (q.mileageMax) items = items.filter((v) => v.mileage <= (q.mileageMax as number));
  switch (q.sort) {
    case 'price_asc':
      items.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price_desc':
      items.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case 'year_desc':
      items.sort((a, b) => b.year - a.year);
      break;
    case 'year_asc':
      items.sort((a, b) => a.year - b.year);
      break;
    case 'mileage_asc':
      items.sort((a, b) => a.mileage - b.mileage);
      break;
    case 'mileage_desc':
      items.sort((a, b) => b.mileage - a.mileage);
      break;
  }
  const limit = q.limit ?? 12;
  const data = items.slice(0, limit);
  return {
    data,
    meta: { nextCursor: null, prevCursor: null, hasMore: false, total: items.length },
  };
}

export function fallbackDetail(slug: string): VehicleDetail | null {
  const seed = SEEDS.find((s) => s.slug === slug);
  return seed ? toDetail(seed) : null;
}

export function fallbackSearch(text: string, limit = 12): Paginated<VehicleCard> {
  const q = text.trim().toLowerCase();
  const data = FALLBACK_VEHICLES.filter(
    (v) =>
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.slug.includes(q),
  ).slice(0, limit);
  return {
    data,
    meta: { nextCursor: null, prevCursor: null, hasMore: false, total: data.length },
  };
}

export function fallbackSuggestions(text: string, limit = 8) {
  const q = text.trim().toLowerCase();
  const seen = new Set<string>();
  const out: { brand: string; model: string; full: string }[] = [];
  for (const v of FALLBACK_VEHICLES) {
    const full = `${v.brand} ${v.model}`;
    if (seen.has(full)) continue;
    if (!full.toLowerCase().includes(q)) continue;
    seen.add(full);
    out.push({ brand: v.brand, model: v.model, full });
    if (out.length >= limit) break;
  }
  return out;
}
