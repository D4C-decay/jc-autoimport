---
description: Compila . y reinicia el server standalone (evita el bug de CSS roto)
agent: build
model: opencode/glm-5.3-flash-free
---

Compila la web pública y deja el servidor sirviendo el build nuevo.

1. `npm --prefix . run lint` (typecheck) — si falla, para y reporta.
2. `npm --prefix . run build`.
3. **Reinicia el server standalone** (obligatorio tras el build):
   Reinicia el server (p. ej. `systemctl --user restart <unidad-web>`; si no está gestionado por systemd, mata por su puerto y relánzalo con `setsid nohup`).
4. Verifica que los assets sirven 200: coge un hash de `/_next/static` del HTML de
   la URL local del server y comprueba con `curl -o /dev/null -w '%{http_code}'`.

$ARGUMENTS

Reporta: estado de typecheck, build, reinicio y la comprobación de assets.
