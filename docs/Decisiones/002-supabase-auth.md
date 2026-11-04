---
tags:
  - decisión
type: adr
status: aprobada
fecha: 2026-11-02
---

# Decisión 002 — Supabase Auth como proveedor de identidad

**Estado:** ✅ Aprobada
**Fecha:** 2026-11-02

## Contexto
El login propio (Argon2 + JWT access/refresh + tabla `refresh_tokens`) obligaba a
mantener verificación de correo, recuperación de contraseña, rotación de tokens y
MFA. Es superficie de seguridad crítica y trabajo repetido. A la vez, la base de
datos necesitaba un Postgres gestionado con backups.

## Opciones
1. Seguir con auth propio + Postgres local/túnel.
2. Supabase Auth (identidad) + Postgres de Supabase (datos), manteniendo Prisma.
3. Proveedor externo solo de auth (Auth0/Clerk) + Postgres aparte.

## Decisión
Supabase Auth es el **único** proveedor de identidad; Prisma sigue siendo el ORM
de los datos de negocio.

- `users.id` sigue siendo el cuid local; se añade `auth_id uuid UNIQUE` que
  apunta a `auth.users.id`. Las FKs existentes no se tocan.
- El guard de NestJS verifica el JWT de Supabase (JWKS o HS256 legacy), resuelve
  la fila local por `auth_id` (o por email la primera vez) y expone **el id
  local** como `sub`, así ningún controlador cambia.
- El rol se lee de la base local en cada petición; no se confía en claims.
- La web usa `@supabase/ssr`; el navegador solo habla con Supabase Auth y con el
  proxy `/backend`, que reenvía `Authorization: Bearer`.
- RLS deny-all para `anon`/`authenticated`: solo el backend (rol `postgres`)
  accede a las tablas.
- Los hashes Argon2 existentes se importan con la Admin API
  (`prisma/import-to-supabase.ts`).

## Consecuencias
- Positivas: confirmación de correo, recuperación, MFA TOTP y rotación de tokens
  sin código propio; menos endpoints públicos; backups gestionados.
- Negativas/riesgos: dependencia de Supabase; cookies de sesión no `httpOnly`
  (las lee el SDK), mitigado con CSP estricta; el pooler exige `DIRECT_URL` para
  migraciones y `pgbouncer=true` en runtime.

## Referencia
- `prisma/migrations/20261102130000_supabase_auth/migration.sql`
- `src/common/guards/jwt-auth.guard.ts`
- `apps/web/src/lib/supabase/*`, `apps/web/src/middleware.ts`
- `README.md` → puesta en marcha
