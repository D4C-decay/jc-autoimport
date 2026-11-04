# JC Autoimport

Plataforma de venta e importacion de vehiculos: API (catalogo, busqueda,
leads/CRM, reservas y pagos, multimedia, auditoria, RBAC), sitio publico y
app de escritorio.

## Estructura

Es **un repo con tres paquetes independientes**, no hay workspaces npm:
un `npm install` en la raiz **no** instala los hijos.

| Ruta | Que es | Paquete |
|---|---|---|
| `src/`, `prisma/` | API | `jc-autoimport-backend` (raiz) |
| `apps/web` | sitio publico Next.js 15 | `@jcautoimport/web` |
| `apps/desktop` | app Electron 44 | `@jcautoimport/desktop` |
| `deploy/` | instalador, servicios systemd y guia de despliegue | -- |

## Puesta en marcha rapida (desarrollo)

La identidad la gestiona **Supabase Auth** (email/contrasena, confirmacion,
recuperacion y MFA TOTP). La API solo guarda el perfil y los datos de negocio;
verifica el JWT de Supabase y enlaza `users.auth_id` con `auth.users.id`.

```bash
# 1. Crea un proyecto en Supabase y copia las cadenas de conexion:
#    - DATABASE_URL: transaction pooler (puerto 6543, ?pgbouncer=true)
#    - DIRECT_URL:   session pooler o conexion directa (puerto 5432)
#    - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (solo backend)
cp .env.example .env

# 2. API
npm install
npx prisma generate
npx prisma migrate deploy      # nunca `migrate dev` contra Supabase
npx prisma db seed             # crea usuarios locales + identidades Supabase
npx tsx prisma/import-to-supabase.ts   # solo si migras usuarios existentes
npm run build && npm run start:prod    # http://localhost:3000

# 3. Sitio (otra terminal)
cd apps/web
cp .env.example .env.local     # NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
npm install && npm run dev     # http://localhost:4200
```

En el panel de Supabase configura SMTP (Gmail con contrasena de aplicacion) y
apunta las plantillas de correo a
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/cuenta`
(o deja el flujo por defecto: `/auth/confirm` tambien canjea `?code=`).

Credenciales del seed: `admin@jcautoimport.com` / `Admin123!` (cambiar en
produccion).

## Despliegue en una maquina limpia

```bash
git clone https://github.com/D4C-decay/jc-autoimport.git
cd jc-autoimport
bash deploy/setup-debian.sh     # Postgres + Redis + API + web + tunel publico
bash deploy/verify.sh          # comprueba que todo esta en pie
```

La guia completa, el troubleshooting y como pasar a un dominio fijo estan en
**[`deploy/README.md`](deploy/README.md)**.

Resumen: el sitio se publica por un tunel de Cloudflare y **la API no sale a
internet**; no hay que abrir puertos en el router.

## Scripts utiles

```bash
npm run start:dev          # API en watch
npm run test               # 26 unit (vitest)
npm run test:e2e           # 4 e2e contra Postgres y Redis reales
npm run lint               # oxlint
npm run prisma:studio      # explorar la base de datos
npm run web:typecheck      # tsc de apps/web
npm run web:build          # build standalone de apps/web
npm run package:linux      # AppImage + .deb con el sitio dentro
npm run package:win        # instalador .exe
npm run deploy:verify      # estado de todos los servicios
```

## Documentacion de la API

Swagger en `http://localhost:3000/api/docs` (solo en la red local; el proxy
publico lo bloquea a proposito).

## Notas

- ESM: los imports relativos de TypeScript llevan sufijo `.js`.
- Prisma 7: la URL del datasource vive en `prisma.config.ts` y usa
  `DIRECT_URL` (migraciones) con `DATABASE_URL` como respaldo. El cliente se
  genera en `generated/prisma`.
- La autenticacion es **Supabase Auth**; `JWT_ACCESS_SECRET` solo se usa para
  firmar cursores y como respaldo de cifrado local, no para sesiones.
- Nunca se versionan `.env`, `generated/`, `dist/`, `node_modules/` ni
  `apps/*/release/`.
- Stripe, S3, email y WhatsApp funcionan en codigo pero necesitan claves
  reales para produccion.
