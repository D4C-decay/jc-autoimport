# Convenciones del proyecto

## Memoria y continuidad
- Al **inicio de cada sesión** en este proyecto: leer `MEMORY.md` (se carga automáticamente por `opencode.json`) y dar continuidad al "Próximo paso" que contenga. Si existe, cargar también el resumen del vault `/tmp/opencode/vault-context-latest.md`.
- Al **cierre de cada sesión**, o tras decisiones importantes: actualizar `MEMORY.md` (estado, próximo paso, blockers, log) usando el subagente `memory-keeper`, y **añadir además** la entrada del día en `Diario/YYYY-MM-DD.md` de la bóveda `vault-personal` (ver "Contexto externo: Vault Obsidian"). Verificar siempre el diff de `MEMORY.md` antes de commitear (el `memory-keeper` ya lo corrompió una vez).
- Ante un objetivo nuevo de cierta envergadura, considerar el flujo del consejo de planeación: `plan-coordinator` (agente primary seleccionable) despacha a los expertos (`arquitecto-tecnico`, `experto-negocio`, `experto-usuario`, `experto-seguridad`, `experto-operaciones`), luego refuta con `abogado-del-diablo` y entrega el plan; se ejecuta tras aprobación.

## Flujo de tests (testing activo)
- Para probar la API corriendo (`localhost:3000`), usar el agente primary **`test-coordinator`**: despacha en paralelo 5 testers (`security-pentester`, `edge-case-tester`, `data-integrity-tester`, `contract-tester`, `resilience-tester`) y consolida un diagnóstico.
- El diagnóstico pasa al **`plan-coordinator`**, que **triangula** cada hallazgo contra el código (confirma/rechaza), lo **refuta con `abogado-del-diablo`**, prioriza y entrega al **`nest-module-builder`** para corregir.
- Ciclo de cierre: tras las correcciones, pasar por `build-verifier` + `backend-reviewer` y **re-ejecutar los testers** que hallaron los problemas para confirmar el fix.

## Modo de trabajo: Codex (obrero) + Opencode (supervisor) + Testers en paralelo
- **Principio:** Codex escribe; Opencode supervisa, detecta fallos y los corrige con subagentes. Nunca se pisan archivos.
- **Scope mínimo:** empezar con **UN** cambio acotado (máx. 2–4 archivos); acordar con Codex los archivos editables.
- **Sincronización:** **mutex por archivo** (si Opencode toma un archivo, Codex no lo toca); los testers son **solo lectura**.
- **Mientras Codex corre:** lanzar `test-coordinator` (5 testers en paralelo) y con el reporte vivo `/tmp/opencode/tests-live-*.md` pasar por `plan-coordinator` + `abogado-del-diablo` → `nest-module-builder` (fix mínimo) → `build-verifier` + `backend-reviewer`.
- **Verificación obligada:** tras cada fix → `npm run build` + `npm run lint`; re-test solo de los testers que reportaron ese hallazgo.
- **Regla de oro:** empezar con scope mínimo e iterar con reporte vivo; si hay ambigüedad → **parar y preguntar**. El detalle completo vive en `MEMORY.md`.

## Contexto externo: Vault Obsidian (vault-personal)
- **Repositorio:** `~/Documentos/Obsidian/Personal` (privado, `vault-personal`). El detalle completo (ventana, fuentes, formato de entrada) vive en `MEMORY.md`.
- **Inicio (solo lectura):** `git pull --ff-only` **condicionado** a que `git status --short` esté vacío; leer la ventana de los **últimos 2 días naturales** en orden cronológico ascendente. Reutilizar `/tmp/opencode/vault-context-latest.md` si es de hoy y < 6 h.
- **Durante la sesión:** **nunca** escribir en la bóveda.
- **Al cierre:** escribir **solo** en `Diario/YYYY-MM-DD.md` (append; máx. 6–8 líneas). **Nunca** `git add/commit/push` desde opencode: Obsidian-git sincroniza.
- **Fuente canónica:** `MEMORY.md`. El vault es apoyo para continuidad entre sesiones largas.

## Repositorio
- Hosted en **GitHub (privado)**: `https://github.com/D4C-decay/jc-autoimport`
- Rama principal: `main`
- Autenticación: `gh` (GitHub CLI) autenticada como `D4C-decay` en esta máquina.
- Bóvedas Obsidian (repos privados aparte): `jcautoimport-obsidian` y `vault-personal` (ver "Contexto externo").

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