import type { BodyType, DriveType, FuelType, TransmissionType, VehicleStatus } from './api';

export const LABELS: {
  fuelType: Record<FuelType, string>;
  bodyType: Record<BodyType, string>;
  transmission: Record<TransmissionType, string>;
  driveType: Record<DriveType, string>;
  status: Record<VehicleStatus, string>;
} = {
  fuelType: {
    GASOLINE: 'Gasolina',
    DIESEL: 'Diésel',
    ELECTRIC: 'Eléctrico',
    HYBRID: 'Híbrido',
    PLUGIN_HYBRID: 'Híbrido enchufable',
    GAS: 'Gas',
  },
  bodyType: {
    SEDAN: 'Sedán',
    SUV: 'SUV',
    HATCHBACK: 'Hatchback',
    COUPE: 'Coupe',
    PICKUP: 'Pickup',
    VAN: 'Van',
    CONVERTIBLE: 'Convertible',
    WAGON: 'Station Wagon',
    MINIVAN: 'Minivan',
  },
  transmission: {
    AUTOMATIC: 'Automática',
    MANUAL: 'Manual',
    CVT: 'CVT',
    SEMI_AUTOMATIC: 'Semiautomática',
  },
  driveType: {
    FWD: 'Delantera',
    RWD: 'Trasera',
    AWD: 'Integral',
    FOUR_X_FOUR: '4x4',
  },
  status: {
    AVAILABLE: 'Disponible',
    RESERVED: 'Reservado',
    SOLD: 'Vendido',
  },
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'year_desc', label: 'Año: más nuevo' },
  { value: 'year_asc', label: 'Año: más antiguo' },
  { value: 'mileage_asc', label: 'Kilometraje: menor' },
  { value: 'mileage_desc', label: 'Kilometraje: mayor' },
] as const;
