import type { Plugin } from "@opencode-ai/plugin"
import { execFile } from "node:child_process"

// Notificación de escritorio cuando la sesión queda idle (turno terminado).
// Desactivable: JCA_NOTIFY=0

function eventOf(input: unknown): { type?: string } {
  const anyIn = input as { event?: { type?: string } }
  return (anyIn?.event ?? input) as { type?: string }
}

export default (async () => {
  return {
    event: async (input: unknown) => {
      try {
        if (process.env.JCA_NOTIFY === "0") return
        if (eventOf(input)?.type !== "session.idle") return
        execFile(
          "notify-send",
          ["--app-name=opencode", "opencode", "Tarea terminada"],
          () => {},
        )
      } catch {
        // sin notify-send o sin escritorio: ignorar
      }
    },
  }
}) satisfies Plugin
