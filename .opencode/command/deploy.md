---
description: Actualiza el despliegue (git pull + deps + build + restart)
agent: build
model: opencode/glm-5.3-flash-free
---

Actualiza el despliegue del proyecto en esta máquina. Si existe `npm run deploy:sync`, úsalo; si no, haz `git pull --ff-only`, instala deps, build y reinicia servicios.

Si el proyecto tiene `deploy/` con prisma, ejecuta `npm run deploy:sync` (pull, deps, generate, migrate, build, restart). **No reinicia el túnel a propósito.**

$ARGUMENTS

Si hay errores, diagnostica con `journalctl --user -u <unidad> -n 50` y `systemctl --user status <unidad>`. Al terminar, ejecuta `npm run deploy:verify`
y resume el resultado (OK/fallos). No hagas commit ni push.
