import type { Plugin } from "@opencode-ai/plugin"
import { execFile } from "node:child_process"
import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Tras compilar la web (`apps/web`), reinicia el server standalone para evitar
// el bug conocido: un build con el server vivo deja `.next/standalone`
// recreado y el proceso sirve HTML 200 pero SIN CSS.
// Desactivable: JCA_WEB_RESTART=0

const DIR = join(homedir(), ".local", "state", "jcautoimport")
const LOG = join(DIR, "web-restart.log")

const BUILD_RE = /(--prefix\s+apps\/web\s+run\s+build|web:build|apps\/web[^\n]*\bnext\s+build)/

export default (async () => {
  return {
    "tool.execute.after": async (input: unknown, output: unknown) => {
      try {
        if (process.env.JCA_WEB_RESTART === "0") return
        if ((input as { tool?: string })?.tool !== "bash") return
        const cmd = String((output as { args?: { command?: string } })?.args?.command ?? "")
        if (!BUILD_RE.test(cmd)) return

        mkdirSync(DIR, { recursive: true })
        appendFileSync(
          LOG,
          `${new Date().toISOString()} build web detectado -> restart\n`,
        )

        execFile("systemctl", ["--user", "restart", "jc-autoimport-web"], () => {})
      } catch {
        /* ignore */
      }
    },
  }
}) satisfies Plugin
