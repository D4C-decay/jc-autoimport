# Convenciones del proyecto

## Memoria y continuidad
- Al **inicio de cada sesión** en este proyecto: leer `MEMORY.md` (se carga automáticamente por `opencode.json`) y dar continuidad al "Próximo paso" que contenga.
- Al **cierre de cada sesión**, o tras decisiones importantes: actualizar `MEMORY.md` (estado, próximo paso, blockers, log). Para esto usar el subagente `memory-keeper`.
- Ante un objetivo nuevo de cierta envergadura, considerar el flujo del consejo de planeación: `plan-coordinator` (agente primary seleccionable) despacha a los expertos (`arquitecto-tecnico`, `experto-negocio`, `experto-usuario`, `experto-seguridad`, `experto-operaciones`), luego refuta con `abogado-del-diablo` y entrega el plan; se ejecuta tras aprobación.

## Flujo de tests (testing activo)
- Para probar la API corriendo (`localhost:3000`), usar el agente primary **`test-coordinator`**: despacha en paralelo 5 testers (`security-pentester`, `edge-case-tester`, `data-integrity-tester`, `contract-tester`, `resilience-tester`) y consolida un diagnóstico.
- El diagnóstico pasa al **`plan-coordinator`**, que **triangula** cada hallazgo contra el código (confirma/rechaza), lo **refuta con `abogado-del-diablo`**, prioriza y entrega al **`nest-module-builder`** para corregir.
- Ciclo de cierre: tras las correcciones, pasar por `build-verifier` + `backend-reviewer` y **re-ejecutar los testers** que hallaron los problemas para confirmar el fix.

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