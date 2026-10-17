---
tags:
  - estado
type: estado
status: vivo
owner: equipo-A
---

# Blockers

> Editar in-place. Tachar con `~~...~~` cuando se resuelva, no borrar historial.

- ~~PostgreSQL y Redis no instalados~~ → **Resueltos**: PostgreSQL 18.6 y Valkey 9.1.2 activos vía systemd (el paquete `redis` de Arch ahora provee Valkey, protocolo compatible).
- `jcauto` necesita `CREATEDB` para la shadow database de Prisma (concedido con `ALTER ROLE jcauto CREATEDB`). ⚠️ Si migras en otra máquina, hay que repetirlo.
- Stripe/S3/email/WhatsApp usan placeholders en `.env`: las integraciones funcionan en código pero requieren claves reales para producción.
- Plataforma GitHub Free: sin secret scanning/push protection en repos privados → gate de seguridad real = **gitleaks en CI** (1×/día) + disciplina de contenido.

## Checkboxes de seguimiento

- [ ] Actualizar bloqueo de CREATEDB en otra máquina
- [ ] Obtener claves Stripe/S3/email reales antes del despliegue
- [ ] Verificar gitleaks en CI tras el primer push del vault