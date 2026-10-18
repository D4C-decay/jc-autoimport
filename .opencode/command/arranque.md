---
description: Verifica el primer arranque del kit (plugins, MCP, herramientas, gates)
agent: build
model: opencode/glm-5.3-flash-free
---

Comprueba que el kit está en orden **después de reiniciar opencode**. Sigue la checklist de la sección **"Verificación de primer arranque"** de `MEMORY.md` (raíz del kit), en su orden (1 → 9).

Reglas:

1. Lee primero `MEMORY.md`; si no existe, dilo y para.
2. Ejecuta **todos** los comandos de la checklist y guarda la evidencia (salida exacta o exit code). No supongas: si un comando no se puede ejecutar en este entorno (p. ej. falta CDP), dilo y márcalo como "no comprobable", no como verde.
3. Los puntos 1, 2, 3, 4, 5, 7 y 8 son **gates**; el 6 es informativo y el 9 es opcional (borra `/tmp/kit-fresh/arranque` después).
4. Para el punto 3 (`ponytail`) y el 4 (`graphify.js`), revisa los logs de opencode en `~/.local/share/opencode/log/*.log` buscando esas palabras y **cualquier error de plugin/MCP**; reporta la línea si aparece.
5. Si algo falla, aplica el "si falla" de la checklist y propón el fix mínimo; si el fix toca `opencode.kit.json`, `AGENTS.md`, agentes, skills, comandos o plugins, recuerda que la config **no** es hot-reload.

$ARGUMENTS

Devuelve una tabla compacta `punto | comando | resultado (OK/FAIL/n-a) | evidencia`, luego **una** línea de veredicto y, si hay fallos, la lista priorizada de fixes. No modifiques archivos sin pedirlo.
