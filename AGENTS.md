# Convenciones del proyecto

## Repositorio
- Hosted en **GitHub (privado)**: `https://github.com/D4C-decay/jc-autoimport`
- Rama principal: `main`
- Autenticación: `gh` (GitHub CLI) autenticada como `D4C-decay` en esta máquina.

## Directiva de push directo
- El usuario **aprueba commits y `git push` directos** a `origin/main` como respaldo de seguridad.
- Tras completar una tarea de código: verificar con `npm run build` y `npm run lint`, luego `git add` (de los archivos implicados), `git commit` descriptivo y `git push`.

## Reglas de seguridad (nunca commitear)
- NO subir `.env` (queda excluido por `.gitignore`; solo se versiona `.env.example`).
- NO subir `generated/`, `dist/`, `node_modules/`, ni secrets/claves en código.
- Antes de cada commit, confirmar `git status` y que nada sensible se añade al staging.

## Convenciones del código
- Proyecto **ESM**: los imports relativos de TypeScript llevan sufijo `.js` (p. ej. `from './app.module.js'`).
- Estructura por módulos en `src/modules/*` (domain/application/infrastructure).
- Prisma 7: el cliente se genera en `generated/prisma`. Después de cambiar `prisma/schema.prisma` ejecutar `npx prisma generate`.
- Verificación estándar: `npm run build` (nest build) y `npm run lint` (oxlint). No aprobar cambio hasta que ambos pasen.

## Estado conocido
- Backend completo, compilando y lint limpio. Pendiente: levantar PostgreSQL 16 + Redis 7 y ejecutar `prisma migrate dev` + seed antes de probar en runtime.