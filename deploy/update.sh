#!/usr/bin/env bash
#
# Actualiza el codigo y reinicia lo que haga falta.
#
#   bash deploy/update.sh
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
say() { printf '\n\033[1;36m==>\033[0m \033[1m%s\033[0m\n' "$*"; }
has_systemd() { systemctl list-unit-files 2>/dev/null | grep -q "jc-autoimport-web.service"; }

say "git pull"
cd "$PROJECT_DIR"
git pull --ff-only

say "Dependencias"
npm install --no-audit --no-fund
(cd apps/web && npm install --no-audit --no-fund)

say "Cliente de Prisma y migraciones"
npx prisma generate
npx prisma migrate deploy

say "Compilando"
npm run build
(cd apps/web && npm run build)

if has_systemd; then
  say "Reiniciando servicios"
  sudo systemctl restart jc-autoimport-api jc-autoimport-web
  echo "El tunel no se reinicia a proposito: asi no cambia de URL."
  sleep 6
  sudo systemctl --no-pager --lines=0 status jc-autoimport-api jc-autoimport-web | grep -E "Active:" || true
else
  say "Sin systemd: arranca a mano"
  info "API:  (cd $PROJECT_DIR && node dist/src/main.js)"
  info "Web:  (cd $PROJECT_DIR/apps/web && node scripts/start-standalone.mjs)"
fi

say "Verificando"
bash "$PROJECT_DIR/deploy/verify.sh"
