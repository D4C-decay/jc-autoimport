---
name: web-design-system
description: Use when building or reviewing any UI (components, pages, CSS, color, typography, layout). Loads the versioned visual contract DESIGN.md and the real design tokens so generated UI stays on-brand.
---

# Design system del proyecto

Antes de tocar UI, lee el contrato y los tokens reales. **No improvises estilo.**

## Pasos

1. Lee **`./DESIGN.md`** (contrato visual versionado) y respétalo: dirección de arte,
   paleta, tipografía, espaciado, radios y tono.
2. Lee la **fuente de tokens** del proyecto y detecta dónde viven:
   - Next.js (Tailwind v4): `./src/app/globals.css` (bloque `@theme` con `--color-*`, `--font-*`).
   - Tailwind v3: `./tailwind.config.*` + `./src/app/globals.css` (`:root { --* }`).
   - Vite/CSS plano: `./src/styles/*.css` o `./src/index.css`.
3. Mira **2–3 componentes de referencia** ya existentes en el proyecto y replica su estilo;
   **no inventes** uno nuevo. Si no hay ninguno, deriva el estilo de `DESIGN.md`.
4. Escribe el componente/página usando **tokens** (`bg-*`, `text-*`, `border-*`, `font-display`,
   `var(--color-*)`), **nunca hex sueltos**. Añade un token nuevo a `DESIGN.md` si de verdad falta.

## Reglas duras (genéricas)

- **Paleta:** respeta la proporción del contrato (p. ej. 60/30/10). El acento de marca es **escaso**
  (≤10%), nunca fondo de áreas grandes.
- **Tipografía:** usa las familias declaradas (`font-display` / `font-sans`, etc.). No mezcles
  familias fuera del contrato.
- **Movimiento:** usa las curvas declaradas; respeta `prefers-reduced-motion` (gatea la animación
  con `mounted`/media query, nunca en el primer render → evita mismatch de hidratación).
- **Accesibilidad:** contraste AA, foco visible, `alt`/`aria-*`/`label` correctos, texto real
  (sin lorem ipsum).
- **Imágenes:** formatos optimizados del proyecto (`next/image` o equivalentes) con fallback.
- **Responsive:** móvil **390px sin scroll horizontal**; mobile-first.

## Verificación obligatoria

- `npm run typecheck`/`lint` y `npm run build` en verde (durante una oleada paralela A/B/C,
  solo `npx tsc --noEmit`: el `build` lo hace `build-verifier`).
- Revisar en navegador (CDP) a **1440px y 390px**, en **modo claro y oscuro**: sin overflow,
  sin errores de consola/hidratación.
- Tras `build` de la web **reiniciar** el server standalone si lo sirve así (si no, sirve CSS
  roto). Ver el skill `web-known-traps`.
