# JC Autoimport — Documentación del proyecto

Documentación de **JC Autoimport** (backend NestJS/Prisma/PostgreSQL/Redis/Stripe, web Next.js, desktop Electron). Versionada en este mismo repo (migrada desde la antigua bóveda Obsidian `jcautoimport-obsidian`; ver `MEMORY.md`).

`MEMORY.md` (raíz) sigue siendo la **fuente canónica** de estado y continuidad. Estas notas son el detalle de arquitectura, decisiones y operación, y alimentan el grafo de conocimiento (`graphify-out/`).

## 🔒 Regla de oro — contenido

> **Se documentan decisiones y diagramas, NUNCA valores ejecutables.**

- ❌ **NUNCA**: Stripe keys (`sk_live_***`), JWT secrets, `DATABASE_URL` con credenciales, tokens/PAT, passwords, API keys de S3/email/WhatsApp, URIs internas con credenciales, PII real de leads/clientes.
- ✅ **SÍ**: nombres de variables y placeholders (`$STRIPE_SECRET_KEY`), esquemas de base de datos, formato de webhooks (sin secrets), claims de JWT, decisiones de arquitectura, runbooks.
- **Prueba mental antes de commitear**: *¿un adversario que lea este repo puede ejecutar algo malo?* Si sí → queda fuera.
- `gitleaks` en CI detecta secretos colados; mantén los patrones **redactados** (`***`).

## 📁 Estructura

| Carpeta | Qué va aquí |
|---|---|
| `Inbox/` | Notas rápidas sin procesar |
| `Diario/` | Notas diarias (`YYYY-MM-DD.md`) |
| `Decisiones/` | ADR numerados (`001-…`) |
| `Estado/` | Notas vivas: Backend, Backlog, Blockers |
| `Arquitectura/` | Stack, agentes, diagramas |
| `Operaciones/` | Despliegue, runbooks |
| `Logs/` | Bitácora de sesiones |
| `Templates/` | Plantillas (Diario, Decisión) |
| `ROADMAP.md` | Hoja de ruta del proyecto |

## Migración

Los documentos se importaron **tal cual** desde `~/Documentos/Obsidian/JC-Autoimport` (sin los `Assets/` binarios ni los metadatos de la bóveda `.obsidian/`). La bóveda original queda intacta como respaldo; ya no es la fuente de trabajo.
