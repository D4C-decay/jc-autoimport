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

## Política de git (push directo aprobado)
- El usuario **aprueba commits y `git push` directos** a `origin/main` como respaldo de seguridad, pero **`git commit` y `git push` SIEMPRE preguntan** (nunca automáticos).
- Tras completar una tarea de código: verificar con `npm run build` y `npm run lint`, revisar `git status`, `git add` **solo** de los archivos implicados, `git commit` descriptivo y `git push`.

## Autonomía y permisos (opencode.json)
- Modo **autónomo con guardarraíles**: `edit` y `bash` en `allow` por defecto; `git commit/push`, `git reset --hard`, `git clean` en **ask**; `sudo`, `rm -rf /` y `rm -rf ~` en **deny**.
- `external_directory` permite `/tmp/opencode`, `~/.local/state/jcautoimport`, `~/.cache/ms-playwright` y `~/Documentos/Obsidian/**`; el resto **pregunta**.
- **La config NO es hot-reload**: tras tocar `opencode.json`, agentes, skills, comandos o plugins → **reiniciar opencode**.
- Escape hatch si algo rompe el arranque: `OPENCODE_DISABLE_PROJECT_CONFIG=1` (ignora el config del proyecto) o `OPENCODE_PURE=1` (sin plugins externos).

## Modelos por agente (tier free de opencode)
- En esta máquina **solo** hay disponibles los modelos **free de opencode** + los 2 de `ollama` (no hay credenciales de pago). Lista: `opencode models`.
- Builders y verificación → `opencode/glm-5.3-flash-free`; revisores/seguridad → `opencode/deepseek-v4.1-flash-free`; consejo (`arquitecto-tecnico`, `abogado-del-diablo`, `experto-*`) y coordinadores → `opencode/big-pickle`; `memory-keeper` → `opencode/longcat-2.5-preview-free`; `small_model` (títulos) → `opencode/nemotron-3.5-lightning-free`.
- **Privacidad**: PII/secretos SOLO a modelos **zero-retention** (`glm-5.3-flash-free`, `deepseek-v4.1-flash-free`, `space-bunny-free`, `longcat-2.5-preview-free`). Nunca a Nemotron (trial NVIDIA: "no datos confidenciales") ni a `big-pickle`/`MiMo` (entrenan durante el periodo free).
- **Fallback**: si un modelo free falla o va rate-limited, cambia la línea `model:` del agente a `ollama/qwen2.5-coder:14b` (offline, privado, lento).

## Capacidades web (navegador por CDP)
- El navegador del usuario es **Brave** (Chromium ≥136): `bash scripts/chrome-debug.sh` lo lanza con perfil dedicado y CDP en `http://localhost:9222`. (Nunca el perfil por defecto: Brave ignora el flag y no expone CDP.)
- MCP: `playwright` (navegar/capturar), `chrome-devtools` (perf/consola/network), `context7` (docs), `postgres` (**solo lectura**, `scripts/mcp-postgres.sh`).
- Skills: `jca-browser`, `jca-design-system`, `jca-known-traps`.

## Flujo frontend (web, `apps/web`)
- Builder: **`web-builder`** (máx. 2–4 archivos) usando el skill `jca-design-system` y el contrato **`apps/web/DESIGN.md`**.
- Revisión: **`ui-reviewer`** (capturas reales por CDP, 1440/390 y modo claro/oscuro). Rendimiento: **`perf-auditor`**.
- Verificación: `npm --prefix apps/web run lint` (typecheck) + `npm --prefix apps/web run build` + **reiniciar el server standalone** (si no, sirve sin CSS). No aprobar sin ambos en verde.

## Plugins y comandos de opencode
- Plugins en `.opencode/plugin/`: `auto-verify` (al final del turno, condicional + timeout), `web-restart-guard`, `session-boot`, `notify`, `secret-guard`, `trap-guard`, `session-log`. Logs en `~/.local/state/jcautoimport/`. Desactivables por env (`JCA_AUTO_VERIFY=0`, `JCA_NOTIFY=0`, …).
- Comandos: `/estado`, `/ui-review`, `/web-build`, `/deploy`.

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
- Backend completo, compilando y con runtime validado (build + lint en verde). Infra local: PostgreSQL 18.6 + Valkey 9.1.2 (systemd). Web `apps/web` (Next.js 15) y desktop `apps/desktop` (Electron) construidos. Hay un **túnel de Cloudflare** (quick tunnel) sirviendo la web; la API (3000) queda privada. El estado detallado y el "Próximo paso" viven en `MEMORY.md`.