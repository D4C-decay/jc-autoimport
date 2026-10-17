---
tags:
  - estado
  - backend
type: estado
status: aprobado
owner: equipo-A
---

# Estado del backend — JC Autoimport

> **Fuente de verdad**: `MEMORY.md` en el repo `jc-autoimport` (privado), que opencode carga al inicio de cada sesión. Esta nota es un snapshot orientado a humanos; si hay conflicto, manda `MEMORY.md`.

## Objetivo

Plataforma de venta/importación de vehículos "JC Autoimport". Backend API completo orientado a: catálogo + búsqueda (<100ms), gestión de leads/CRM, reservas y pagos (Stripe), media, auditoría y RBAC. Meta de rendimiento: respuestas de catálogo <100ms vía caché Redis.

## Stack

NestJS 12 · TypeScript (ESM) · Prisma 7.10 · PostgreSQL 16 · Redis 7 · Stripe · Sharp · Argon2 · oxlint · pino.

## Estado: COMPLETO + RUNTIME VALIDADO (2026-09-08)

- Backend compilando y con lint en verde, **9 módulos**:

| Módulo | Funcionalidad |
|---|---|
| `auth` | JWT access/refresh, blacklist Redis, Argon2, RBAC |
| `users` | CRUD, roles, `/me` |
| `vehicles` | CRUD, filtros, cursor pagination cifrado, caché Redis, slug |
| `search` | full-text `to_tsvector` en español, suggestions, facets |
| `media` | upload S3/local, compresión Sharp, galería |
| `leads` | CRM, asignación least-loaded a SELLER, notificaciones email/WhatsApp |
| `payments` | reservas con lock Redis + vigencia 72h, Stripe checkout, webhook con firma |
| `audit` | interceptor global + consulta ADMIN |
| `health` | `GET /api/v1/health`: Prisma + Redis |

- Runtime validado: migración `20260908163629_init` aplicada, seed ejecutado, API en `localhost:3000`. Health, auth, RBAC (CLIENT→403 en `/audit`, ADMIN→200), catálogo por cursor y full-text "rav4" OK. Swagger en `/api/docs`.
- Optimización de rendimiento (migración `20260908164736`): `search_vector tsvector` + índice **GIN**, índices de keyset `(price,id)`, `(year,id)`, `(mileage,id)`, media desnormalizada (`primary_image_url`/`thumbnail_url`), gzip en `main.ts`.

## Próximo paso

1. Ampliar dataset de demo (>10k vehículos) + benchmark para validar latencia a escala y ajustar TTLs de caché.
2. Preparar despliegue (S3 real, Stripe live, DOMINIO/HTTPS, GitHub Actions CI/CD).
3. Decidir y construir frontend + panel de administración.

Ver [[Estado/Backlog]] y [[Estado/Blockers]].