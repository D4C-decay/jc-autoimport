# DESIGN.md — Contrato visual de JC Autoimport (web) · v2

> Fuente de verdad del diseño de `apps/web`. Cualquier cambio visual DEBE respetar
> este contrato. Si necesitas romperlo, primero actualiza este archivo.
> Los tokens viven en `apps/web/src/app/globals.css`; aquí se documentan y se fijan las reglas.
> **v2 (Oleada 0 — Freeze)**: síntesis Koenigsegg × Bugatti × Lamborghini, rojo `#e8000d`,
> i18n es/en con `next-intl`, rutas congeladas. Decisiones de usuario registradas abajo.

## 0. Dirección y referencias

Tres referencias (auditoría 2026-10-18), cada una aporta una pieza:

| Referencia | Rol | Pieza |
|---|---|---|
| [koenigsegg.com/home](https://www.koenigsegg.com/home) | **Base + hero** | Aire, limpieza editorial; hero con titular apilado + foto full-bleed oscurecida + carril de vehículos |
| [bugatti.com](https://www.bugatti.com/) | **Detalle (catálogo)** | Cards tipo "modelo": `ink-3` + borde `line`, hover-reveal, descriptor poético |
| [lamborghini.com/es-en](https://www.lamborghini.com/es-en) | **Giro de marca** | Negro puro, rojo agresivo, cortes angulares (`clip-slant`), footer de 4 columnas |

- **Base**: sistema Koenigsegg (aire/limpieza) · **Identidad**: giro Lamborghini · **Detalle**: cards Bugatti.
- **Decisión de usuario (moodboard, 2026-10-18)**: tipografía **Archivo Black + Inter** (se mantiene).
- **Decisión de usuario (moodboard, 2026-10-18)**: rojo de marca **`#e8000d`** (Rosso Corsa).
- Animación: **framer-motion + react-bits (0 dependencias) + toggle "Permitir animaciones"**. Sin GSAP ni WebGL.

## 1. Identidad

- Marca: **JC Autoimport** — importación y venta de vehículos premium.
- Tono: editorial, sobrio, cinematográfico. Negro puro + blanco humo + **rojo señal**.
- Proporción de color **60/30/10**: 60% negro (`ink`), 30% blanco (`smoke`), 10% rojo (`signal`).
- El giro Lamborghini NO convierte la página en "negro+rojo absoluto": se conserva el aire
  Koenigsegg; la agresividad entra por acentos, cortes angulares y el hero.

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
| `--color-signal` | **`#e8000d`** | Acento/CTA (SOLO 10%) |
| `--color-signal-light` | `#ff3d46` | Hover/acento suave |
| `--color-signal-dark` | `#9c000a` | Acento profundo |

Modo **claro** (`html[data-theme='light']`): `--color-signal` se mantiene `#e8000d`;
`--color-signal-light: #a3000a`, `--color-signal-dark: #9c000a`; `--color-ink`→`#f5f5f6`,
`--color-smoke`→`#0c0c0f`, etc. La UI cambia sin tocar clases.

**Reglas**:
- Nunca escribir hex directamente en componentes; usar `var(--color-*)` o utilidades Tailwind
  (`bg-ink`, `text-smoke`, `border-line`, `text-signal`). **Prohibido `#f02434` (rojo antiguo)**.
- El rojo `signal` es escaso: CTAs, un acento por sección, estados activos. Nunca fondos grandes.
- Glows rojos en `rgba(232, 0, 13, …)` (carril destacado, textos con glow).
- Contraste mínimo **WCAG AA** (4.5:1 texto normal). Cuidado con `white/NN` sobre imágenes.

## 3. Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | Archivo Black (`font-display`) | Títulos, cifras grandes, kickers |
| Cuerpo | Inter (`font-sans`) | Párrafos, UI, botones |

- Ambas vía `next/font`, expuestas como `--font-archivo` / `--font-inter`.
- Titulares: display, `uppercase` cuando sea "kicker"/etiqueta, tracking ajustado; titulares
  hero apilados en 2–3 líneas con `<br/>` y `leading-[0.86]`.
- Cuerpo: 14–18px, `leading-relaxed` en párrafos largos. Evitar >3 tamaños por sección.

## 4. Contratos de sección (piezas ancla)

### 4.1 Hero Koenigsegg (home)
- Titular display apilado 2–3 líneas sobre foto/full-bleed oscurecida (`hero-video`).
- **Carril de 3–5 vehículos reales** (`featured-rail`, carril N+1) con CTA "Descubrir →" a
  `/vehiculo/[slug]`. Nunca inventar unidades: solo datos reales del catálogo.

### 4.2 Card Bugatti (catálogo y ficha)
- Superficie `ink-3` + borde `line`, radio `rounded-2xl`; hover-reveal (imagen/descriptor).
- Descriptor poético corto + chips: año · km · precio (formato `es`).
- Grid catálogo: 6 columnas desktop; cada 4ª tarjeta es banda a ancho completo (21/9).
- Scroll: `snap` + drag con framer-motion. **La ficha `/vehiculo/[slug]` hereda el mismo contrato.**

### 4.3 Footer Lamborghini (global)
- 4 columnas: navegación · servicios (con filtros de query) · contacto (tel/email/dirección) ·
  marca/tagline con wordmark. Fila inferior: copyright + aviso educativo + links legales.
- Acento rojo en hover (`text-signal`) y en los títulos de columna (`text-signal uppercase`).
- El **switcher es/en se difunde en Wave 3** (ahora solo nav/footer/metadata/404).

## 5. Espaciado, layout y cortes

- Contenedor: utilidad `container-x` (definida en `globals.css`) → `max-w-90rem`,
  padding lateral 20px móvil / 40px md / 64px xl.
- Ritmo vertical de sección: `py-20`–`py-28`.
- Radios: tarjetas `rounded-2xl`, botones `rounded-full`, superficies `rounded-xl`.
- Utilidades de identidad: `clip-slant`, `clip-slant-sm` (**giro Lambo: cortes angulares**),
  `text-outline`, `grain`.
- Sombras difusas y oscuras; glow rojo reservado (`.rail-card` con `--k`); sin bordes duros.

## 6. Movimiento (`motion`)

- **Stack**: framer-motion (reveals, drag del carrusel) + selección custodiada de
  **react-bits (0 dependencias)** — catálogo en el kit
  (`templates/react-bits/CATALOGO.md` + `seleccionados/`), clon de trabajo temporal en
  `/tmp/opencode/react-bits`. Nada con dependencias externas.
- **Toggle "Permitir animaciones"** (persistente) que corta las animaciones por JS además
  del corte CSS por defecto.
- Easing de marca: `--ease-out-expo` = `cubic-bezier(0.16, 1, 0.3, 1)`.
- Duraciones: 150–250ms microinteracción; 400ms transiciones; reveals por scroll.
- `prefers-reduced-motion: reduce` **obliga** a neutralizar animaciones (`globals.css` ya lo hace);
  los componentes que ramifican con `useReducedMotion()` deben evitar desajuste de hidratación
  (gatear con `mounted`, patrón documentado en MEMORY.md).
- **Nunca** animar el `transform` del carril con framer-motion (usa rAF y escribe
  `style.transform` a mano).

## 7. Internacionalización (es/en, `next-intl`)

- **Routing** (`src/i18n/routing.ts`): locales `['es','en']`, `defaultLocale: 'es'`,
  `localePrefix: 'as-needed'` (`/` = es canónico, `/en/...` = inglés).
- **Middleware** (`src/middleware.ts`): `createMiddleware(routing)` + protección `/cuenta`
  (redirect a `/{locale}/login?next=…` preservando prefijo).
- **Mensajes** (`src/i18n/messages/{es,en}.json`): namespaces `Navigation`, `Footer`,
  `Metadata`, `NotFound`. **Claves obligatorias**: todo texto de chrome (nav/footer/404/metadata)
  pasa por `t()`; añadir clave = añadir en AMBOS locales (si no, `MISSING_MESSAGE`).
- **Navegación**: siempre `Link`/`usePathname`/`useRouter` de `@/i18n/navigation`
  (`createNavigation(routing)`); **nunca** `next/link` ni `window.location` para rutas internas.
- **Interim (Oleada 0)**: solo chrome cableado. Copy y metadata de páginas internas siguen en
  ES hasta Wave 3 (varias en ese momento). Las descripciones de vehículos de la BD quedan en ES.
- **404**: `[locale]/[...rest]` llama `notFound()` → `[locale]/not-found` (localized);
  `request.ts` llama `notFound()` ante locale inválido (`/fr/...`). Nota conocida: el shell
  documental del 404 sale con `<html id="__next_error__">` sin `lang` (comportamiento de Next;
  el contenido, título y `noindex` sí son correctos).

### Rutas congeladas (Oleada 0 — no renombrar/mover sin actualizar este listado)
`/[locale]/` (home) · `catalogo` · `contacto` · `proceso` · `login` · `registro` ·
`verificar` · `cuenta` · `vehiculo/[slug]` · `[...rest]` (404) — cada una en `es` y `en`;
más `backend/[...path]` (API, fuera de i18n), `robots.txt`, `sitemap.xml`, `icon.png`.

## 8. Componentes canónicos (reutilizar, no reinventar)

Localizados en `apps/web/src/components/`:
- `hero-video`, `featured-rail` (carril N+1), `vehicle-card`, `vehicle-row`, `search-bar`,
  `catalog-page`, `vehicle-detail-page`, `lead-form`, `login-page`, `theme-toggle`,
  `motion` (Reveal, CustomCursor), `navbar` (i18n), `footer` (i18n), `email-verify-banner`,
  `two-factor-settings`.
- Estados obligatorios: loading, empty ("Sin resultados"), error, sin imagen (`VehiclePhoto` fallback).

## 9. Accesibilidad

- Foco visible global: `outline: 2px solid var(--color-signal)` (`:focus-visible`).
- Todo control interactivo: foco visible, `aria-*` correcto, navegable por teclado.
- Imágenes con `alt`; decorativas con `aria-hidden`.
- Respetar `prefers-reduced-motion` y `prefers-color-scheme` vía el toggle de tema.
- `<html lang>` correcto por locale (layout `[locale]`); 404 con `noindex`.

## 10. Datos y medios

- Imágenes de vehículos: WebP propios en `public/media/vehicles/` (`imageForVehicle`); nunca URLs externas.
- Fondo/hero: `public/media/backgrounds/` y `public/media/hero-loop.mp4` (ver `CREDITS.md`).
- Textos y precios: formato `es` (separador de miles). Nunca inventar specs reales en la UI pública.

## 11. Checklist antes de dar por bueno un cambio visual

1. ¿Usa tokens, no hex sueltos (y `#e8000d`, no el rojo viejo)? 2. ¿El rojo es ≤10%?
3. ¿Contraste AA en ambos temas? 4. ¿Funciona en 390px sin scroll horizontal?
5. ¿`prefers-reduced-motion` neutraliza animación? 6. ¿Sin errores de consola ni de hidratación?
7. ¿`npx tsc --noEmit` + `npm run build` en verde? 8. ¿Textos de chrome vía `t()` y claves en
es+en? 9. ¿Enlaces internos con `Link` de `@/i18n/navigation`? 10. ¿Rutas respetan el listado
congelado de la §7?
