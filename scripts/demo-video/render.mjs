#!/usr/bin/env node
// Pule el clip grabado por record.mjs: reescala a 1080p, normaliza fps, aplica
// fundidos de entrada/salida, recorta a la duración pedida, añade música opcional
// y exporta H.264 (faststart) listo para la web.
//
// Uso: node scripts/demo-video/render.mjs
//   MUSIC=/ruta/tema.mp3 node scripts/demo-video/render.mjs
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const INPUT = process.env.INPUT || 'scripts/demo-video/out/raw.mp4'
const OUTPUT = process.env.OUTPUT || 'public/media/demo/demo.mp4'
const W = Number(process.env.VIDEO_W || 1920)
const H = Number(process.env.VIDEO_H || 1080)
const FPS = Number(process.env.VIDEO_FPS || 25)
const SECONDS = Number(process.env.VIDEO_SECONDS || 10)
const FADE = 0.6
const MUSIC = process.env.MUSIC || ''

if (!existsSync(INPUT)) {
  console.error(`render.mjs: no existe ${INPUT}.Ejecuta antes record.mjs.`)
  process.exit(1)
}
mkdirSync(dirname(OUTPUT), { recursive: true })

const fadeOutStart = Math.max(0, SECONDS - FADE)
const vf = [
  `fps=${FPS}`,
  `scale=${W}:${H}:force_original_aspect_ratio=decrease`,
  `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black`,
  `fade=t=in:st=0:d=${FADE}`,
  `fade=t=out:st=${fadeOutStart}:d=${FADE}`,
  'format=yuv420p',
].join(',')

const args = ['-y', '-i', INPUT]
if (MUSIC && existsSync(MUSIC)) args.push('-i', MUSIC)

args.push(
  '-t', String(SECONDS),
  '-vf', vf,
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '20',
  '-movflags', '+faststart',
)

if (MUSIC && existsSync(MUSIC)) {
  args.push('-c:a', 'aac', '-b:a', '160k', '-shortest', '-map', '0:v:0', '-map', '1:a:0')
} else {
  args.push('-an')
}
args.push(OUTPUT)

execFileSync('ffmpeg', args, { stdio: 'inherit' })
console.log(`OK -> ${OUTPUT} (${W}x${H}, ${SECONDS}s, ${FPS}fps)`)
