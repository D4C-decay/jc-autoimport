---
tags:
  - operaciones
  - despliegue
type: runbook
status: borrador
---

# Despliegue

> Runbook de despliegue del backend JC Autoimport. Estado: borrador — la primera versión a producción está pendiente (ver [[Estado/Backlog]]).

## Requisitos previos

- Claves reales: Stripe (live), S3 y credenciales de email/WhatsApp (**placeholder en `.env` en desarrollo**).
- Dominio + HTTPS.
- PostgreSQL y Redis de producción.

## Infra disponible

- `Dockerfile` y `docker-compose.yml` en el repo de código (`jc-autoimport`).
- Local: PostgreSQL 18.6 + Valkey 9.1.2 vía systemd.

## Pasos generales

1. Preparar el backend: `npm run build` + `npm run lint` en verde.
2. Configurar `.env` con valores reales de producción (nunca commitear).
3. `prisma migrate deploy` + seed.
4. Levantar app detrás de HTTPS/dominio.
5. Verificar `GET /api/v1/health` (Prisma + Redis).
6. Configurar GitHub Actions CI/CD (pendiente, ver Backlog).

## Checklist de producción

- [ ] Claves Stripe live
- [ ] S3 real
- [ ] Dominio y certificado HTTPS
- [ ] CI/CD en GitHub Actions
- [ ] Migraciones aplicadas en prod