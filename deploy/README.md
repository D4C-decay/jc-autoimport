# Despliegue en un portatil Debian

Como dejar JC Autoimport funcionando en una maquina limpia, con la web
publicada en internet y **la API sin salir a la red**.

## Que queda expuesto

| Puerto | Donde | Estado |
|---|---|---|
| 4200 (web) | `cloudflared` -> internet publico | **si**, con HTTPS automatico |
| 3000 (API) | `127.0.0.1` | **no**, nunca sale |
| 5432 / 6379 | local | **no** |

El tunel es **saliente**: la maquina abre la conexion hacia Cloudflare, asi que
**no hay que abrir nada en el router** y el cortafuegos puede quedarse cerrado.
`sudo ufw status` no deberia mostrar puertos abiertos para este proyecto.

## Requisitos

Debian 12/13, un usuario con `sudo`, y conexion a internet. Node se instala
solo si hace falta.

## Puesta en marcha (5-10 minutos)

```bash
git clone https://github.com/D4C-decay/jc-autoimport.git
cd jc-autoimport
bash deploy/setup-debian.sh
```

El instalador, en orden:

1. Node 22 LTS si falta.
2. PostgreSQL + Redis, rol `jcauto` con `CREATEDB` (lo necesita la base de
   datos sombra de Prisma) y base `jcautoimport`.
3. `cloudflared` en `~/.local/bin` (sin root).
4. `.env` a partir de `.env.example` con **secretos JWT aleatorios** y
   `API_HOST=127.0.0.1`. Si ya existe `.env`, no lo toca.
5. Dependencias de la raiz y de `apps/web` (son paquetes independientes: no hay
   workspaces, un `npm install` en la raiz **no** instala los hijos).
6. `prisma generate`, `prisma migrate deploy` y el seed (75 vehiculos, 12
   destacados, usuarios).
7. Build de la API y de la web.
8. Tres unidades de **systemd a nivel de sistema** en `/etc/systemd/system`:
   `jc-autoimport-api`, `jc-autoimport-web`, `jc-autoimport-tunnel`. Se
   habilitan con `enable --now`, asi que arrancan solas al encender el portatil.

Al terminar imprime la URL publica, la API local y las credenciales.

### Credenciales iniciales del seed

```
admin@jcautoimport.com    / Admin123!     ADMIN
manager@jcautoimport.com  / Admin123!     MANAGER
seller1@jcautoimport.com  / Admin123!     SELLER
seller2@jcautoimport.com  / Admin123!     SELLER
```

Cambia la clave del admin en cuanto entres.

## Comandos utiles

```bash
bash deploy/verify.sh                 # comprueba TODO y dice que falla
bash deploy/update.sh                 # git pull + migraciones + build + reinicio

systemctl status jc-autoimport-{api,web,tunnel}
journalctl -u jc-autoimport-web -f           # log de la web
journalctl -u jc-autoimport-tunnel -f        # log del tunel
sudo systemctl restart jc-autoimport-web     # tras recompilar la web

# URL publica actual (cambia en cada reinicio con quick tunnel)
grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /var/log/jc-autoimport/tunnel.log | tail -1
```

## La URL cambia en cada reinicio

`cloudflared tunnel --url` es un **quick tunnel**: no pide cuenta, pero cada
vez que arranca reparte un hostname nuevo. Para una direccion fija, un dominio
propio:

1. Crear el dominio y anadirlo a Cloudflare.
2. Autenticar el portatil: `cloudflared tunnel login` (abre el navegador).
3. Crear el tunel: `cloudflared tunnel create jc-autoimport`.
4. Apuntar el DNS: `cloudflared tunnel route dns jc-autoimport web.tudominio.com`.
5. Cambiar `ExecStart` en `jc-autoimport-tunnel.service` por
   `cloudflared tunnel run jc-autoimport` y anadir la credencial con
   `cloudflared tunnel install`.
6. Descomentar en `jc-autoimport-web.service`:
   `Environment=SITE_URL=https://web.tudominio.com`, y reconstruir la web para
   que los canonicals y `og:url` de las paginas estaticas lleven el dominio.
7. `sudo systemctl restart jc-autoimport-web jc-autoimport-tunnel`.

Con el paso 6, `sitemap.xml` y `robots.txt` ya no dependen de nada: leen el
`Host` de la peticion (`resolveSiteUrl` en `apps/web/src/lib/site.ts`).

## Para probarlo desde la red local

El tunel no lo necesitas para probar en casa: la web escucha en 4200 y la API
en 3000. En la laptop, `API_HOST=127.0.0.1` mantiene la API en loopback; pon
`API_HOST=0.0.0.0` y `sudo ufw allow 3000/tcp` solo si quieres Reaching the API
desde el movil. Para la web, `sudo ufw allow 4200/tcp` y
`http://<ip-de-la-laptop>:4200`.

## Si algo falla

| Sintoma | Causa probable |
|---|---|
| `no encuentro la URL en tunnel.log` | el tunel no arranco: `journalctl -u jc-autoimport-tunnel -n 40` |
| El sitio publico da error de DNS | `resolvectl flush-caches` (no hace falta root) |
| La web sirve HTML pero **sin CSS** | se recompilo `apps/web` con el servicio vivo; `sudo systemctl restart jc-autoimport-web` |
| La API reinicia en bucle | Postgres o Redis no estan listos; `systemctl status postgresql redis-server` |
| El formulario o el login fallan en el movil | el navegador no esta usando `/backend`: revisa que el bundle no tenga `localhost:3000` (lo comprueba `verify.sh`) |
| `relation does not exist` | faltaron migraciones: `npx prisma migrate deploy` |

## Seguridad

- La API **no** sale a internet. Lo unico publico es el puerto 4200.
- `/backend` es un proxy con **lista blanca**: catalogo, busqueda, leads,
  auth (login/refresh/logout/me) y 2FA. `users`, `audit`, `payments`,
  `media` y `health` devuelven 404. Un POST con `Origin` ajeno recibe 403
  (CSRF).
- `.env` queda en `chmod 600` y no se versiona; los secretos JWT y
  `DATA_ENCRYPTION_KEY` (clave AES-256-GCM para PII en reposo) se generan
  por maquina. Sin `DATA_ENCRYPTION_KEY` en `production` la API no arranca.
- La sesion web vive en cookies `httpOnly` (`jca_token`/`jca_refresh`): el
  proxy las firma, las manda en `Set-Cookie`, las suple en `refresh` y las
  limpia en `logout`. Las rutas `/cuenta` se protegen en el server (middleware
  + validacion del token contra la API).
- `CORS_ORIGINS` solo hace falta si abres la API a otro origen; el sitio
  publico habla siempre por el proxy del mismo origen.
- Stripe, S3, email y WhatsApp siguen con placeholders: en produccion hacen
  falta claves reales.
- El `.exe` de Windows va sin firmar (SmartScreen lo marcara).
