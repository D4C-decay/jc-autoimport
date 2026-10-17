---
description: Compila apps/web y reinicia el server standalone (evita el bug de CSS roto)
agent: build
model: opencode/glm-5.3-flash-free
---

Compila la web pública y deja el servidor sirviendo el build nuevo.

1. `npm --prefix apps/web run lint` (typecheck) — si falla, para y reporta.
2. `npm --prefix apps/web run build`.
3. **Reinicia el server standalone** (obligatorio tras el build):
   `systemctl --user restart jc-autoimport-web` (si no está gestionado, mata por puerto 4200 y relanza).
4. Verifica que los assets sirven 200: coge un hash de `/_next/static` del HTML de
   http://localhost:4200 y comprueba con `curl -o /dev/null -w '%{http_code}'`.

$ARGUMENTS

Reporta: estado de typecheck, build, reinicio y la comprobación de assets.
