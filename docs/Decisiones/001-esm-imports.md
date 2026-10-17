---
tags:
  - decisión
  - adr
  - esm
type: adr
status: aprobado
fecha: 2026-09-08
---

# Decisión 001 — ESM obligatorio (imports relativos con sufijo `.js`)

**Estado:** ✅ Aprobada
**Fecha:** 2026-09-08

## Contexto

El proyecto es TypeScript en modo **ESM** (`"type": "module"`). En ESM, los imports relativos requieren la extensión de archivo final, incluso en TypeScript compilado a Node.

## Opciones

1. **Sufijo `.js` en imports relativos de TS** — `from './app.module.js'`. Correcto tras compilación: Node resuelve el `.js` real y funciona en producción.
2. Sin extensión (convenio CJS) — provoca errores `ERR_MODULE_NOT_FOUND` al correr JS compilado.

## Decisión

Usar **sufijo `.js`** en todos los imports relativos (regla obligatoria, imposible de saltar).

## Consecuencias

- La compilación y el runtime funcionan con TS ESM (proyecto compilando y en verde).
- Herramientas antiguas o autocorrectores que omiten la extensión rompen el lint.
- Se valida que el código compilado (Node) resuelva los imports sin configurar resolvers.

## Referencia

- Convención de código en `AGENTS.md` → "Convenciones del código".
- `package.json`: `"type": "module"`.