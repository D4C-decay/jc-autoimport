---
name: jca-design-system
description: Use when building or reviewing any UI in apps/web of JC Autoimport (components, pages, Tailwind, globals.css, color, typography, layout). Loads the versioned visual contract DESIGN.md and the real design tokens so generated UI stays on-brand (black/white/red, Archivo Black + Inter, light/dark).
---

# JC Autoimport design system

Antes de tocar UI, lee el contrato y los tokens reales. No improvises estilo.

## Pasos

1. Lee **`apps/web/DESIGN.md`** (contrato visual versionado) y respétalo.
2. Lee **`apps/web/src/app/globals.css`** para los tokens vivos (`--color-*`, `--font-*`,
   `--ease-out-expo`, utilidades `container-x`, `clip-slant`, `text-outline`, `grain`).
3. Mira **2–3 componentes de referencia** en `apps/web/src/components/` (p. ej. `vehicle-card.tsx`,
   `navbar.tsx`, `featured-rail.tsx`) y replica su estilo, no inventes uno nuevo.
4. Escribe el componente/página usando **tokens** (`bg-ink`, `text-smoke`, `border-line`,
   `text-signal`) o `var(--color-*)`. Nunca hex sueltos ni latón (ya no existe).

## Reglas duras

- Paleta 60/30/10 negro/blanco/rojo; `--color-signal #f02434` es acento escaso (≤10%), nunca fondo grande.
- Tipografía: `font-display` (Archivo Black) para titulares, `font-sans` (Inter) para cuerpo.
- Movimiento: `--ease-out-expo`; respetar `prefers-reduced-motion`. **No** animar el `transform`
  del carril destacado con Framer Motion (usar rAF + `style.transform`).
- Contraste AA; foco visible; texto real, sin lorem ipsum.
- Imágenes: WebP propios de `public/media/vehicles/` con fallback "Sin imagen".
- Escala y responsive: móvil 390px sin scroll horizontal.

## Verificación obligatoria

- `npm --prefix apps/web run lint` (typecheck) y `npm --prefix apps/web run build`.
- Revisar en navegador (CDP) a 1440px y 390px: sin overflow, sin errores de consola/hidratación,
  en modo claro y oscuro.
- Tras `build` de la web **reiniciar** el server standalone (si no, sirve CSS roto). Ver `jca-known-traps`.
