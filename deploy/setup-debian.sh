#!/usr/bin/env bash
#
# Levanta JC Autoimport completo en una maquina Debian limpia.
# Pensado para el portatil: PostgreSQL + Redis + API + web + tunel publico.
#
#   git clone <repo> && cd jc-autoimport
#   bash deploy/setup-debian.sh
#
# Es idempotente: se puede volver a ejecutar sin romper nada.
# NO toca .env si ya existe. NO abre puertos del router.
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="/var/log/jc-autoimport"
CLOUDFLARED_BIN="$HOME/.local/bin/cloudflared"
DB_NAME="${DB_NAME:-jcautoimport}"
DB_USER="${DB_USER:-jcauto}"
RUN_USER="${SUDO_USER:-$(id -un)}"
RUN_GROUP="$(id -gn "$RUN_USER")"

say()  { printf '\n\033[1;36m==>\033[0m \033[1m%s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\n\033[1;33mAVISO\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mERROR\033[0m %s\n' "$*" >&2; exit 1; }

need_sudo() { sudo -v || die "hace falta sudo para instalar paquetes y servicios"; }

# ----------------------------------------------------------------- 0. sistema
need_sudo
say "0/8 Comprobando el sistema"
if [ ! -f /etc/debian_version ]; then
  warn "esto no parece Debian; el script sigue, pero revisa los pasos de paquetes"
fi
info "usuario de servicio: $RUN_USER   proyecto: $PROJECT_DIR"

# ------------------------------------------------------------------ 1. node
say "1/8 Node.js (se necesita 20 o superior)"
NODE_BIN="$(command -v node || true)"
NODE_MAJOR=0
if [ -n "$NODE_BIN" ]; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
fi
if [ "$NODE_MAJOR" -lt 20 ]; then
  info "instalando Node 22 LTS con NodeSource"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
  NODE_BIN="$(command -v node)"
fi
info "node $(node -v) en $NODE_BIN"
[ "$NODE_MAJOR" -lt 20 ] && die "sigue sin verse node >= 20; revisa el PATH"

# -------------------------------------------------------- 2. postgres + redis
say "2/8 PostgreSQL y Redis"
install_pkgs() {
  local missing=()
  for p in "$@"; do
    dpkg -s "$p" >/dev/null 2>&1 || missing+=("$p")
  done
  if [ ${#missing[@]} -gt 0 ]; then
    info "instalando: ${missing[*]}"
    sudo apt-get update -qq
    sudo apt-get install -y --no-install-recommends "${missing[@]}"
  else
    info "ya instalados: $*"
  fi
}
install_pkgs postgresql postgresql-client redis-server ca-certificates curl ca-certificates

for svc in postgresql redis-server; do
  sudo systemctl enable --now "$svc" >/dev/null 2>&1 || true
done
info "postgresql: $(systemctl is-active postgresql)  redis: $(systemctl is-active redis-server)"

# El script de Prisma necesita CREATEDB para su base de datos sombra.
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE $DB_USER LOGIN CREATEDB PASSWORD 'jcauto_password';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "ALTER ROLE $DB_USER CREATEDB;" >/dev/null
info "base $DB_NAME con rol $DB_USER (CREATEDB) lista"

# ------------------------------------------------------------- 3. cloudflared
say "3/8 cloudflared (tunel publico, sin root)"
if [ -x "$CLOUDFLARED_BIN" ]; then
  info "ya instalado: $("$CLOUDFLARED_BIN" --version 2>/dev/null | head -1)"
else
  mkdir -p "$HOME/.local/bin"
  curl -fsSL -o "$CLOUDFLARED_BIN" \
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
  chmod +x "$CLOUDFLARED_BIN"
  info "instalado: $("$CLOUDFLARED_BIN" --version 2>/dev/null | head -1)"
fi

# ------------------------------------------------------------------ 4. .env
say "4/8 Configuracion (.env)"
if [ -f "$PROJECT_DIR/.env" ]; then
  info ".env ya existe: no se toca"
else
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  # Secretos propios por maquina: dos sesiones distintas, valores distintos.
  gen() { openssl rand -hex 32; }
  sed -i "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$(gen)|"  "$PROJECT_DIR/.env"
  sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(gen)|" "$PROJECT_DIR/.env"
  sed -i "s|^NODE_ENV=.*|NODE_ENV=production|"              "$PROJECT_DIR/.env"
  # Por defecto la API solo en loopback: el tunel publico nunca la toca.
  sed -i "s|^API_HOST=.*|API_HOST=127.0.0.1|"                "$PROJECT_DIR/.env"
  chmod 600 "$PROJECT_DIR/.env"
  info ".env creado con secretos aleatorios y API_HOST=127.0.0.1"
fi
info "DATABASE_URL -> $(grep '^DATABASE_URL=' "$PROJECT_DIR/.env" | cut -d= -f2- | sed 's/:[^:@]*@/:***@/')"

# El .env no lo carga solo el CLI de Prisma: se exporta en esta shell.
set -a
# shellcheck disable=SC1091
. "$PROJECT_DIR/.env"
set +a

# -------------------------------------------------------- 5. dependencias
say "5/8 Dependencias"
info "raiz (backend)"
(cd "$PROJECT_DIR" && npm install --no-audit --no-fund)
info "apps/web"
(cd "$PROJECT_DIR/apps/web" && npm install --no-audit --no-fund)
# apps/desktop es opcional: solo si quieres empaquetar el ejecutable.
# info "apps/desktop"; (cd "$PROJECT_DIR/apps/desktop" && npm install --no-audit --no-fund)

# ------------------------------------------------- 6. prisma + migraciones
say "6/8 Base de datos: cliente, migraciones y datos de ejemplo"
(cd "$PROJECT_DIR" && npx prisma generate)
(cd "$PROJECT_DIR" && npx prisma migrate deploy)
if [ "${SKIP_SEED:-0}" != "1" ]; then
  info "sembrando 75 vehiculos y usuarios (idempotente)"
  (cd "$PROJECT_DIR" && npx prisma db seed)
else
  info "SKIP_SEED=1: no se siembran datos"
fi

# ------------------------------------------------------------ 7. builds
say "7/8 Compilando API y web"
(cd "$PROJECT_DIR" && npm run build)
(cd "$PROJECT_DIR/apps/web" && npm run build)
info "recordatorio: tras cada 'npm run build' de la web hay que reiniciar el servicio"

# --------------------------------------------------------- 8. servicios
say "8/8 Servicios de systemd"
sudo mkdir -p "$LOG_DIR"
sudo chown "$RUN_USER:$RUN_GROUP" "$LOG_DIR"
sudo chmod 755 "$LOG_DIR"

for unit in api web tunnel; do
  src="$PROJECT_DIR/deploy/systemd/jc-autoimport-$unit.service"
  [ -f "$src" ] || die "falta $src"
  sed -e "s|%PROJECT_DIR%|$PROJECT_DIR|g" \
      -e "s|%NODE_BIN%|$NODE_BIN|g" \
      -e "s|%CLOUDFLARED_BIN%|$CLOUDFLARED_BIN|g" \
      -e "s|%RUN_USER%|$RUN_USER|g" \
      -e "s|%RUN_USER_HOME%|$HOME|g" \
      -e "s|%RUN_GROUP%|$RUN_GROUP|g" \
      -e "s|%LOG_DIR%|$LOG_DIR|g" \
      "$src" | sudo tee "/etc/systemd/system/jc-autoimport-$unit.service" >/dev/null
  info "instalada /etc/systemd/system/jc-autoimport-$unit.service"
done

sudo systemctl daemon-reload
sudo systemctl enable --now jc-autoimport-api jc-autoimport-web jc-autoimport-tunnel
info "arrancados y habilitados (arrancan solos al encender)"

# ----------------------------------------------------------------- resumen
say "Esperando a que la web responda"
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4200/ || true)"
  [ "$code" = "200" ] && break
  sleep 2
done
[ "$code" = "200" ] || warn "la web local no responde todavia; mira: journalctl -u jc-autoimport-web -n 40"

say "Esperando a que Cloudflare publique el tunel"
URL=""
for i in $(seq 1 40); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" 2>/dev/null | tail -1 || true)"
  [ -n "$URL" ] && break
  sleep 2
done

printf '\n'
say "LISTO"
if [ -n "$URL" ]; then
  printf '    Sitio publico:  \033[1;32m%s\033[0m\n' "$URL"
else
  warn "no encontre la URL del tunel; revisa: journalctl -u jc-autoimport-tunnel -n 40"
fi
info "sitio local:     http://127.0.0.1:4200"
info "API local:       http://127.0.0.1:3000/api/v1/health"
info "Swagger:         http://127.0.0.1:3000/api/docs"
info "API expuesta a internet: NO (solo el puerto 4200 sale por el tunel)"
printf '\n'
info "acceso: admin@jcautoimport.com / Admin123!  -> cambialo en cuanto entres"
info "verificacion completa:  bash deploy/verify.sh"
info "actualizar el codigo:   bash deploy/update.sh"
printf '\n'
warn "Un quick tunnel cambia de URL en cada reinicio. Para una direccion fija"
warn "mete un dominio en Cloudflare y sigue la seccion 'Tunel con nombre' de"
warn "deploy/README.md"
printf '\n'
