/**
 * On the server we talk to the API directly. In the browser we must not: the
 * API lives on the private network, and `NEXT_PUBLIC_*` gets inlined into the
 * bundle, so a hardcoded host would point every visitor at their own
 * localhost. `/backend` is a narrow proxy that runs here, on the server.
 */
import {
  fallbackDetail,
  fallbackSearch,
  fallbackSuggestions,
  fallbackVehicles,
} from './fallback-vehicles';

const INTERNAL_API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL ?? INTERNAL_API_URL;
const PROXY_PATH = '/backend';

function baseUrl(): string {
  return typeof window === 'undefined' ? SERVER_API_URL : PROXY_PATH;
}


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

/**
 * The `/backend` proxy forwards `Authorization` untouched. Public endpoints
 * work without it; authenticated ones need the Supabase access token, which
 * only exists in the browser (server code uses `serverMe` with an explicit
 * token instead). A missing session is not an error here: the API answers 401.
 */
async function authHeader(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  try {
    const { createClient } = await import('./supabase/client');
    const { data } = await createClient().auth.getSession();
    return data.session ? { authorization: `Bearer ${data.session.access_token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: RequestOptions,
): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
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
  listVehicles: async (q: VehicleQuery = {}) => {
    try {
      return await request<Paginated<VehicleCard>>(`/api/v1/vehicles${qs({ limit: 12, ...q })}`);
    } catch {
      return fallbackVehicles(q);
    }
  },

  featuredVehicles: async (limit = 8, revalidate?: number) => {
    try {
      return await request<VehicleCard[]>(
        `/api/v1/vehicles/featured?limit=${limit}`,
        undefined,
        revalidate === undefined ? undefined : { revalidate },
      );
    } catch {
      return fallbackVehicles({ limit }).data;
    }
  },

  vehicleBySlug: async (slug: string) => {
    try {
      return await request<VehicleDetail>(`/api/v1/vehicles/${slug}`);
    } catch {
      const fallback = fallbackDetail(slug);
      if (!fallback) throw new Error(`Vehículo no encontrado: ${slug}`);
      return fallback;
    }
  },

  search: async (q: string, limit = 12) => {
    try {
      return await request<Paginated<VehicleCard>>(`/api/v1/search${qs({ q, limit })}`);
    } catch {
      return fallbackSearch(q, limit);
    }
  },

  suggestions: async (q: string, limit = 8) => {
    try {
      return await request<Array<{ brand: string; model: string; full: string }>>(
        `/api/v1/search/suggestions${qs({ q, limit })}`,
      );
    } catch {
      return fallbackSuggestions(q, limit);
    }
  },

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

};

export type { VehicleDetail as Vehicle };

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName?: string | null;
  emailVerified?: boolean;
};

/**
 * Server-side profile lookup. The caller resolves the Supabase session and
 * passes its access token; the API verifies it and returns the linked local
 * user (with role and verification state). Returns null when there is no
 * valid session, so callers can redirect without ever exposing the token.
 */
export async function serverMe(accessToken: string | undefined): Promise<SessionUser | null> {
  if (!accessToken) return null;
  try {
    const res = await fetch(`${SERVER_API_URL}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as Envelope<SessionUser>;
    return payload.data;
  } catch {
    return null;
  }
}
