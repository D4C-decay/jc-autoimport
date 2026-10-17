---
description: Resumen del estado de JC Autoimport (memoria, git, servicios, ramas)
agent: build
model: opencode/big-pickle
---

Genera un resumen breve del estado del proyecto JC Autoimport. En orden:

1. Lee `MEMORY.md` y resume "Estado actual" y "Próximo paso" en 3–5 líneas.
2. `git status --short` y `git log --oneline -5`.
3. Comprueba servicios escuchando: `ss -tlnp | grep -E ':(3000|4200|5432|6379|11434|9222)'`.
4. Si hay contexto del vault en `/tmp/opencode/vault-context-latest.md`, resume 1–2 líneas.

$ARGUMENTS

Devuelve un informe compacto con encabezados. No modifiques nada.
