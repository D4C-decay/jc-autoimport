---
description: Crea un proyecto web nuevo (Next.js/Vite/estático) y le aplica el kit
agent: build
model: opencode/glm-5.3-flash-free
---

Crea un proyecto web nuevo desde cero y déjalo con el kit instalado.

Argumentos del usuario: `$ARGUMENTS`

Pasos:

1. Determina el **directorio destino** y el **tipo** (`next`, `vite` o `static`).
   - Del argumento si viene (p. ej. `mi-sitio next`).
   - Si falta el tipo, **pregunta** con una pregunta corta (opciones: Next.js / Vite + React / Estático sin build). No asumas.
   - Registra también si el usuario pidió `--force`, `--no-sync` o `--skip-install`.
2. Comprueba que existe `scripts/new-web.sh` en este repo (el kit). Si no existe, dilo y para.
3. Ejecuta: `scripts/new-web.sh <dir> <tipo> [flags]`. Si el destino ya tiene contenido, **no** uses `--force` sin preguntar antes.
4. Si el script falla, muestra el error exacto y no continúes.
5. Al terminar, resume en 3–5 líneas: ruta creada, tipo, si se sincronizó el kit y los siguientes pasos (`npm run dev` o abrir `index.html`, rellenar `DESIGN.md`, reiniciar opencode).
6. Recuerda al usuario que **la config de opencode no es hot-reload**: hay que reiniciar para que carguen los agentes/plugins recién sincronizados.

No edites a mano lo que genera el script; si algo falta, dilo.
