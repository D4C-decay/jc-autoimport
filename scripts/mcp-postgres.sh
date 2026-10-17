#!/usr/bin/env bash
# Servidor MCP de PostgreSQL para opencode (solo lectura).
# El servidor oficial ejecuta las consultas dentro de una transacción READ ONLY,
# así que no puede escribir aunque las credenciales puedan.
#
# Usa JCA_RO_DATABASE_URL si existe (rol dedicado jcauto_ro, pendiente de crear);
# si no, cae a DATABASE_URL del .env.
#
# Pendiente (requiere superusuario): crear el rol de solo lectura con
#   CREATE ROLE jcauto_ro LOGIN PASSWORD '...';
#   GRANT CONNECT ON DATABASE jcautoimport TO jcauto_ro;
#   GRANT USAGE ON SCHEMA public TO jcauto_ro;
#   GRANT SELECT ON ALL TABLES IN SCHEMA public TO jcauto_ro;
#   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO jcauto_ro;
# y añadir JCA_RO_DATABASE_URL=... al .env
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

URL="${JCA_RO_DATABASE_URL:-${DATABASE_URL:-}}"
if [ -z "$URL" ]; then
  echo "mcp-postgres: falta JCA_RO_DATABASE_URL y DATABASE_URL (.env)" >&2
  exit 1
fi

# Quita parámetros solo de Prisma (?schema=public) que el driver pg no entiende.
if command -v node >/dev/null 2>&1; then
  URL="$(node -e "try{const u=new URL(process.argv[1]);u.search='';process.stdout.write(u.toString())}catch{process.stdout.write(process.argv[1])}" "$URL")"
fi

exec npx -y @modelcontextprotocol/server-postgres "$URL"
