# Memoria del proyecto JC Autoimport (Backend)

> Este archivo se carga automáticamente al inicio de cada sesión de opencode (via `opencode.json` → `instructions`). Es la fuente de continuidad entre sesiones.

## Objetivo
Plataforma de venta/importación de vehículos "JC Autoimport". Backend API completo orientado a: catálogo + búsqueda (<100ms), gestión de leads/CRM, reservas y pagos (Stripe), media, auditoría y RBAC. Meta de rendimiento: respuestas de catálogo <100ms vía caché Redis.

## Stack
NestJS 12 · TypeScript (ESM) · Prisma 7.10 · PostgreSQL 16 · Redis 7 · Stripe · Sharp · Argon2 · oxlint · pino.

## Repositorio
- GitHub **privado**: `https://github.com/D4C-decay/jc-autoimport` — rama `main`.
- `gh` autenticada como `D4C-decay` (HTTPS). Push directo aprobado (reglas en `AGENTS.md`, verifícalas antes de cualquier commit).
- NO versionar jamás: `.env`, `generated/`, `dist/`, `node_modules/`, `*.tsbuildinfo`.

## Estado actual
- Backend **completo, compilando y con runtime validado** (build + lint en verde), 9 módulos:
  - `auth` (JWT access/refresh, blacklist Redis, Argon2, RBAC)
  - `users` (CRUD, roles, /me)
  - `vehicles` (CRUD, filtros, cursor pagination cifrado, caché Redis, slug)
  - `search` (full-text `to_tsvector` en español, suggestions, facets)
  - `media` (upload S3/local, compresión Sharp, galería)
  - `leads` (CRM, asignación least-loaded a SELLER, notificaciones email/WhatsApp)
  - `payments` (reservas con lock Redis + vigencia 72h, Stripe checkout, webhook con firma)
  - `audit` (interceptor global + consulta ADMIN)
  - `health` (`GET /api/v1/health`: Prisma + Redis)
- Infra: `Dockerfile`, `docker-compose.yml` (postgres 16 + redis 7 + app), `.env.example` con placeholders.
- Seed: `prisma/seed.ts` (admin/manager/2 sellers + specifications + 3 vehículos demo).
- **Runtime validado (2026-09-08)**: migración `20260908163629_init` aplicada; seed ejecutado; API arriba en `localhost:3000` — health OK, register/login OK, `/users/me` con JWT OK, catálogo paginado (cursor) OK, RBAC (CLIENT→403 en `/audit`, ADMIN→200) OK, búsqueda full-text "rav4" OK. Swagger en `/api/docs`.

## Próximo paso
Runtime **validado** (ver Estado actual). Siguientes opciones en orden de valor:
1. `npm run test:e2e` (ya hay DB/Redis) y subir cobertura de los flujos críticos (reserva→pago→webhook).
2. Decidir y construir el **frontend** (consejo de planeación disponible) y el **panel de administración**.
3. Preparar despliegue (S3 real, Stripe live/keys reales, DOMINIO/HTTPS, GitHub Actions CI/CD).

## Blockers
- ~~PostgreSQL y Redis no instalados~~ → **Resueltos**: PostgreSQL 18.6 y Valkey 9.1.2 (Remedio: el paquete `redis` de Arch ahora provee Valkey, protocolo compatible) activos en la máquina.
- `jcauto` necesita `CREATEDB` para la shadow database de Prisma (concedido con `ALTER ROLE jcauto CREATEDB`). Si migras en otra máquina, hay que repetirlo.
- Stripe/S3/email/WhatsApp usan placeholders en `.env`: las integraciones funcionan en código pero requieren claves reales para producción.

## Decisiones clave
- **ESM**: imports relativos con sufijo `.js` (obligatorio).
- **Prisma 7**: el datasource NO lleva `url`; la URL vive en `prisma.config.ts`; cliente generado en `generated/prisma`.
- **Stripe**: `apiVersion: '2026-08-26.dahlia'` (verificada del SDK instalado).
- **Build**: `tsconfig.build.json` `rootDir: "."` → salida `dist/src/`; `start:prod: node dist/src/main.js`.
- **ioredis v6**: `import { Redis } from 'ioredis'` (named import).
- **Guards globales** en orden: `RateLimitGuard` → `JwtAuthGuard` → `RolesGuard`; `JwtModule` es `global: true` (requisito para el guard global).
- **Interceptores globales**: Logging + Transform (envuelve respuestas `{success,data,timestamp}`; DELETE/PATCH/PUT sin retorno → 404). Caché Redis por controller (no global).
- **Stripe webhook**: `rawBody: true` en `NestFactory.create` para verificar firma.
- **Flujo de reservas**: vehículo `AVAILABLE→RESERVED` al reservar; `→SOLD` en `checkout.session.completed`; `→AVAILABLE` al cancelar.
- **Auditoría**: `AuditInterceptor` global con DI de PrismaService (fire-and-forget), redacta secrets.
- **Seed argon2**: memoryCost 19456 / timeCost 2 / parallelism 1.
- **Seed config (Prisma 7)**: vive en `prisma.config.ts` → `migrations.seed` (formato string), no en `package.json`/`seed.import`.
- **Cursors de paginación**: cifrados con `JWT_ACCESS_SECRET` (cursor-encoder).
- **Infra local**: PostgreSQL 18.6 + Valkey 9.1.2 vía systemd (no Docker). `jcauto` con `CREATEDB`.

## Reglas de continuidad
- **Al inicio de sesión**: leer este `MEMORY.md` y dar continuidad al `Próximo paso`.
- **Al cierre**: actualizar este archivo (usar el subagente `memory-keeper`) con estado, próximo paso, blockers y una entrada en el log.
- Revisar los subagentes en `.opencode/agent/` (builders = implementan; consejo de planeación = diseñan; `memory-keeper` = archiva).

## Log de sesiones
- 2026-09-08 16:40 — **Runtime validado**: instalados PostgreSQL 18.6 + Valkey 9.1.2 (systemd). Migración inicial aplicada (`20260908163629_init`), seed ejecutado (admin+sellers+3 autos). Smoke test completo OK (health, auth, JWT, catálogo por cursor, RBAC, full-text). Swagger en `/api/docs`. Fix: config de seed movida a `migrations.seed` en `prisma.config.ts` (Prisma 7).
- 2026-09-08 — Creación del repo GitHub privado `dc4decay/jc-autoimport`, push inicial del backend completo (102 archivos). Setup de continuidad: 14 subagentes (6 builders + 7 del consejo de planeación + memory-keeper), `opencode.json` con `instructions` (AGENTS.md + MEMORY.md) y reglas de continuidad.