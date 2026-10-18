#!/usr/bin/env bash
# new-web.sh - crea un proyecto web nuevo y le aplica el kit de opencode.
#
# Uso:
#   scripts/new-web.sh <dir> [next|vite|static] [--force] [--no-sync] [--skip-install]
#
#   next    Next.js (App Router, TypeScript, Tailwind, ESLint)
#   vite    Vite + React + TypeScript
#   static  HTML/CSS/JS sin build (index.html + styles.css + assets/)
#
# Después del scaffolding ejecuta sync.sh para instalar agentes, skills y plugins.
# El AGENTS.md que genere el framework (si lo hay) se conserva en
# .opencode/AGENTS.framework.md para no pisar el del kit.
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Uso: scripts/new-web.sh <dir> [next|vite|static] [--force] [--no-sync] [--skip-install]

  <dir>            carpeta destino del proyecto
  next|vite|static tipo de proyecto (si se omite y hay terminal, se pregunta)
  --force          permite usar una carpeta que ya tiene contenido
  --no-sync        solo scaffolding; no ejecuta sync.sh
  --skip-install   no instala dependencias (solo next/vite)
  -h, --help       esta ayuda
EOF
}

TARGET=""
KIND=""
FORCE=false
DO_SYNC=true
SKIP_INSTALL=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=true; shift ;;
    --no-sync) DO_SYNC=false; shift ;;
    --skip-install) SKIP_INSTALL=true; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "[new-web] opción desconocida: $1"; usage; exit 1 ;;
    *)
      if [[ -z "$TARGET" ]]; then TARGET="$1"
      elif [[ -z "$KIND" ]]; then KIND="$1"
      else echo "[new-web] argumento de sobra: $1"; usage; exit 1
      fi
      shift ;;
  esac
done

if [[ -z "$TARGET" ]]; then usage; exit 1; fi

if [[ -z "$KIND" ]]; then
  if [[ -t 0 ]]; then
    echo "¿Qué tipo de proyecto?"
    select k in next vite static; do KIND="$k"; break; done
  else
    KIND=static
    echo "[new-web] sin terminal interactiva: uso 'static' por defecto"
  fi
fi

case "$KIND" in
  next|vite|static) ;;
  *) echo "[new-web] tipo inválido: $KIND (usa next, vite o static)"; exit 1 ;;
esac

if [[ -e "$TARGET" && ! -d "$TARGET" ]]; then
  echo "[new-web] $TARGET existe y no es un directorio"; exit 1
fi
if [[ -d "$TARGET" && -n "$(ls -A "$TARGET" 2>/dev/null)" && "$FORCE" != true ]]; then
  echo "[new-web] $TARGET ya tiene contenido. Usa --force si quieres añadir el proyecto encima."
  exit 1
fi

BASE="$(cd "$(dirname "$TARGET")" && pwd)"
NAME="$(basename "$TARGET")"
ABS="$BASE/$NAME"

echo "[new-web] destino: $ABS (tipo: $KIND)"

case "$KIND" in
  next)
    args=(--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes)
    [[ "$SKIP_INSTALL" == true ]] && args+=(--skip-install)
    npx --yes create-next-app@latest "$ABS" "${args[@]}"
    ;;
  vite)
    ( cd "$BASE" && npm create vite@latest "$NAME" -- --template react-ts )
    if [[ "$SKIP_INSTALL" != true ]]; then
      ( cd "$ABS" && npm install --no-audit --no-fund )
    fi
    ;;
  static)
    mkdir -p "$ABS/assets"
    cat > "$ABS/index.html" <<HTML
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>$NAME</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <header class="site-header"><a class="brand" href="./">$NAME</a></header>
    <main class="site-main">
      <h1>Hola, mundo</h1>
      <p>Proyecto estático listo. Sustituye este contenido por el del sitio real.</p>
    </main>
    <footer class="site-footer">© $NAME</footer>
    <script src="./main.js" defer></script>
  </body>
</html>
HTML
    cat > "$ABS/styles.css" <<'CSS'
:root {
  --bg: #ffffff;
  --fg: #111111;
  --muted: #666666;
  --max: 72rem;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
  line-height: 1.6;
}
.site-header, .site-footer { padding: 1rem max(1rem, calc((100% - var(--max)) / 2)); }
.site-main { padding: 3rem max(1rem, calc((100% - var(--max)) / 2)); min-height: 60vh; }
.brand { color: inherit; font-weight: 700; text-decoration: none; }
.site-footer { color: var(--muted); font-size: .875rem; }
CSS
    printf 'console.log("%s listo");\n' "$NAME" > "$ABS/main.js"
    [[ -f "$ABS/.gitignore" ]] || printf 'node_modules/\n.DS_Store\n' > "$ABS/.gitignore"
    ;;
esac

# El framework puede haber creado su propio AGENTS.md (create-next-app lo hace):
# se conserva como referencia y el del kit ocupa el sitio principal. Se hace
# DESPUÉS del sync para no crear un .opencode sin la marca KIT_MANAGED.
if [[ "$DO_SYNC" == true ]]; then
  "$KIT_DIR/sync.sh" --target "$ABS"
else
  echo "[new-web] --no-sync: recuerda ejecutar $KIT_DIR/sync.sh --target $ABS"
fi

if [[ -f "$ABS/AGENTS.md" ]] && ! cmp -s "$ABS/AGENTS.md" "$KIT_DIR/templates/AGENTS.md"; then
  mkdir -p "$ABS/.opencode"
  mv "$ABS/AGENTS.md" "$ABS/.opencode/AGENTS.framework.md"
  cp "$KIT_DIR/templates/AGENTS.md" "$ABS/AGENTS.md"
  echo "[new-web] AGENTS.md del framework -> .opencode/AGENTS.framework.md (el del kit queda en AGENTS.md)"
fi

cat <<EOF

[new-web] listo: $ABS

Siguientes pasos:
  cd $ABS
$( [[ "$KIND" == static ]] && echo "  # abre index.html en el navegador (o 'python3 -m http.server')" || echo "  npm run dev        # servidor de desarrollo" )
  # en opencode: pide a 'web-builder' la primera página/sección
  # UI: rellena DESIGN.md (contrato visual) antes de construir

Reinicia opencode para que cargue los agentes/plugins recién sincronizados.
EOF
