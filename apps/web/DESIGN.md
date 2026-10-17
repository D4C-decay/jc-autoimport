# DESIGN.md — Contrato visual de JC Autoimport (web)

> Fuente de verdad del diseño de `apps/web`. Cualquier cambio visual DEBE respetar
> este contrato. Si necesitas romperlo, primero actualiza este archivo.
> Los tokens viven en `apps/web/src/app/globals.css`; aquí se documentan y se fijan las reglas.

## 1. Identidad

- Marca: **JC Autoimport** — importación y venta de vehículos premium.
- Tono: editorial, sobrio, cinematográfico. Negro carbón + blanco humo + **rojo señal**.
- Proporción de color **60/30/10**: 60% negro (`ink`), 30% blanco (`smoke`), 10% rojo (`signal`).
- Tipografía: display **Archivo Black**, texto **Inter** (vía `next/font`, expuestas como
  `--font-archivo` / `--font-inter`).

## 2. Color (tokens reales, `globals.css`)

Modo **oscuro (por defecto)**:

| Token | Valor | Uso |
|---|---|---|
| `--color-ink` | `#08080a` | Fondo base |
| `--color-ink-2` | `#0e0e12` | Superficie elevada |
| `--color-ink-3` | `#16161c` | Superficie de tarjeta |
| `--color-smoke` | `#f4f4f5` | Texto principal |
| `--color-ash` | `#96969e` | Texto secundario |
| `--color-line` | `#26262e` | Bordes/divisores |
| `--color-signal` | `#f02434` | Acento/CTA (SOLO 10%) |
| `--color-signal-light` | `#ff6b6b` | Hover/acento suave |
| `--color-signal-dark` | `#8f1018` | Acento profundo |

Modo **claro** (`html[data-theme='light']`): se re-declaran los mismos tokens; la UI
cambia sin tocar clases. `--color-ink`→`#f5f5f6`, `--color-smoke`→`#0c0c0f`, etc.

**Reglas**:
- Nunca escribir hex directamente en componentes; usar `var(--color-*)` o utilidades Tailwind
  (`bg-ink`, `text-smoke`, `border-line`, `text-signal`).
- El rojo `signal` es escaso: CTAs, un acento por sección, estados activos. Nunca fondos grandes.
- Contraste mínimo **WCAG AA** (4.5:1 texto normal). Cuidado con `white/NN` sobre imágenes.

## 3. Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | Archivo Black (`font-display`) | Títulos, cifras grandes, kickers |
| Cuerpo | Inter (`font-sans`) | Párrafos, UI, botones |

- Titulares: display, `uppercase` cuando sea "kicker"/etiqueta, tracking ajustado.
- Cuerpo: 14–18px, `leading-relaxed` en párrafos largos.
- Evitar más de 3 tamaños por sección.

## 4. Espaciado, layout y radios

- Contenedor: utilidad `container-x` (`.opencode/…` no; definida en `globals.css`) → `max-w-90rem`,
  padding lateral 20px móvil / 40px md / 64px xl.
- Ritmo vertical de sección: `py-20`–`py-28`.
- Grid catálogo: 6 columnas en desktop; cada 4ª tarjeta es banda a ancho completo (21/9).
- Radios: tarjetas `rounded-2xl`, botones `rounded-full`, superficies `rounded-xl`.
- Utilidades de identidad: `clip-slant`, `clip-slant-sm`, `text-outline`, `grain`.

## 5. Profundidad y sombras

- Sombras difusas y oscuras; el glow rojo se reserva al carril destacado (`.rail-card` con `--k`).
- Sin bordes duros brillantes; usar `border-line` + fondo elevado.

## 6. Movimiento (`motion`)

- Easing de marca: `--ease-out-expo` = `cubic-bezier(0.16, 1, 0.3, 1)`.
- Duraciones: 150–250ms microinteracción; 400ms transiciones; reveals por scroll.
- `prefers-reduced-motion: reduce` **obliga** a neutralizar animaciones (`globals.css` ya lo hace);
  los componentes que ramifican con `useReducedMotion()` deben evitar desajuste de hidratación
  (gatear con `mounted`, patrón ya documentado en MEMORY.md).
- **Nunca** animar el `transform` del carril con Framer Motion (usa rAF y escribe `style.transform` a mano).

## 7. Componentes canónicos (reutilizar, no reinventar)

Localizados en `apps/web/src/components/`:
- `hero-video`, `featured-rail` (carril N+1), `vehicle-card`, `vehicle-row`, `search-bar`,
  `catalog-page`, `vehicle-detail-page`, `lead-form`, `login-page`, `theme-toggle`,
  `motion` (Reveal, CustomCursor), `navbar`, `footer`, `email-verify-banner`, `two-factor-settings`.
- Estados obligatorios: loading, empty ("Sin resultados"), error, sin imagen (`VehiclePhoto` fallback).

## 8. Accesibilidad

- Foco visible global: `outline: 2px solid var(--color-signal)` (`:focus-visible`).
- Todo control interactivo: foco visible, `aria-*` correcto, navegable por teclado.
- Imágenes con `alt`; decorativas con `aria-hidden`.
- Respetar `prefers-reduced-motion` y `prefers-color-scheme` vía el toggle de tema.

## 9. Datos y medios

- Imágenes de vehículos: WebP propios en `public/media/vehicles/` (`imageForVehicle`); nunca URLs externas.
- Fondo/hero: `public/media/backgrounds/` y `public/media/hero-loop.mp4` (ver `CREDITS.md`).
- Textos y precios: formato `es` (separador de miles). Nunca inventar specs reales en la UI pública.

## 10. Checklist antes de dar por bueno un cambio visual

1. ¿Usa tokens, no hex sueltos? 2. ¿El rojo es ≤10%? 3. ¿Contraste AA en ambos temas?
4. ¿Funciona en 390px sin scroll horizontal? 5. ¿`prefers-reduced-motion` neutraliza animación?
6. ¿Sin errores de consola ni de hidratación? 7. ¿`typecheck` + `build` en verde?
