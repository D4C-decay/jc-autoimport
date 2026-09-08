export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateVehicleSlug(brand: string, model: string, year: number, vin: string): string {
  const base = slugify(`${brand} ${model} ${year}`);
  const hash = vin.slice(-6).toLowerCase();
  return `${base}-${hash}`;
}
