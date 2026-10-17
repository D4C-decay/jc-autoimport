import type { Plugin } from "@opencode-ai/plugin"
import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Registra cada evento del bus de opencode en un log persistente (no /tmp).
// Sirve además para descubrir/afinar los nombres reales de los eventos.
// Desactivable: JCA_SESSION_LOG=0

const DIR = join(homedir(), ".local", "state", "jcautoimport")
const LOG = join(DIR, "session.log")

function shape(input: unknown): { type: string; raw: unknown } {
  const anyIn = input as { event?: { type?: string } }
  const ev = anyIn?.event ?? input
  const type = (ev as { type?: string })?.type ?? "unknown"
  return { type, raw: ev }
}

export default (async () => {
  return {
    event: async (input: unknown) => {
      try {
        if (process.env.JCA_SESSION_LOG === "0") return
        const { type, raw } = shape(input)
        mkdirSync(DIR, { recursive: true })
        const line = `${new Date().toISOString()} ${type} ${JSON.stringify(raw)?.slice(0, 400) ?? ""}\n`
        appendFileSync(LOG, line)
      } catch {
        // nunca romper la sesión por logging
      }
    },
  }
}) satisfies Plugin
