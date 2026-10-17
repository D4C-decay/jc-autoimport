import type { Plugin } from "@opencode-ai/plugin"
import { execFile } from "node:child_process"
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Auto-verificación AL FINAL DE CADA TURNO (evento session.idle), condicional:
//   - cambios en backend (src/**)  -> `npm run build` + `npm run lint`
//   - cambios en apps/web/**       -> `npm --prefix apps/web run lint` (typecheck)
// Timeout duro por comando. Resultados en ~/.local/state/jcautoimport/verify.log
// y resumen legible en <proyecto>/.opencode/last-verify.md (lo leen los builders)
// Desactivable: JCA_AUTO_VERIFY=0

const DIR = join(homedir(), ".local", "state", "jcautoimport")
const LOG = join(DIR, "verify.log")
const TIMEOUT_MS = 240000

type ExecResult = { ok: boolean; text: string }

export default (async ({ directory }) => {
  const dirty = new Set<string>()
  let running = false

  const run = (cmd: string, args: string[]): Promise<ExecResult> =>
    new Promise((resolve) => {
      execFile(
        cmd,
        args,
        { cwd: directory, timeout: TIMEOUT_MS, maxBuffer: 1 << 24 },
        (err, stdout, stderr) => {
          resolve({
            ok: !err,
            text: `${err ? "FAIL" : "OK"}  ${cmd} ${args.join(" ")}\n${stdout ?? ""}${stderr ?? ""}`,
          })
        },
      )
    })

  const log = (text: string) => {
    try {
      mkdirSync(DIR, { recursive: true })
      appendFileSync(LOG, `\n===== ${new Date().toISOString()} =====\n${text}\n`)
    } catch {
      /* ignore */
    }
  }

  return {
    "tool.execute.after": async (input: unknown, output: unknown) => {
      try {
        const tool = (input as { tool?: string })?.tool
        if (tool !== "edit" && tool !== "write") return
        const args = (output as { args?: { filePath?: string } })?.args
        const fp = String(args?.filePath ?? "")
        if (fp && /\/src\/|apps\/web\//.test(fp)) dirty.add(fp)
      } catch {
        /* ignore */
      }
    },

    event: async (input: unknown) => {
      try {
        if (process.env.JCA_AUTO_VERIFY === "0") return
        const anyIn = input as { event?: { type?: string } }
        const ev = anyIn?.event ?? input
        if ((ev as { type?: string })?.type !== "session.idle") return
        if (running || dirty.size === 0) return

        const paths = [...dirty]
        dirty.clear()
        running = true

        const backend = paths.some((p) => /\/src\//.test(p) && !p.includes("apps/web/"))
        const web = paths.some((p) => p.includes("apps/web/"))

        const chunks: string[] = [`changed: ${paths.join(", ")}`]
        if (backend) {
          const build = await run("npm", ["run", "build"])
          chunks.push(build.text)
          if (build.ok) {
            const lint = await run("npm", ["run", "lint"])
            chunks.push(lint.text)
          }
        }
        if (web) {
          const typecheck = await run("npm", ["--prefix", "apps/web", "run", "lint"])
          chunks.push(typecheck.text)
        }

        running = false
        const body = chunks.join("\n")
        log(body)
        try {
          const failed = /FAIL\s/.test(body)
          const md = [
            `# Última auto-verificación`,
            ``,
            `- ${new Date().toISOString()}`,
            `- resultado: **${failed ? "ROJO (revisar antes de aprobar)" : "verde"}**`,
            `- ficheros tocados: ${paths.join(", ")}`,
            ``,
            "```",
            body,
            "```",
            "",
          ].join("\n")
          writeFileSync(join(directory, ".opencode", "last-verify.md"), md)
        } catch {
          /* ignore */
        }
      } catch {
        running = false
      }
    },
  }
}) satisfies Plugin
