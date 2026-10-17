---
tags:
  - logs
  - bitacora
type: bitacora
status: vivo
---

# Bitácora de sesiones

> Replica el "Log de sesiones" de `MEMORY.md` (fuente de verdad en el repo de código). Aquí se documentan las sesiones de trabajo con fecha, qué se hizo y decisiones.

## 2026-09-08 — Bóvedas Obsidian con sync Git

- Montaje de las bóvedas Obsidian del **proyecto** (`jcautoimport-obsidian`) y **personal** (`vault-personal`).
- Obsidian pasó de flatpak a binario nativo (`pacman`).
- Plugins configurados: `obsidian-git`, `dataview`, `templater`.
- Migración de documentación (MEMORY.md/AGENTS.md) a esta bóveda + índice de decisiones (ADR).
- Workflow de seguridad del vault (gitleaks + validaciones) en ambos repos vía GitHub Actions.
- Hallazgo: GitHub Free requiere scope `workflow` para commits con `.github/workflows` (autorizado).

## Ver también

- [[Diario/2026-09-08|Diario 2026-09-08]]