# Roadmap — JC Autoimport

> Fuente de orientación a medio plazo. El estado **concreto** (qué hay hecho y el próximo
> paso inmediato) vive en `MEMORY.md`; las convenciones y el flujo de trabajo viven en `AGENTS.md`.
> Última revisión: 2026-10-17.

## Estado

| Área | Estado | Notas |
|---|---|---|
| API / backend | ✅ Completo y en verde | 9 módulos, build + lint + 26 unit + 4 e2e |
| Web pública (`apps/web`) | ✅ En producción local | Next 15, 13 rutas, túnel de Cloudflare |
| App escritorio (`apps/desktop`) | ✅ Empaquetada | `.exe`, `.AppImage`, `.deb` (sin firmar) |
| Datos | ✅ | 75 vehículos, migraciones aplicadas |
| Seguridad | 🟡 Parcial | 2FA, PII cifrada y cookies hechas; faltan secretos reales |
| SEO / analítica | 🔴 Pendiente | sin JSON-LD, sin OG, sin analítica |
| Correo transaccional | 🔴 Sin credenciales | cae a log en dev |
| Pagos / media (S3-Cloudinary) | 🔴 Placeholder | integración escrita, claves sin poner |
| CI | 🟡 Base | `.github/workflows/ci.yml` (backend); falta web/desktop |
| Dominio | 🔴 Pendiente | quick tunnel cambia de hostname en cada reinicio |

---

## P0 — Bloqueantes para producción

- [ ] **Dominio + túnel nombrado de Cloudflare**: `cloudflared tunnel login` → túnel fijo tipo
  `web.tudominio.com`. Hoy `WEB_URL` (enlaces de correo) y `SITE_URL` dependen de un hostname
  que cambia en cada reinicio. *Criterio:* URL estable, HTTPS, `WEB_URL`/`SITE_URL` actualizados.
  *Pasos:* `deploy/README.md` → "La URL cambia en cada reinicio".
- [ ] **SMTP de Gmail**: `SMTP_HOST=smtp.gmail.com`, `SMTP_USER`, `SMTP_PASS` (contraseña de
  aplicación, cuenta con 2FA) en `.env` local y en el portátil. *Criterio:* un registro real
  recibe correo de verificación fuera de la sesión.
- [ ] **`DATA_ENCRYPTION_KEY` real** (64 hex) en todos los entornos + rotar `JWT_ACCESS_SECRET`
  y `JWT_REFRESH_SECRET`. Hoy en dev se deriva con warning.
- [ ] **Claves reales de Stripe / S3 / Cloudinary**: reservas y subida de media funcionando de verdad.
- [ ] **Backups**: `pg_dump` programado + copia de `apps/web/public/media` y `.env`.
- [ ] **`ufw`**: si se quiere acceso LAN, abrir 4200/3000 (hoy cerrados). El túnel es saliente
  y no requiere abrir nada en el router.
- [ ] `sudo loginctl enable-linger d4c` (las unidades systemd de usuario no arrancan sin login).
- [ ] `/etc/hosts`: quitar/corregir la entrada de `api.github.com` que rompe `gh`
  (requiere sudo; solo afecta a `gh`, nunca a `git push`).

## P1 — Experiencia y contenido

- [ ] **Revisión visual en navegador real** con `ui-reviewer`: modo claro (contraste de
  `white/*` sobre imágenes), cuerpo de la home, `/registro`, `/verificar`, `/cuenta` y responsive.
- [ ] **SEO**: JSON-LD (`Organization`, `Product/Vehicle`), meta `og:*`/`twitter:*`, favicon y
  `canonical` por ruta. Sitemap ya existe.
- [ ] **Analítica respetuosa**: Plausible o Umami (sin cookies, sin GDPR banner) o GA4 si se prefiere.
- [ ] **Errores**: `SENTRY_DSN` (existe en `.env.example`) + `sentry.client.config` en la web.
- [ ] **Rendimiento**: `perf-auditor` sobre home y catálogo (CWV, LCP, waterfall).

## P2 — Automatización y calidad

- [ ] Ampliar `ci.yml`: typecheck + build de `apps/web`, `npm run test` (unit) y, opcional,
  empaquetado de `apps/desktop`. Dejar el run verde con `gh`.
- [ ] e2e de la **web** con Playwright (registro → verificación → login → catálogo → lead).
- [ ] Rotina de `test-coordinator` (5 testers) antes de cada release.

## P3 — Escritorio vs PWA

- [ ] **Decidir** si se mantiene `apps/desktop` o basta una PWA instalable (menos complejidad
  de empaquetado y distribución).
- [ ] Si se mantiene: firmar el `.exe` (certificado de code signing, evita SmartScreen) y
  auto-update (electron-updater + releases en GitHub).

## P4 — Fuera de alcance por ahora

- Internacionalización (i18n), multi-tienda, app móvil nativa, marketplace de vendedores,
  recomendaciones/ML, y cualquier cambio de arquitectura de base de datos sin medir.

---

## Convención de este documento

Al tocar algo, mover el checkbox, **no** borrarlo, y mantener `MEMORY.md` actualizado
(`memory-keeper` al cierre de sesión). Un ítem se marca solo con evidencia (captura, log o test verde).
