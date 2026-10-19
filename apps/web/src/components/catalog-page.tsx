'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutGrid, Rows3, SlidersHorizontal, X } from 'lucide-react';
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
import {
  VehicleCardItem,
  VehicleCardSkeleton,
  VehicleRow,
  VehicleRowSkeleton,
} from './vehicle-card';
import { Button, Eyebrow } from './ui';
import { SearchBar } from './search-bar';
import AnimatedList from '@/components/react-bits/AnimatedList';
import AccordionGallery from '@/components/react-bits/AccordionGallery';
import SquishSwitch from '@/components/react-bits/SquishSwitch';
import JellyRadio from '@/components/react-bits/JellyRadio';

type ViewMode = 'grid' | 'list';

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
  const { locale } = useParams<{ locale: string }>();
  const textQuery = params.get('q') ?? '';

  const [filters, setFilters] = useState<Filters>(() => fromParams(params));
  const [vehicles, setVehicles] = useState<VehicleCard[]>(initial?.vehicles ?? []);
  const [cursor, setCursor] = useState<string | null>(initial?.nextCursor ?? null);
  const [hasMore, setHasMore] = useState(initial?.hasMore ?? false);
  const [loading, setLoading] = useState(!initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<ViewMode>('grid');

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
              'url(/media/backgrounds/bg-photo-1511919884226-fd3cad34687c.webp)',
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
            {!textQuery ? <span className="text-signal">.</span> : null}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ash">
            Cada vehículo pasa inspección de 120 puntos en origen antes de ser listado. Precios
            mostrados son de venta final en destino.
          </p>
          <div className="mt-10">
            <AccordionGallery
              height={420}
              accentColor="#e8000d"
              overlayColor="#050507"
              grayscale={false}
              items={vehicles.slice(0, 5).map((v) => ({
                image: v.primaryImageUrl ?? v.thumbnailUrl ?? v.media?.[0]?.url ?? '/media/vehicles/porsche-911.webp',
                label: `${v.brand} ${v.model}`,
                alt: `${v.brand} ${v.model} ${v.year}`,
                link: `/${locale}/vehiculos/${v.slug}`,
              }))}
            />
          </div>
          <div className="mt-8 max-w-md">
            <SearchBar placeholder="Filtrar por marca o modelo…" />
          </div>
        </div>
      </section>

      {/* ============================== TOOLBAR ============================== */}
      {/* Slim bar: count + view toggle + sort. The filter rail lives in the aside
          below, permanently visible from lg up (no accordion needed there). */}
      <section className="sticky top-18 z-[150] border-b border-line bg-ink/88 backdrop-blur-xl">
        <div className="container-x flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-expanded={panelOpen}
              className={cn(
                'flex items-center gap-2 border px-4 py-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors lg:hidden',
                panelOpen || activeCount > 0
                  ? 'border-signal text-signal'
                  : 'border-line text-ash hover:border-signal hover:text-signal',
              )}
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={1.7} />
              Filtros
              {activeCount > 0 ? (
                <span className="flex size-4 items-center justify-center bg-signal text-[9px] text-ink">
                  {activeCount}
                </span>
              ) : null}
            </button>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-ash uppercase transition-colors hover:text-signal"
              >
                <X className="size-3" /> Limpiar
              </button>
            ) : null}
            <span className="hidden text-[10px] tracking-[0.2em] text-ash uppercase sm:inline">
              {loading ? 'Cargando…' : `${vehicles.length}${hasMore ? '+' : ''} resultados`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SquishSwitch
              checked={view === 'list'}
              onChange={(v) => setView(v ? 'list' : 'grid')}
              label="Modo de visualización"
              width={64}
              height={30}
            />
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => set('sort', e.target.value)}
                aria-label="Ordenar"
                className="appearance-none border border-line bg-ink-2 py-2.5 pr-9 pl-4 text-[10px] font-medium tracking-[0.16em] text-smoke uppercase outline-none transition-colors hover:border-signal focus:border-signal"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-signal"
                strokeWidth={1.8}
              />
            </div>
          </div>
        </div>

        {/* Mobile/tablet filters: same fields as the desktop rail. */}
        <AnimatePresence>
          {panelOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-line bg-ink-2 lg:hidden"
            >
              <div className="container-x py-8">
                <FilterFields filters={filters} facets={facets} set={set} clearAll={clearAll} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* ================== FILTERS (desktop rail) + RESULTS ================== */}
      <section className="container-x py-12 lg:py-16">
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-[10px] font-semibold tracking-[0.24em] text-smoke uppercase">
                  Filtrar
                </span>
                {activeCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[10px] tracking-[0.18em] text-ash uppercase transition-colors hover:text-signal"
                  >
                    Limpiar ({activeCount})
                  </button>
                ) : null}
              </div>
              <FilterFields filters={filters} facets={facets} set={set} clearAll={clearAll} />
            </div>
          </aside>

          <div>
            {loading ? (
              view === 'grid' ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <VehicleCardSkeleton key={i} wide={i === 0 || i === 3} />
                  ))}
                </div>
              ) : (
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <VehicleRowSkeleton key={i} />
                  ))}
                </div>
              )
            ) : vehicles.length === 0 ? (
              <div className="border border-line px-6 py-24 text-center">
                <h2 className="font-display text-2xl text-smoke">Sin resultados</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-ash">
                  No encontramos vehículos con esos criterios. Ajusta los filtros o cuéntanos qué
                  buscas y lo conseguimos por ti.
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
                {view === 'grid' ? (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-6">
                    {vehicles.map((v, i) => (
                      <VehicleCardItem
                        key={v.id}
                        vehicle={v}
                        index={i % 12}
                        priority={i < 3}
                        wide={i % 4 === 0 || i % 4 === 3}
                      />
                    ))}
                  </div>
                ) : (
                  <AnimatedList
                    bare
                    width="100%"
                    items={vehicles.map((v) => ({ id: v.id, title: `${v.brand} ${v.model}` }))}
                    renderItem={(_, i) => <VehicleRow vehicle={vehicles[i]} index={i % 12} />}
                    animation="slide"
                    stagger={0.05}
                    selectOnHover={false}
                    enableArrowNavigation={false}
                    showGradients={false}
                    displayScrollbar={false}
                    maxHeight="none"
                    className="border-t border-line"
                    itemClassName="border-b border-line"
                  />
                )}

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
          </div>
        </div>
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
      <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">{label}</span>
      <div className="relative mt-2.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border border-line bg-ink py-3 pr-9 pl-4 text-sm text-smoke outline-none transition-colors hover:border-signal/50 focus:border-signal"
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
      <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">{label}</span>
      <div className="mt-2.5 flex items-center gap-2">
        <input
          value={min}
          onChange={(e) => onMin(e.target.value.replace(/\D/g, ''))}
          placeholder={placeholder}
          inputMode="numeric"
          className="w-full border border-line bg-ink px-3 py-3 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
        />
        <span className="text-ash">—</span>
        <input
          value={max}
          onChange={(e) => onMax(e.target.value.replace(/\D/g, ''))}
          placeholder={placeholder}
          inputMode="numeric"
          className="w-full border border-line bg-ink px-3 py-3 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
        />
      </div>
    </div>
  );
}

/* ------------------------------ Sub-components ----------------------------- */

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={cn(
        'flex size-9 items-center justify-center transition-colors',
        active
          ? 'bg-signal text-ink'
          : 'text-ash hover:bg-ink-3 hover:text-smoke',
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/**
 * One definition of the filter fields, rendered twice: inside the mobile/tablet
 * accordion (2 up) and in the desktop rail (1 up). Both instances read and write
 * the same state, so they can never disagree.
 */
function FilterFields({
  filters,
  facets,
  set,
  clearAll,
}: {
  filters: Filters;
  facets: Facets | null;
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearAll: () => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
      <SelectField
        label="Marca"
        value={filters.brand}
        onChange={(v) => set('brand', v)}
        options={(facets?.brands ?? []).map((b) => ({
          value: b.value,
          label: `${b.value} (${b.count})`,
        }))}
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
  );
}
