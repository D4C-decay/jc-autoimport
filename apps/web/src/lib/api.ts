const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'PLUGIN_HYBRID' | 'GAS';
export type BodyType =
  | 'SEDAN'
  | 'SUV'
  | 'HATCHBACK'
  | 'COUPE'
  | 'PICKUP'
  | 'VAN'
  | 'CONVERTIBLE'
  | 'WAGON'
  | 'MINIVAN';
export type TransmissionType = 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'SEMI_AUTOMATIC';
export type DriveType = 'FWD' | 'RWD' | 'AWD' | 'FOUR_X_FOUR';
export type LeadType = 'TEST_DRIVE' | 'FINANCING' | 'QUOTATION' | 'GENERAL_INQUIRY';

export type MediaItem = {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'THREE_D_MODEL';
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type VehicleCard = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number | string;
  originalPrice?: number | string | null;
  mileage: number;
  fuelType: FuelType;
  bodyType: BodyType;
  transmission: TransmissionType;
  driveType: DriveType;
  horsepower: number;
  color: string;
  status: VehicleStatus;
  isFeatured: boolean;
  countryOfOrigin?: string | null;
  primaryImageUrl?: string | null;
  thumbnailUrl?: string | null;
  primaryImage?: string | null;
  media?: MediaItem[];
};

export type VehicleSpecification = {
  id: string;
  value: string | null;
  specification: { name: string; category: string; icon: string | null };
};

export type VehicleDetail = VehicleCard & {
  vin: string;
  engineSize: number | string;
  interiorColor: string | null;
  doors: number;
  seats: number;
  description: string | null;
  viewsCount: number;
  portOfEntry: string | null;
  importDate: string | null;
  features: string[] | null;
  createdAt: string;
  specifications?: VehicleSpecification[];
};

export type Paginated<T> = {
  data: T[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    total?: number;
  };
};

export type Facet = { value: string; count: number };

export type Facets = {
  brands: Facet[];
  bodyTypes?: Facet[];
  fuelTypes?: Facet[];
  transmissions?: Facet[];
  driveTypes?: Facet[];
  priceRange?: { min: number; max: number };
  yearRange?: { min: number; max: number };
  mileageRange?: { min: number; max: number };
  total?: number;
};

type Envelope<T> = { success: boolean; data: T; timestamp?: string };

type RequestOptions = {
  /** Server-side revalidation window in seconds. Omit for always-fresh. */
  revalidate?: number;
};

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: RequestOptions,
): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...(options?.revalidate === undefined
      ? { cache: 'no-store' as const }
      : { next: { revalidate: options.revalidate } }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const msg = Array.isArray(body?.message) ? body?.message.join(', ') : body?.message;
    throw new Error(msg || `Error ${res.status} en ${path}`);
  }

  const payload = (await res.json()) as Envelope<T>;
  return payload.data;
}

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export type VehicleQuery = {
  cursor?: string;
  limit?: number;
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: FuelType;
  bodyType?: BodyType;
  transmission?: TransmissionType;
  driveType?: DriveType;
  status?: VehicleStatus;
  sort?: string;
  withMedia?: boolean;
};

export const api = {
  listVehicles: (q: VehicleQuery = {}) =>
    request<Paginated<VehicleCard>>(`/api/v1/vehicles${qs({ limit: 12, ...q })}`),

  featuredVehicles: (limit = 8, revalidate?: number) =>
    request<VehicleCard[]>(
      `/api/v1/vehicles/featured?limit=${limit}`,
      undefined,
      revalidate === undefined ? undefined : { revalidate },
    ),

  vehicleBySlug: (slug: string) => request<VehicleDetail>(`/api/v1/vehicles/${slug}`),

  search: (q: string, limit = 12) =>
    request<Paginated<VehicleCard>>(`/api/v1/search${qs({ q, limit })}`),

  suggestions: (q: string, limit = 8) =>
    request<Array<{ brand: string; model: string; full: string }>>(
      `/api/v1/search/suggestions${qs({ q, limit })}`,
    ),

  facets: (q: { brand?: string; fuelType?: string; bodyType?: string } = {}) =>
    request<Facets>(`/api/v1/search/facets${qs(q)}`),

  createLead: (body: {
    vehicleId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    message?: string;
    leadType: LeadType;
    source?: string;
  }) => request<{ id: string }>('/api/v1/leads', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{
      user: { id: string; email: string; role: string; firstName: string | null; lastName: string | null };
      tokens: { accessToken: string; refreshToken: string; expiresIn: number };
    }>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: (token: string) =>
    request<{ id: string; email: string; role: string; firstName: string | null }>(
      '/api/v1/auth/me',
      { headers: { Authorization: `Bearer ${token}` } },
    ),
};

export type { VehicleDetail as Vehicle };
