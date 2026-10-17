import type { Plugin } from "@opencode-ai/plugin"
import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Recuerda (y bloquea) las trampas más caras del proyecto antes de repetirlas.
// BLOQUEA al editar/crear una migración que mencione `search_vector` (ya causó
// pérdida del índice GIN). Regístralo en ~/.local/state/jcautoimport/traps.log.
// Desactivable: JCA_TRAP_GUARD=0

const DIR = join(homedir(), ".local", "state", "jcautoimport")
const LOG = join(DIR, "traps.log")

function note(msg: string) {
  try {
    mkdirSync(DIR, { recursive: true })
    appendFileSync(LOG, `${new Date().toISOString()} ${msg}\n`)
  } catch {
    /* ignore */
  }
}

export default (async () => {
  return {
    "tool.execute.before": async (input: unknown, output: unknown) => {
      try {
        if (process.env.JCA_TRAP_GUARD === "0") return
        const tool = (input as { tool?: string })?.tool
        if (tool !== "edit" && tool !== "write") return
        const args = (output as { args?: Record<string, unknown> })?.args ?? {}
        const fp = String(args.filePath ?? "")
        const body = `${String(args.newString ?? "")}\n${String(args.content ?? "")}\n${String(args.oldString ?? "")}`

        const isMigration = /prisma\/migrations\/.+\/migration\.sql$/.test(fp)
        if (isMigration && /search_vector/i.test(body)) {
          note(`BLOQUEADO migración con search_vector: ${fp}`)
          throw new Error(
            `[trap-guard] Esta migración toca "search_vector". Prisma tiende a emitir ` +
              `DROP INDEX vehicles_search_vector_idx y DROP DEFAULT y ya nos dejó sin el índice GIN. ` +
              `Reescribe el SQL a mano (solo lo pedido), aplica con "npx prisma migrate deploy" y ` +
              `recrea el índice: CREATE INDEX vehicles_search_vector_idx ON vehicles USING GIN (search_vector); ` +
              `Ver skill jca-known-traps.`,
          )
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("[trap-guard]")) throw e
      }
    },
  }
}) satisfies Plugin
