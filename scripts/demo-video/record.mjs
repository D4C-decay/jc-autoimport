#!/usr/bin/env node
// Graba un clip de la web JC Autoimport por CDP (Page.startScreencast), SIN dependencias npm:
// usa el WebSocket nativo de Node (>=22) + ffmpeg para ensamblar los frames a MP4.
//
// Lanza su PROPIO Chromium en headless (no toca tu Brave ni tu escritorio), navega la web
// local y produce un vídeo mudo. Luego `render.mjs` lo pule (fades, música, tamaño final).
//
// Requisitos: ffmpeg en PATH y un binario Chromium (Brave/Chrome/Chromium/Playwright).
// Uso: node scripts/demo-video/record.mjs
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const SITE = process.env.SITE_URL || 'http://localhost:4200'
const PORT = Number(process.env.CDP_PORT || 9333)
const W = Number(process.env.VIDEO_W || 1920)
const H = Number(process.env.VIDEO_H || 1080)
const FPS = Number(process.env.VIDEO_FPS || 25)
const SECONDS = Number(process.env.VIDEO_SECONDS || 10)
const PROFILE = '/tmp/opencode/demo-browser'
const FRAMES = '/tmp/opencode/demo-frames'
const OUTDIR = 'scripts/demo-video/out'
const RAW = join(OUTDIR, 'raw.mp4')

function findChromium() {
  const cands = [
    process.env.CHROME_BIN,
    '/usr/bin/brave',
    '/opt/brave-bin/brave',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    join(homedir(), '.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'),
  ].filter(Boolean)
  for (const c of cands) if (existsSync(c)) return c
  throw new Error('No se encontró ningún binario Chromium (define CHROME_BIN).')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// --- Cliente CDP mínimo sobre WebSocket nativo ---
class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.handlers = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      } else if (msg.method) {
        ;(this.handlers.get(msg.method) || []).forEach((h) => h(msg.params, msg.sessionId))
      }
    })
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, [])
    this.handlers.get(method).push(fn)
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id
    const payload = { id, method, params }
    if (sessionId) payload.sessionId = sessionId
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify(payload))
    })
  }
}

async function main() {
  mkdirSync(PROFILE, { recursive: true })
  rmSync(FRAMES, { recursive: true, force: true })
  mkdirSync(FRAMES, { recursive: true })
  mkdirSync(OUTDIR, { recursive: true })

  const bin = findChromium()
  console.log(`Chromium: ${bin}`)
  const child = spawn(
    bin,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      `--window-size=${W},${H}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  let version
  for (let i = 0; i < 30; i++) {
    try {
      version = await (await fetch(`http://localhost:${PORT}/json/version`)).json()
      break
    } catch {
      await sleep(300)
    }
  }
  if (!version) throw new Error('El navegador no expuso CDP a tiempo.')

  const ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res)
    ws.addEventListener('error', rej)
  })
  const cdp = new CDP(ws)

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
  const send = (m, p = {}) => cdp.send(m, p, sessionId)

  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: W,
    height: H,
    deviceScaleFactor: 1,
    mobile: false,
  })

  let n = 0
  let firstTs = 0
  let lastTs = 0
  const stamps = []
  cdp.on('Page.screencastFrame', async (p) => {
    try {
      const file = join(FRAMES, `f${String(n).padStart(5, '0')}.jpg`)
      writeFileSync(file, Buffer.from(p.data, 'base64'))
      if (n === 0) firstTs = p.metadata.timestamp
      lastTs = p.metadata.timestamp
      stamps.push({ file, ts: p.metadata.timestamp })
      n++
      await cdp.send('Page.screencastFrameAck', { sessionId: p.sessionId }, sessionId)
    } catch {
      /* ignore */
    }
  })

  const goto = async (url) => {
    await send('Page.navigate', { url })
    await sleep(1200)
  }
  const scroll = (y, ms) =>
    send('Runtime.evaluate', {
      expression: `window.scrollTo({top:${y},behavior:'smooth'})`,
    }).then(() => sleep(ms))

  await send('Page.startScreencast', {
    format: 'jpeg',
    quality: 82,
    maxWidth: W,
    maxHeight: H,
    everyNthFrame: 1,
  })

  // --- storyboard (≈ SECONDS) ---
  await goto(SITE)
  await sleep(1400)
  await scroll(700, 1200)
  await scroll(1600, 1100)
  await goto(SITE + '/catalogo')
  await sleep(1200)
  await scroll(900, 1200)
  await sleep(1200)

  // rellena hasta ~SECONDS para que el clip no salga más corto de lo pedido
  {
    const elapsed = (lastTs - firstTs) || 0
    if (elapsed < SECONDS) await sleep((SECONDS - elapsed) * 1000)
  }

  await send('Page.stopScreencast')
  ws.close()
  child.kill('SIGKILL')

  if (stamps.length < 5) throw new Error(`Muy pocos frames (${stamps.length}); ¿la web responde en ${SITE}?`)

  // --- concat demuxer con duración por frame (timing real) ---
  const total = (lastTs - firstTs) || SECONDS
  const lines = ['ffconcat version 1.0']
  for (let i = 0; i < stamps.length; i++) {
    const next = stamps[i + 1]?.ts ?? lastTs + 1 / FPS
    const dur = Math.max(1 / 60, Math.min(1, next - stamps[i].ts))
    lines.push(`file '${stamps[i].file}'`, `duration ${dur.toFixed(4)}`)
  }
  lines.push(`file '${stamps[stamps.length - 1].file}'`)
  const list = join(FRAMES, 'list.txt')
  writeFileSync(list, lines.join('\n'))

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', list,
      '-vf', `fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '21',
      '-movflags', '+faststart',
      '-an',
      RAW,
    ],
    { stdio: 'inherit' },
  )

  console.log(`OK frames=${stamps.length} dur≈${total.toFixed(1)}s -> ${RAW}`)
}

main().catch((e) => {
  console.error('record.mjs ERROR:', e.message)
  process.exit(1)
})
