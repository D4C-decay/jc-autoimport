---
description: Resumen del estado de JC Autoimport (memoria, git, servicios, ramas)
agent: build
model: opencode/big-pickle
---

Genera un resumen breve del estado del proyecto JC Autoimport. En orden:

1. Lee `MEMORY.md` y resume "Estado actual" y "Próximo paso" en 3–5 líneas.
2. `git status --short` y `git log --oneline -5`.
3. Comprueba servicios escuchando: `ss -tlnp | grep -E ':(3000|4200|5432|6379|11434|9222)'`.
4. Si existe `graphify-out/graph.json`, indica su fecha de actualización (1 línea).
5. Métricas de sesión (1–2 líneas): del log `~/.local/state/$(basename "$PWD")/session.log` — nº de eventos, tipo del último y duración (primera→última marca de tiempo de hoy). Si no existe, dilo y sigue.

$ARGUMENTS

Devuelve un informe compacto con encabezados. No modifiques nada.
