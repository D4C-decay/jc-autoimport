/**
 * Mapa de imagenes de vehiculos.
 *
 * Cada foto vive en `apps/web/public/media/vehicles/<slug>.webp` y fue obtenida
 * de la ficha de Wikipedia del modelo real (ver CREDITS.md), de modo que la
 * imagen SI coincide con la marca/modelo de la unidad y se sirve localmente
 * (no depende de Unsplash, siempre carga, funciona offline y en el escritorio).
 *
 * `VEHICLE_IMAGE_MAP` va de marca a una lista ORDENADA de [prefijo de modelo,
 * slug de archivo]. El primer prefijo que coincide gana, por eso los modelos
 * mas especificos (p. ej. "Mustang Mach-E") van antes que los genericos
 * ("Mustang").
 */
export const VEHICLE_IMAGE_MAP: Record<string, Array<[string, string]>> = {
  Toyota: [
    ['RAV4', 'toyota-rav4'],
    ['Corolla Cross', 'toyota-corolla-cross'],
    ['Sienna', 'toyota-sienna'],
    ['Camry', 'toyota-camry'],
    ['Highlander', 'toyota-highlander'],
    ['Tacoma', 'toyota-tacoma'],
  ],
  Ford: [
    ['F-150', 'ford-f-150'],
    ['Mustang Mach-E', 'ford-mustang-mach-e'],
    ['Mustang', 'ford-mustang'],
    ['Bronco', 'ford-bronco'],
    ['Explorer', 'ford-explorer'],
    ['Transit', 'ford-transit'],
  ],
  Nissan: [
    ['Altima', 'nissan-altima'],
    ['Kicks', 'nissan-kicks'],
    ['Rogue', 'nissan-rogue'],
    ['Ariya', 'nissan-ariya'],
    ['Z ', 'nissan-z'],
  ],
  Tesla: [
    ['Model 3', 'tesla-model-3'],
    ['Model Y', 'tesla-model-y'],
    ['Model S', 'tesla-model-s'],
  ],
  Chevrolet: [
    ['Camaro', 'chevrolet-camaro'],
    ['Silverado', 'chevrolet-silverado'],
    ['Equinox', 'chevrolet-equinox'],
    ['Traverse', 'chevrolet-traverse'],
  ],
  Jeep: [
    ['Grand Cherokee', 'jeep-grand-cherokee'],
    ['Wrangler', 'jeep-wrangler'],
  ],
  Audi: [
    ['RS7', 'audi-rs7'],
    ['Q8', 'audi-q8'],
    ['e-tron GT', 'audi-e-tron-gt'],
    ['S6', 'audi-s6'],
    ['A6', 'audi-a6'],
  ],
  'Mercedes-Benz': [
    ['C ', 'mercedes-c-class'],
    ['GLE', 'mercedes-gle'],
    ['Sprinter', 'mercedes-sprinter'],
  ],
  'Land Rover': [
    ['Range Rover Sport', 'land-rover-range-rover-sport'],
    ['Range Rover Velar', 'land-rover-range-rover-velar'],
    ['Defender', 'land-rover-defender'],
  ],
  BMW: [
    ['M5', 'bmw-m5'],
    ['X5', 'bmw-x5'],
    ['M4', 'bmw-m4'],
    ['X3', 'bmw-x3'],
  ],
  Porsche: [
    ['Cayenne', 'porsche-cayenne'],
    ['911', 'porsche-911'],
    ['Macan', 'porsche-macan'],
  ],
  Hyundai: [
    ['Tucson', 'hyundai-tucson'],
    ['Grandeur', 'hyundai-grandeur'],
  ],
  Kia: [
    ['Carnival', 'kia-carnival'],
    ['K5', 'kia-k5'],
    ['Sportage', 'kia-sportage'],
    ['Telluride', 'kia-telluride'],
  ],
  Honda: [
    ['CR-V', 'honda-cr-v'],
    ['Odyssey', 'honda-odyssey'],
    ['HR-V', 'honda-hr-v'],
    ['Accord', 'honda-accord'],
  ],
  Mazda: [
    ['CX-5', 'mazda-cx-5'],
    ['Mazda3', 'mazda3'],
  ],
  Acura: [['MDX', 'acura-mdx']],
  Subaru: [['Outback', 'subaru-outback']],
  Volkswagen: [
    ['Atlas', 'volkswagen-atlas'],
    ['Jetta', 'volkswagen-jetta'],
    ['Golf GTI', 'volkswagen-golf-gti'],
  ],
  GMC: [['Yukon', 'gmc-yukon']],
  Cadillac: [['Escalade', 'cadillac-escalade']],
  Ram: [
    ['ProMaster', 'ram-promaster'],
    ['1500', 'ram-1500'],
  ],
  Dodge: [['Challenger', 'dodge-challenger']],
  Genesis: [
    ['GV70', 'genesis-gv70'],
    ['G80', 'genesis-g80'],
  ],
};

/** Ruta publica de la imagen del vehiculo, o null si no hay foto para el modelo. */
export function imageForVehicle(brand: string, model: string): string | null {
  const entries = VEHICLE_IMAGE_MAP[brand];
  if (!entries) return null;
  for (const [prefix, slug] of entries) {
    if (model.startsWith(prefix)) return `/media/vehicles/${slug}.webp`;
  }
  return null;
}
