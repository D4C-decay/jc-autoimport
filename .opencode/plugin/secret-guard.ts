import type { Plugin } from "@opencode-ai/plugin"
import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Guardián de secretos (defensa en profundidad). BLOQUEA (throw) dos casos:
//   1) escribir/editar un `.env` real (se permite `.env.example`).
//   2) `git add` que incluya `.env` real, `*.pem` o `id_rsa`.
// Todo lo demás pasa. Desactivable: JCA_SECRET_GUARD=0

const DIR = join(homedir(), ".local", "state", "jcautoimport")
const LOG = join(DIR, "secret-guard.log")

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
        if (process.env.JCA_SECRET_GUARD === "0") return
        const tool = (input as { tool?: string })?.tool
        const args = (output as { args?: Record<string, unknown> })?.args ?? {}

        if (tool === "edit" || tool === "write") {
          const fp = String(args.filePath ?? "")
          const isRealEnv = /(^|\/)\.env$/.test(fp)
          if (isRealEnv) {
            note(`BLOQUEADO edit/write ${fp}`)
            throw new Error(
              `[secret-guard] Edición directa de "${fp}" bloqueada. Usa .env.example. ` +
                `Si de verdad necesitas tocar el .env, hazlo fuera de opencode.`,
            )
          }
        }

        if (tool === "bash") {
          const cmd = String(args.command ?? "")
          const isGitAdd = /\bgit\s+add\b/.test(cmd)
          const touchesSecret = /(^|[\s"'])\.env(\s|$|["'])|\.pem\b|id_rsa/.test(cmd)
          if (isGitAdd && touchesSecret) {
            note(`BLOQUEADO git add con secreto: ${cmd}`)
            throw new Error(
              `[secret-guard] "git add" parece incluir un archivo secreto (.env/.pem/id_rsa). ` +
                `Bloqueado por seguridad. Revisa el comando.`,
            )
          }
        }
      } catch (e) {
        // Re-lanzar SOLO nuestros bloqueos (Error propio); tragar cualquier otro fallo interno.
        if (e instanceof Error && e.message.startsWith("[secret-guard]")) throw e
      }
    },
  }
}) satisfies Plugin
