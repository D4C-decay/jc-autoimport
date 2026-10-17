---
description: Actualiza el despliegue (git pull + deps + prisma + build + restart)
agent: build
model: opencode/glm-5.3-flash-free
---

Actualiza el despliegue de JC Autoimport en esta máquina.

Ejecuta `npm run deploy:update` (hace `git pull --ff-only`, instala deps, `prisma generate`,
`prisma migrate deploy`, build y reinicia api y web). **No reinicia el túnel a propósito.**

$ARGUMENTS

Si hay errores, diagnostica con `journalctl --user -u jc-autoimport-api -n 50` y
`systemctl --user status jc-autoimport-web`. Al terminar, ejecuta `npm run deploy:verify`
y resume el resultado (OK/fallos). No hagas commit ni push.
