#!/usr/bin/env bash
# Lanza un navegador Chromium con CDP expuesto en http://localhost:9222 para que
# opencode (MCP playwright / chrome-devtools) pueda controlarlo.
#
# Brave (Chromium >=136) IGNORA --remote-debugging-port si se usa el perfil por
# defecto, así que SIEMPRE arrancamos con un --user-data-dir dedicado.
#
# Uso:  scripts/chrome-debug.sh          # arranca (o confirma) el navegador CDP
#       CDP_PORT=9222 JCA_CHROME_PROFILE=... scripts/chrome-debug.sh
set -euo pipefail

PORT="${CDP_PORT:-9222}"
PROFILE="${JCA_CHROME_PROFILE:-$HOME/.config/jca-chrome-debug}"
LOG="${JCA_CHROME_LOG:-/tmp/opencode/chrome-debug.log}"
mkdir -p "$PROFILE" "$(dirname "$LOG")"

CANDIDATES=(
  "$(command -v brave 2>/dev/null || true)"
  "/usr/bin/brave"
  "/opt/brave-bin/brave"
  "$(command -v brave-browser 2>/dev/null || true)"
  "$(command -v google-chrome 2>/dev/null || true)"
  "$(command -v google-chrome-stable 2>/dev/null || true)"
  "$(command -v chromium 2>/dev/null || true)"
  "$(command -v chromium-browser 2>/dev/null || true)"
  "$HOME/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
)

BIN=""
for c in "${CANDIDATES[@]}"; do
  if [ -n "$c" ] && [ -x "$c" ]; then BIN="$c"; break; fi
done

if [ -z "$BIN" ]; then
  echo "ERROR: no se encontró ningún navegador Chromium (Brave/Chrome/Chromium/Playwright)." >&2
  exit 1
fi

if curl -sf "http://localhost:${PORT}/json/version" >/dev/null 2>&1; then
  echo "CDP ya escucha en http://localhost:${PORT}"
  curl -s "http://localhost:${PORT}/json/version" | head -c 400; echo
  exit 0
fi

echo "Lanzando: $BIN  (perfil: $PROFILE, CDP :$PORT)"
nohup "$BIN" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-features=Translate,MediaRouter \
  --disable-sync \
  about:blank >"$LOG" 2>&1 &

for _ in $(seq 1 15); do
  if curl -sf "http://localhost:${PORT}/json/version" >/dev/null 2>&1; then
    echo "OK: CDP disponible en http://localhost:${PORT}"
    curl -s "http://localhost:${PORT}/json/version" | head -c 400; echo
    exit 0
  fi
  sleep 1
done

echo "ERROR: el navegador no expuso CDP en ${PORT}. Revisa $LOG" >&2
tail -n 20 "$LOG" >&2 || true
exit 1
