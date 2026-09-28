'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import {
  api,
  type BodyType,
  type Facets,
  type FuelType,
  type VehicleCard,
  type VehicleQuery,
} from '@/lib/api';
import { LABELS, SORT_OPTIONS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { VehicleCardItem, VehicleCardSkeleton } from './vehicle-card';
import { Button, Eyebrow } from './ui';
import { SearchBar } from './search-bar';

type Filters = {
  brand: string;
  bodyType: BodyType | '';
  fuelType: FuelType | '';
  transmission: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  mileageMax: string;
  sort: string;
};

const EMPTY: Filters = {
  brand: '',
  bodyType: '',
  fuelType: '',
  transmission: '',
  priceMin: '',
  priceMax: '',
  yearMin: '',
  yearMax: '',
  mileageMax: '',
  sort: 'newest',
};

function filtersEqual(a: Filters, b: Filters): boolean {
  return (Object.keys(b) as Array<keyof Filters>).every((k) => a[k] === b[k]);
}

function fromParams(sp: URLSearchParams): Filters {  return {
    brand: sp.get('brand') ?? '',
    bodyType: (sp.get('bodyType') ?? '') as Filters['bodyType'],
    fuelType: (sp.get('fuelType') ?? '') as Filters['fuelType'],
    transmission: sp.get('transmission') ?? '',
    priceMin: sp.get('priceMin') ?? '',
    priceMax: sp.get('priceMax') ?? '',
    yearMin: sp.get('yearMin') ?? '',
    yearMax: sp.get('yearMax') ?? '',
    mileageMax: sp.get('mileageMax') ?? '',
    sort: sp.get('sort') ?? 'newest',
  };
}

type InitialCatalog = {
  vehicles: VehicleCard[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function CatalogPage({ initial }: { initial?: InitialCatalog }) {
  const router = useRouter();
  const params = useSearchParams();
  const textQuery = params.get('q') ?? '';

  const [filters, setFilters] = useState<Filters>(() => fromParams(params));
  const [vehicles, setVehicles] = useState<VehicleCard[]>(initial?.vehicles ?? []);
  const [cursor, setCursor] = useState<string | null>(initial?.nextCursor ?? null);
  const [hasMore, setHasMore] = useState(initial?.hasMore ?? false);
  const [loading, setLoading] = useState(!initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const num = (v: string) => (v === '' ? undefined : Number(v));

  const query = useMemo(
    (): VehicleQuery => ({
      brand: filters.brand || undefined,
      bodyType: filters.bodyType || undefined,
      fuelType: filters.fuelType || undefined,
      transmission: (filters.transmission || undefined) as VehicleQuery['transmission'],
      priceMin: num(filters.priceMin),
      priceMax: num(filters.priceMax),
      yearMin: num(filters.yearMin),
      yearMax: num(filters.yearMax),
      mileageMax: num(filters.mileageMax),
      sort: filters.sort,
      withMedia: true,
    }),
    [filters],
  );

  const load = useCallback(
    async (cursorValue: string | null, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = textQuery
          ? await api.search(textQuery, 12)
          : await api.listVehicles({ ...query, limit: 12, cursor: cursorValue ?? undefined });
        const items = res.data ?? [];
        setVehicles((prev) => (append ? [...prev, ...items] : items));
        setCursor(res.meta?.nextCursor ?? null);
        setHasMore(Boolean(res.meta?.hasMore));
      } catch {
        if (!append) setVehicles([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, textQuery],
  );

  // The server already delivered the unfiltered first page; only re-fetch when the
  // visitor narrows the catalog or searches.
  const isPristine =
    initial !== undefined && !textQuery && filtersEqual(filters, EMPTY);

  useEffect(() => {
    if (isPristine) {
      setLoading(false);
      return;
    }
    void load(null, false);
  }, [load, isPristine]);

  useEffect(() => {
    api
      .facets({ brand: filters.brand || undefined, fuelType: filters.fuelType || undefined })
      .then(setFacets)
      .catch(() => setFacets(null));
  }, [filters.brand, filters.fuelType]);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const sp = new URLSearchParams();
    if (textQuery) sp.set('q', textQuery);
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === 'sort' && v === 'newest')) sp.set(k, String(v));
    }
    router.replace(`/catalogo?${sp.toString()}`, { scroll: false });
  }

  function clearAll() {
    setFilters(EMPTY);
    router.replace('/catalogo', { scroll: false });
  }

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v && !(k === 'sort' && v === 'newest'),
  ).length;

  return (
    <>
      {/* ============================== HEADER ============================== */}
      <section className="relative overflow-hidden border-b border-line pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=2000&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
        <div className="container-x relative">
          <Eyebrow index="Catálogo">
            {textQuery ? `Resultados para «${textQuery}»` : 'Todas las unidades disponibles'}
          </Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,5rem)] leading-[0.9] text-smoke">
            {textQuery ? 'Resultados' : 'Catálogo'}
            {!textQuery ? <span className="text-brass">.</span> : null}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ash">
            Cada vehículo pasa inspección de 120 puntos en origen antes de ser listado. Precios
            mostrados son de venta final en destino.
          </p>
          <div className="mt-8 max-w-md">
            <SearchBar placeholder="Filtrar por marca o modelo…" />
          </div>
        </div>
      </section>

      {/* ============================== TOOLBAR ============================== */}
      <section className="sticky top-18 z-[150] border-b border-line bg-ink/88 backdrop-blur-xl">
        <div className="container-x flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              className={cn(
                'flex items-center gap-2 border px-4 py-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors',
                panelOpen || activeCount > 0
                  ? 'border-brass text-brass'
                  : 'border-line text-ash hover:border-brass hover:text-brass',
              )}
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={1.7} />
              Filtros
              {activeCount > 0 ? (
                <span className="flex size-4 items-center justify-center bg-brass text-[9px] text-ink">
                  {activeCount}
                </span>
              ) : null}
            </button>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-ash uppercase transition-colors hover:text-brass"
              >
                <X className="size-3" /> Limpiar
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[10px] tracking-[0.2em] text-ash uppercase sm:inline">
              {loading ? 'Cargando…' : `${vehicles.length}${hasMore ? '+' : ''} resultados`}
            </span>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => set('sort', e.target.value)}
                className="appearance-none border border-line bg-ink-2 py-2.5 pr-9 pl-4 text-[10px] font-medium tracking-[0.16em] text-smoke uppercase outline-none transition-colors hover:border-brass focus:border-brass"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-brass"
                strokeWidth={1.8}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {panelOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-line bg-ink-2"
            >
              <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Marca"
                  value={filters.brand}
                  onChange={(v) => set('brand', v)}
                  options={(facets?.brands ?? []).map((b) => ({ value: b.value, label: `${b.value} (${b.count})` }))}
                  placeholder="Todas"
                />
                <SelectField
                  label="Carrocería"
                  value={filters.bodyType}
                  onChange={(v) => set('bodyType', v as Filters['bodyType'])}
                  options={Object.entries(LABELS.bodyType).map(([value, label]) => ({ value, label }))}
                  placeholder="Todas"
                />
                <SelectField
                  label="Combustible"
                  value={filters.fuelType}
                  onChange={(v) => set('fuelType', v as Filters['fuelType'])}
                  options={Object.entries(LABELS.fuelType).map(([value, label]) => ({ value, label }))}
                  placeholder="Todos"
                />
                <SelectField
                  label="Transmisión"
                  value={filters.transmission}
                  onChange={(v) => set('transmission', v)}
                  options={Object.entries(LABELS.transmission).map(([value, label]) => ({ value, label }))}
                  placeholder="Todas"
                />
                <RangeField
                  label="Precio (USD)"
                  min={filters.priceMin}
                  max={filters.priceMax}
                  onMin={(v) => set('priceMin', v)}
                  onMax={(v) => set('priceMax', v)}
                  placeholder="0"
                />
                <RangeField
                  label="Año"
                  min={filters.yearMin}
                  max={filters.yearMax}
                  onMin={(v) => set('yearMin', v)}
                  onMax={(v) => set('yearMax', v)}
                  placeholder="2015"
                />
                <RangeField
                  label="Kilometraje máx. (mi)"
                  min=""
                  max={filters.mileageMax}
                  onMin={() => undefined}
                  onMax={(v) => set('mileageMax', v)}
                  placeholder="80000"
                />
                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearAll} className="w-full">
                    Restablecer filtros
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* ============================== GRID ============================== */}
      <section className="container-x py-14 lg:py-20">
        {loading ? (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="border border-line px-6 py-24 text-center">
            <h2 className="font-display text-2xl text-smoke">Sin resultados</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ash">
              No encontramos vehículos con esos criterios. Ajusta los filtros o cuéntanos qué buscas
              y lo conseguimos por ti.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={clearAll}>Restablecer filtros</Button>
              <Button href="/contacto" variant="outline">
                Buscar por encargo
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v, i) => (
                <VehicleCardItem key={v.id} vehicle={v} index={i % 12} priority={i < 3} />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-16 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => cursor && load(cursor, true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Cargando…' : 'Cargar más vehículos'}
                </Button>
              </div>
            ) : vehicles.length >= 12 ? (
              <p className="mt-16 text-center text-[10px] tracking-[0.24em] text-ash uppercase">
                Has visto todo el catálogo
              </p>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}

/* ------------------------------- Filter UI ------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-brass uppercase">{label}</span>
      <div className="relative mt-2.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border border-line bg-ink py-3 pr-9 pl-4 text-sm text-smoke outline-none transition-colors hover:border-brass/50 focus:border-brass"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-ash"
          strokeWidth={1.7}
        />
      </div>
    </label>
  );
}

function RangeField({
  label,
  min,
  max,
  onMin,
  onMax,
  placeholder,
}: {
  label: string;
  min: string;
  max: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <span className="text-[10px] font-semibold tracking-[0.2em] text-brass uppercase">{label}</span>
      <div className="mt-2.5 flex items-center gap-2">
        <input
          value={min}
          onChange={(e) => onMin(e.target.value.replace(/\D/g, ''))}
          placeholder={placeholder}
          inputMode="numeric"
          className="w-full border border-line bg-ink px-3 py-3 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-brass"
        />
        <span className="text-ash">—</span>
        <input
          value={max}
          onChange={(e) => onMax(e.target.value.replace(/\D/g, ''))}
          placeholder={placeholder}
          inputMode="numeric"
          className="w-full border border-line bg-ink px-3 py-3 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-brass"
        />
      </div>
    </div>
  );
}
