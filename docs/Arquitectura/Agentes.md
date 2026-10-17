---
tags:
  - arquitectura
  - opencode
type: info
status: vivo
---

# Agentes y flujo de trabajo opencode

> Documenta cómo trabaja el repo con los agentes. Las reglas canónicas viven en `AGENTS.md` del repo de código.

## Memoria y continuidad

- Al inicio de sesión: leer `MEMORY.md` y dar continuidad al "Próximo paso".
- Al cierre: actualizar `MEMORY.md` usando el subagente **`memory-keeper`**.
- Objetivo nuevo de envergadura → flujo del consejo de planeación: `plan-coordinator` → expertos (`arquitecto-tecnico`, `experto-negocio`, `experto-usuario`, `experto-seguridad`, `experto-operaciones`) → refutación con `abogado-del-diablo` → plan → ejecución aprobada.

## Flujo de tests (testing activo)

- API corriendo en `localhost:3000` → agente primary **`test-coordinator`** despacha en paralelo 5 testers:
  `security-pentester`, `edge-case-tester`, `data-integrity-tester`, `contract-tester`, `resilience-tester`.
- Diagnóstico → `plan-coordinator` (triangula + `abogado-del-diablo`) → `nest-module-builder` → `build-verifier` + `backend-reviewer` → re-ejecutar testers que hallaron problemas.

## Directiva de push directo

- Push directo a `origin/main` **aprobado por el usuario** como respaldo.
- Tras tarea de código: `npm run build` + `npm run lint` en verde → `git add` (solo implicados) → commit descriptivo → push.

## Reglas de seguridad (nunca commitear)

- NO `.env`, `generated/`, `dist/`, `node_modules/`, secrets/claves.
- Antes de cada commit: confirmar `git status` y staging limpio de sensibles.