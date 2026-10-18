import type { Plugin } from "@opencode-ai/plugin"
import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Guardián de trampas conocidas. BLOQUEA dos casos:
//   1) editar `.env*` reales (se permite .env.example / .env.sample) o ficheros
//      de clave (id_rsa, *.pem, *.key, *.p12, *.crt).
//   2) en migraciones Prisma: SQL destructivo sobre `search_vector`
//      (DROP INDEX/COLUMN/TABLE o DROP DEFAULT) — ya costó un índice GIN.
// Regístralo en ~/.local/state/opencode-web-kit/traps.log
// Desactivable: KIT_TRAP_GUARD=0

const DIR = join(homedir(), ".local", "state", "opencode-web-kit")
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
        if (process.env.KIT_TRAP_GUARD === "0") return
        const tool = (input as { tool?: string })?.tool
        if (tool !== "edit" && tool !== "write") return
        const args = (output as { args?: Record<string, unknown> })?.args ?? {}
        const fp = String(args.filePath ?? "")
        const body = `${String(args.newString ?? "")}\n${String(args.content ?? "")}\n${String(args.oldString ?? "")}`

        // Secretos: nunca editar .env* reales ni ficheros de clave
        const isExample = /\.env\.(example|sample)$/.test(fp)
        const isEnv = /(^|\/)\.env(\.[\w-]+)?$/.test(fp) && !isExample
        const isKeyFile = /(^|\/)(id_(rsa|dsa|ecdsa|ed25519)|[^/]+\.(pem|key|p12|pfx|crt))$/.test(fp)
        if (isEnv || isKeyFile) {
          note(`BLOQUEADO edición de secreto: ${fp}`)
          throw new Error(
            `[trap-guard] "${fp}" es un archivo secreto. No lo edites desde aquí: ` +
              `usa tu gestor de claves o edita .env.example (que sí se versiona).`,
          )
        }

        // Prisma + search_vector: solo SQL destructivo
        const isMigration = /prisma\/migrations\/.+\/migration\.sql$/.test(fp)
        const destructive =
          /(DROP\s+(INDEX|TABLE|COLUMN)|DROP\s+DEFAULT)/i.test(body) && /search_vector/i.test(body)
        if (isMigration && destructive) {
          note(`BLOQUEADO migración destructiva sobre search_vector: ${fp}`)
          throw new Error(
            `[trap-guard] Esta migración ejecuta SQL destructivo sobre "search_vector" ` +
              `(DROP INDEX / DROP DEFAULT), lo que dejaría la tabla sin su índice GIN. ` +
              `Reescribe el SQL a mano (solo lo pedido), aplica con "npx prisma migrate deploy" ` +
              `y recrea el índice con CREATE INDEX ... USING GIN si se cayó.`,
          )
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("[trap-guard]")) throw e
      }
    },
  }
}) satisfies Plugin
