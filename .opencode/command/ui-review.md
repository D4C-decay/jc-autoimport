---
description: Revisa la UI de la web con capturas reales (claro/oscuro, desktop/móvil)
agent: ui-reviewer
---

Revisa la interfaz de la web pública usando el navegador por CDP.

Rutas a revisar: $ARGUMENTS
(si no se indican, usa `/`, `/catalogo`, `/contacto`, `/proceso`, `/login`).

1. Asegura el navegador: `bash scripts/chrome-debug.sh` (CDP en http://localhost:9222).
2. La web local sirve en http://http://localhost:3000. Captura a 1440×900 y 390×844, en modo claro y oscuro.
3. Compara con `./DESIGN.md`. Reporta `ruta | severidad(P0/P1/P2) | evidencia | impacto | sugerencia`.
4. Veredicto final: ¿pasa el contrato visual? ¿qué bloquea?

No edites código.
