import type { Plugin } from "@opencode-ai/plugin"
import { execFile } from "node:child_process"
import { appendFileSync, mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// Auto-verificación AL FINAL DE CADA TURNO (evento session.idle), condicional:
//   - solo corre si hubo ediciones/write de CÓDIGO en este turno (.md, imágenes
//     y docs NO disparan build: documentación y diagramas no rompen nada)
//   - detecta los scripts disponibles en package.json (raíz y apps/*)
//     y ejecuta, en este orden: typecheck|lint -> build (si existen)
// Timeout duro por comando. Resultados en ~/.local/state/opencode-web-kit/verify.log
// y resumen legible en <proyecto>/.opencode/last-verify.md (lo leen los builders)
// Desactivable: KIT_AUTO_VERIFY=0

const DIR = join(homedir(), ".local", "state", "opencode-web-kit")
const LOG = join(DIR, "verify.log")
const TIMEOUT_MS = 240000

type ExecResult = { ok: boolean; text: string }

type PkgScripts = Record<string, string>

const readScripts = (dir: string): PkgScripts | null => {
  const f = join(dir, "package.json")
  if (!existsSync(f)) return null
  try {
    const pkg = JSON.parse(readFileSync(f, "utf8")) as { scripts?: PkgScripts }
    return pkg.scripts ?? null
  } catch {
    return null
  }
}

export default (async ({ directory }) => {
  const dirty = new Set<string>()
  let running = false

  const run = (cmd: string, args: string[], cwd: string): Promise<ExecResult> =>
    new Promise((resolve) => {
      execFile(
        cmd,
        args,
        { cwd, timeout: TIMEOUT_MS, maxBuffer: 1 << 24 },
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

  // Paquetes que toca: raíz + los apps/* afectados
  const touchedPkgs = (paths: string[]): string[] => {
    const set = new Set<string>([directory])
    for (const p of paths) {
      const m = p.replace(/\\/g, "/").match(/(?:^|\/)(apps\/[^/]+)\//)
      if (m) set.add(join(directory, m[1] as string))
    }
    return [...set]
  }

  return {
    "tool.execute.after": async (input: unknown, output: unknown) => {
      try {
        const tool = (input as { tool?: string })?.tool
        if (tool !== "edit" && tool !== "write") return
        const args = (output as { args?: { filePath?: string } })?.args
        const fp = String(args?.filePath ?? "")
        if (fp && /\.(ts|tsx|js|jsx|mjs|cjs|json|css|scss|sql|prisma|yaml|yml|toml)$/.test(fp)) dirty.add(fp)
      } catch {
        /* ignore */
      }
    },

    event: async (input: unknown) => {
      try {
        if (process.env.KIT_AUTO_VERIFY === "0") return
        const anyIn = input as { event?: { type?: string } }
        const ev = anyIn?.event ?? input
        if ((ev as { type?: string })?.type !== "session.idle") return
        if (running || dirty.size === 0) return

        const paths = [...dirty]
        dirty.clear()
        running = true

        const chunks: string[] = [`changed: ${paths.join(", ")}`]
        for (const pkgDir of touchedPkgs(paths)) {
          const scripts = readScripts(pkgDir)
          if (!scripts) continue
          const rel = pkgDir === directory ? "." : pkgDir.replace(directory + "/", "")
          const check = ["typecheck", "lint", "test"].filter((s) => scripts[s])
          const build = scripts["build"]
          if (check.length === 0 && !build) continue

          for (const s of check) {
            const r = await run("npm", ["run", s], pkgDir)
            chunks.push(`[${rel}] ${r.text}`)
            if (!r.ok) break
          }
          if (build) {
            const r = await run("npm", ["run", "build"], pkgDir)
            chunks.push(`[${rel}] ${r.text}`)
          }
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
