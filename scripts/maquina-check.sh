#!/usr/bin/env bash
# Diagnóstico portátil de una máquina: comprueba lo que falla cuando opencode
# "de un momento a otro" empieza a dar problemas (bucle de continuidad, MCP
# caídos, config sin recargar, sincronización vieja del kit).
#
# Uso:  scripts/maquina-check.sh [dir-del-proyecto]   # por defecto, el kit
#       MCP_LIST=1 scripts/maquina-check.sh            # añade `opencode mcp list` (lento)
#
# Sale con 1 si algún check OBLIGATORIO falla; los opcionales solo avisan.
set -uo pipefail

TARGET="${1:-}"
KIT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
# ~/.local/bin no siempre está en PATH en shells no interactivos (uv, graphify)
PATH="$HOME/.local/bin:$PATH"
FIX_FRASE="UNA vez por sesión"
FAIL=0
WARN=0

ok()   { printf '  [OK]   %s\n' "$1"; }
warn() { printf '  [WARN] %s\n' "$1"; WARN=$((WARN+1)); }
bad()  { printf '  [FAIL] %s\n' "$1"; FAIL=$((FAIL+1)); }

echo "== opencode =="
if command -v opencode >/dev/null 2>&1; then
  ok "opencode $(opencode --version 2>/dev/null | head -1)"
else
  bad "opencode no está en PATH"
fi

echo "== Fix anti-bucle (commit del kit) =="
# El fix vive en AGENTS.md/templates/AGENTS.md/docs/sesion.md: si la frase no
# está, esa máquina tiene el kit viejo -> bucle "leer MEMORY en cada respuesta".
if grep -qs "$FIX_FRASE" "$KIT_DIR/AGENTS.md" "$KIT_DIR/templates/AGENTS.md"; then
  ok "regla anti-bucle presente en $KIT_DIR"
else
  bad "kit desactualizado en $KIT_DIR -> git pull (falta fix anti-bucle)"
fi

echo "== Config global del MCP github =="
GLOBAL_CFG="$HOME/.config/opencode/opencode.jsonc"
if [[ -f "$GLOBAL_CFG" ]]; then
  ok "existe $GLOBAL_CFG"
  grep -q '"github"' "$GLOBAL_CFG" && ok "MCP github declarado" \
    || bad "MCP github ausente en config global"
  grep -q '"oauth": false' "$GLOBAL_CFG" && ok "oauth:false (GitHub no soporta DCR)" \
    || warn '"oauth": false no visto (puede romper la auth del MCP github)'
else
  bad "no existe $GLOBAL_CFG (MCP github no puede cargar)"
fi
if [[ -n "${GH_TOKEN:-}" ]]; then
  ok "GH_TOKEN exportado en esta sesión"
elif grep -qs 'GH_TOKEN' "$HOME/.bashrc" "$HOME/.profile" "$HOME/.zshrc"; then
  warn "GH_TOKEN declarado en shell rc pero no exportado aquí (abre terminal nueva)"
else
  bad "GH_TOKEN sin exportar -> export GH_TOKEN=\"\$(gh auth token)\" en ~/.bashrc"
fi
command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1 \
  && ok "gh autenticado" || warn "gh no autenticado (GH_TOKEN puede caducar)"

echo "== Sincronización del kit con el proyecto =="
if [[ -z "$TARGET" ]]; then
  warn "sin dir del proyecto: omite sync.sh --check (pásalo como argumento)"
elif [[ -x "$KIT_DIR/sync.sh" ]]; then
  if "$KIT_DIR/sync.sh" --check --target "$TARGET" >/tmp/maquina-check-sync.$$ 2>&1; then
    ok "$TARGET en sincronía con el kit"
  else
    bad "$TARGET DESINCRONIZADO -> sync.sh --target $TARGET (detalle abajo)"
    sed 's/^/         /' /tmp/maquina-check-sync.$$
  fi
  rm -f /tmp/maquina-check-sync.$$
else
  bad "no se encontró sync.sh en $KIT_DIR"
fi

echo "== Herramientas externas =="
for c in graphify python3 ffmpeg git; do
  command -v "$c" >/dev/null 2>&1 && ok "$c" || warn "$c ausente"
done

echo "== CDP (navegador para MCP playwright/chrome-devtools) =="
if curl -sf http://localhost:9222/json/version >/dev/null 2>&1; then
  ok "CDP arriba en :9222"
else
  warn "CDP caído (informativo) -> bash $KIT_DIR/scripts/chrome-debug.sh"
fi

if [[ "${MCP_LIST:-0}" == "1" ]]; then
  echo "== opencode mcp list (lento, opcional) =="
  timeout 60 opencode mcp list > /tmp/maquina-check-mcp.$$ 2>&1
  rc=$?
  sed 's/^/         /' /tmp/maquina-check-mcp.$$
  rm -f /tmp/maquina-check-mcp.$$
  [[ $rc -eq 0 ]] && ok "mcp list ejecutado" || warn "opencode mcp list falló o timeout"
fi

echo
echo "Resultado: $FAIL fallo(s) obligatorio(s), $WARN aviso(s)."
[[ "$FAIL" -eq 0 ]] || exit 1
