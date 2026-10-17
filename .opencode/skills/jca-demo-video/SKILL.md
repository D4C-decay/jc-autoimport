---
name: jca-demo-video
description: Use when producing a short promotional/company-demo video of the JC Autoimport website (screen recording, mp4, ~10s, 1080p). Explains the dependency-free CDP recorder (record.mjs), the ffmpeg renderer (render.mjs), and the styling rules for a branded clip.
---

# Vídeo demo de JC Autoimport

Objetivo: clips cortos (≈10 s), 1920×1080, H.264 `faststart`, con la estética de marca
(negro/blanco/rojo, sin latón), listos para `apps/web/public/media/demo/`.

## Pipeline (sin dependencias npm; usa Node + CDP + ffmpeg)

1. Asegura que la web local está viva: `http://localhost:4200`.
2. Graba (lanza un Chromium headless propio, no toca tu Brave):
   ```bash
   node scripts/demo-video/record.mjs      # -> scripts/demo-video/out/raw.mp4
   ```
   Variables: `SITE_URL`, `CDP_PORT`, `VIDEO_W`, `VIDEO_H`, `VIDEO_FPS`, `VIDEO_SECONDS`, `CHROME_BIN`.
3. Pule y exporta:
   ```bash
   node scripts/demo-video/render.mjs      # -> apps/web/public/media/demo/demo.mp4
   # opcional con música:
   MUSIC=/ruta/tema.mp3 node scripts/demo-video/render.mjs
   ```

## Reglas de estilo del clip

- Duración **8–12 s**; ritmo pausado, sin cortes bruscos (fundidos de 0,6 s).
- Mostrar: hero (vídeo), carril de destacados, catálogo con filtros y una ficha de vehículo.
- Sin texto quemado de terceros; música **libre de regalías** o ninguna (nunca con copyright ajeno).
- Verifica con `ffprobe`: 1920×1080, H.264, `faststart`, sin audio roto.

## Licencias

- Sólo medios propios o de licencia libre; anótalo en `apps/web/public/media/CREDITS.md`.
