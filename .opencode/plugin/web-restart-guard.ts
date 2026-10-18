import type { Plugin } from "@opencode-ai/plugin"
import { execFile } from "node:child_process"
import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Tras compilar la web, reinicia el server para evitar el bug conocido:
// un `next build` con el server vivo deja `.next/standalone` recreado y el
// proceso sirve HTML 200 pero SIN CSS.
//
// La orden de reinicio se define en KIT_WEB_RESTART_CMD (shell), p. ej.:
//   KIT_WEB_RESTART_CMD="systemctl --user restart mi-web"
//   KIT_WEB_RESTART_CMD="pm2 restart web"
// Si no está definida, solo se registra el aviso en el log.
// Desactivable: KIT_WEB_RESTART=0

const DIR = join(homedir(), ".local", "state", "opencode-web-kit")
const LOG = join(DIR, "web-restart.log")

const BUILD_RE = /(run\s+build|\bnext\s+build|web:build|--prefix\s+\S*web\S*\s+run\s+build)/

export default (async () => {
  return {
    "tool.execute.after": async (input: unknown, output: unknown) => {
      try {
        if (process.env.KIT_WEB_RESTART === "0") return
        if ((input as { tool?: string })?.tool !== "bash") return
        const cmd = String((output as { args?: { command?: string } })?.args?.command ?? "")
        if (!BUILD_RE.test(cmd)) return

        mkdirSync(DIR, { recursive: true })
        const restartCmd = process.env.KIT_WEB_RESTART_CMD?.trim()

        if (!restartCmd) {
          appendFileSync(
            LOG,
            `${new Date().toISOString()} build web detectado -> sin KIT_WEB_RESTART_CMD, nada que reiniciar\n`,
          )
          return
        }

        appendFileSync(
          LOG,
          `${new Date().toISOString()} build web detectado -> ${restartCmd}\n`,
        )
        execFile("sh", ["-c", restartCmd], () => {})
      } catch {
        /* ignore */
      }
    },
  }
}) satisfies Plugin
