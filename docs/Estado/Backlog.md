---
tags:
  - estado
type: estado
status: vivo
owner: equipo-A
---

# Backlog

> Qué falta y en qué orden. Se marca `[x]` al completar y se mueve la explicación a [[Estado/Backend]] / el log correspondiente.

## P0 — Benchmark a escala

- [ ] Ampliar dataset de demo a >10.000 vehículos
- [ ] Benchmark de latencia catálogo/búsqueda con el dataset grande
- [ ] Ajustar TTLs de caché Redis según resultados

## P1 — Preparar despliegue

- [ ] S3 real (o Bucket local de producción)
- [ ] Claves Stripe live + webhook real
- [ ] Dominio + HTTPS
- [ ] GitHub Actions CI/CD del backend

## P2 — Frontend

- [ ] Decidir stack de frontend
- [ ] Tienda/catálogo público
- [ ] Panel de administración

## Notas sueltas (Inbox pendiente)

- Considerar `helmet` en `main.ts` (deuda técnica documentada en MEMORY.md)