import type { Plugin } from "@opencode-ai/plugin"
import { appendFileSync, existsSync, mkdirSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Al primer evento de cada sesión: asegura /tmp/opencode, registra el arranque y
// anota si el grafo de conocimiento (graphify-out/graph.json) está fresco (<24h).
// Apoyo a las "Reglas de continuidad" de AGENTS.md. Desactivable: KIT_SESSION_BOOT=0

const DIR = join(homedir(), ".local", "state", "opencode-web-kit")
const LOG = join(DIR, "session-boot.log")

const seen = new Set<string>()

function boot(directory: string) {
  try {
    mkdirSync("/tmp/opencode", { recursive: true })
    mkdirSync(DIR, { recursive: true })

    const graph = join(directory, "graphify-out", "graph.json")
    let graphState = "no existe"
    if (existsSync(graph)) {
      const ageH = (Date.now() - statSync(graph).mtimeMs) / 3_600_000
      graphState = ageH < 24 ? `fresco (${ageH.toFixed(1)}h)` : `viejo (${ageH.toFixed(1)}h)`
    }

    appendFileSync(
      LOG,
      `${new Date().toISOString()} cwd=${directory} graph=${graphState}\n`,
    )
  } catch {
    /* ignore */
  }
}

export default (async ({ directory }) => {
  return {
    event: async (input: unknown) => {
      try {
        if (process.env.KIT_SESSION_BOOT === "0") return
        const anyIn = input as { event?: { type?: string; properties?: { sessionID?: string } } }
        const ev = anyIn?.event ?? input
        const type = (ev as { type?: string })?.type
        if (type !== "session.created") return
        const sid = (ev as { properties?: { sessionID?: string } })?.properties?.sessionID ?? "?"
        if (seen.has(sid)) return
        seen.add(sid)
        boot(directory)
      } catch {
        /* ignore */
      }
    },
  }
}) satisfies Plugin
