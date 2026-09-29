#!/usr/bin/env bash
#
# Comprueba que todo esta en pie. Ejecutalo cuando algo "no funciona".
#
set -uo pipefail

LOG_DIR="/var/log/jc-autoimport"
[ -r "$LOG_DIR/tunnel.log" ] || LOG_DIR="/tmp/opencode"   # servicios de usuario
ok=0; fail=0
okk()   { printf '  \033[32mOK\033[0m    %s\n' "$*"; ok=$((ok+1)); }
badk()  { printf '  \033[31mFALLA\033[0m %s\n' "$*"; fail=$((fail+1)); }
head1() { printf '\n\033[1;36m%s\033[0m\n' "$*"; }

head1 "Servicios"
# Acepta servicios de sistema (portatil) o de usuario (portatil de escritorio).
active() {
  local s="$1" st
  st="$(systemctl is-active "$s" 2>/dev/null || true)"
  [ "$st" = "active" ] || st="$(systemctl --user is-active "$s" 2>/dev/null || true)"
  printf '%s' "${st:-desconocido}"
}
# Redis y Valkey valen igual: el codigo usa ioredis contra cualquiera de los dos.
redis_st=""
for cand in redis-server redis valkey valkey-server; do
  st="$(active "$cand")"
  [ "$st" = "active" ] && { redis_st="$cand"; break; }
done
[ -n "$redis_st" ] && okk "$redis_st activo" || badk "ningun servicio de redis/valkey activo"

for s in postgresql jc-autoimport-api jc-autoimport-web jc-autoimport-tunnel; do
  st="$(active "$s")"
  if [ "$st" = "active" ]; then
    okk "$s activo"
  else
    # Si el puerto responde, el servicio existe pero esta arrancado a mano.
    case "$s" in
      jc-autoimport-api) probe="http://127.0.0.1:3000/api/v1/health" ;;
      jc-autoimport-web) probe="http://127.0.0.1:4200/" ;;
      *)                probe="" ;;
    esac
    if [ -n "$probe" ] && [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 "$probe" || true)" = "200" ]; then
      okk "$s no gestionado por systemd, pero $probe responde 200"
    else
      badk "$s -> $st"
    fi
  fi
done

head1 "Puertos (solo loopback o red local, nada abierto al exterior por el tunel)"
for p in 3000 4200; do
  if ss -tlnH 2>/dev/null | grep -q ":$p "; then okk "puerto $p escuchando"; else badk "puerto $p sin escuchar"; fi
done

head1 "API"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 http://127.0.0.1:3000/api/v1/health || true)"
[ "$code" = "200" ] && okk "health 200" || badk "health -> ${code:-sin respuesta}"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 http://127.0.0.1:3000/api/docs || true)"
[ "$code" = "200" ] && okk "swagger 200" || badk "swagger -> ${code:-sin respuesta}"

head1 "Web local"
for path in / /catalogo /contacto /proceso /login /sitemap.xml /robots.txt; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:4200$path" || true)"
  [ "$code" = "200" ] && okk "$path 200" || badk "$path -> ${code:-sin respuesta}"
done

head1 "Proxy de la API (/backend)"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 'http://127.0.0.1:4200/backend/api/v1/vehicles?limit=1' || true)"
[ "$code" = "200" ] && okk "permitido: GET vehicles" || badk "GET vehicles -> ${code:-sin respuesta}"
for p in /backend/api/v1/users /backend/api/v1/audit /backend/api/v1/health; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:4200$p" || true)"
  [ "$code" = "404" ] && okk "bloqueado: $p" || badk "$p deberia ser 404, dio ${code:-nada}"
done

head1 "Tunel publico"
URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" 2>/dev/null | tail -1 || true)"
if [ -n "$URL" ]; then
  okk "URL: $URL"
  resolvectl flush-caches >/dev/null 2>&1 || true
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$URL/" || true)"
  [ "$code" = "200" ] && okk "responde 200 desde internet" || badk "responde ${code:-nada} (comprueba DNS o WiFi)"
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$URL/backend/api/v1/vehicles?limit=1" || true)"
  [ "$code" = "200" ] && okk "proxy publico 200" || badk "proxy publico -> ${code:-nada}"
else
  badk "no encuentro la URL en $LOG_DIR/tunnel.log"
fi

head1 "El bundle del navegador no debe contener la API interna"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
hits="$(grep -o 'localhost:3000' "$PROJECT_DIR"/apps/web/.next/static/chunks/*.js 2>/dev/null | wc -l)"
[ "$hits" -eq 0 ] && okk "0 referencias a localhost:3000" || badk "$hits referencias a localhost:3000 en el bundle"

printf '\n\033[1m%d OK, %d con fallo\033[0m\n' "$ok" "$fail"
[ "$fail" -eq 0 ] || printf 'Diagnostico:  journalctl -u jc-autoimport-api -n 60 | journalctl -u jc-autoimport-web -n 60 | journalctl -u jc-autoimport-tunnel -n 60\n'
exit 0
