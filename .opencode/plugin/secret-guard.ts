import type { Plugin } from "@opencode-ai/plugin"
import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Guardián de secretos (defensa en profundidad). BLOQUEA (throw):
//   1) editar `.env*` reales (se permite .env.example / .env.sample) o ficheros
//      de clave (id_rsa, *.pem, *.key, *.p12, *.pfx, *.crt).
//   2) `git add` que incluya un secreto.
//   3) `cat`/`head`/`less`/`cp`... sobre un `.env*` real.
// Todo lo demás pasa. Desactivable: KIT_SECRET_GUARD=0

const DIR = join(homedir(), ".local", "state", "opencode-web-kit")
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
        if (process.env.KIT_SECRET_GUARD === "0") return
        const tool = (input as { tool?: string })?.tool
        const args = (output as { args?: Record<string, unknown> })?.args ?? {}

        if (tool === "edit" || tool === "write") {
          const fp = String(args.filePath ?? "")
          const isExample = /\.env\.(example|sample)$/.test(fp)
          const isEnv = /(^|\/)\.env(\.[\w-]+)?$/.test(fp) && !isExample
          const isKeyFile = /(^|\/)(id_(rsa|dsa|ecdsa|ed25519)|[^/]+\.(pem|key|p12|pfx|crt))$/.test(fp)
          if (isEnv || isKeyFile) {
            note(`BLOQUEADO edit/write ${fp}`)
            throw new Error(
              `[secret-guard] Edición directa de "${fp}" bloqueada. Usa .env.example. ` +
                `Si de verdad necesitas tocar el secreto, hazlo fuera de opencode.`,
            )
          }
        }

        if (tool === "bash") {
          const cmd = String(args.command ?? "")
          const isGitAdd = /\bgit\s+add\b/.test(cmd)
          const touchesSecret =
            /(^|[\s"'`])\.env(\.[\w-]+)?(?!\.(example|sample)\b)(\s|$|["'`])/.test(cmd) ||
            /\.pem\b|\.key\b|id_(rsa|ed25519)/.test(cmd)
          const readsSecret =
            !isGitAdd && /\b(cat|less|head|tail|cp|mv|source|\.)\b[^;&|]*\.env(\.[\w-]+)?(?!\.(example|sample)\b)/.test(cmd)
          if ((isGitAdd && touchesSecret) || readsSecret) {
            note(`BLOQUEADO comando con secreto: ${cmd}`)
            throw new Error(
              `[secret-guard] El comando parece tocar un secreto (.env*, *.pem/key, id_*). ` +
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
