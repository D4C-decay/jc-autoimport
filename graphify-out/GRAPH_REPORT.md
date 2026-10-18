# Graph Report - jc-autoimport  (2026-10-18)

## Corpus Check
- 291 files · ~822,226 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 54 file(s) not represented in the graph (top: .csv 37, (none) 9, .service 3)

## Summary
- 2413 nodes · 4742 edges · 176 communities (124 shown, 52 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 219 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `56f11639`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PaymentsService
- VehiclesController
- MediaService
- totp.ts
- package.json
- api.ts
- AppConfigService
- validate_data.py
- app.module.ts
- web/package.json
- dependencies
- home-page.tsx
- scripts
- layout.tsx
- audit.module.ts
- PrismaService
- desktop/package.json
- ref_node_fs
- vehicle-detail-page.tsx
- devDependencies
- core.py
- leads.service.ts
- compilerOptions
- lucide-react
- compilerOptions
- @nestjs/swagger
- reflect-metadata
- UsersController
- route.ts
- seed.ts
- make-icon.mjs
- main/main.ts
- compilerOptions
- LoggerService
- smoke.mjs
- design_system.py
- record.mjs
- Public
- RegisterDto
- next
- test_design_system_mode.py
- auth-extra.dto.ts
- media.service.ts
- vehicles.repository.ts
- @nestjs/common
- CurrentUser
- VehiclesRepository
- VehicleFilterDto
- ref_node_path
- setup-debian.sh
- TokenService
- Memoria del proyecto JC Autoimport
- CreateUserDto
- LoginPage
- mcp
- permission
- search
- SearchQueryDto
- render.mjs
- PaginationQueryDto
- search_stack
- bash
- qwen2.5:7b
- oxlint.json
- tsconfig.build.json
- test_catalog_summary_line_endings.py
- format_ascii_box
- verify.sh
- nest-cli.json
- opencode.json
- after-pack.mjs
- Roles
- BM25
- allowScripts
- kit-lint.mjs
- update.sh
- UI/UX Pro Max - Design Intelligence
- postgres
- ollama
- CreateVehicleDto
- AuditInterceptor
- global.d.ts
- CreateLeadDto
- Throttle
- launch-smoke.sh
- globals.d.ts
- postcss.config.mjs
- Convenciones del proyecto
- DESIGN.md — Contrato visual de JC Autoimport (web) · v2
- prisma
- prisma
- chrome-debug.sh
- mcp-postgres.sh
- _palette_is_dark
- CatalogRefreshTest
- detect_domain
- DesignSystemGenerator
- read_rows
- Pre-Delivery Checklist (canonical — the only one)
- Quick Reference
- UsersService
- VehiclesService
- .generate
- Checklist de contratos
- security-pentester.md
- AuthService
- LeadsService
- dependencies
- Diario — 2026-09-08
- persist_design_system
- TestReasoningContract
- AuditController
- Roadmap — JC Autoimport
- auto-verify.ts
- devDependencies
- data-integrity-tester.md
- Checklist de edge cases
- lead-form.tsx
- 🏠 JC Autoimport — Dashboard
- Decisión {{001}} — Título
- TwoFactorCodeDto
- plan-coordinator.md
- resilience-tester.md
- test-coordinator.md
- scripts
- Confirmación de correo al registrarse (2026-10-10)
- Agentes y flujo de trabajo opencode
- Decisión 001 — ESM obligatorio (imports relativos con sufijo `.js`)
- Diario — {{date}}
- Mentor Linux
- split_values
- DESIGN.md - Contrato visual
- Stack tecnológico
- Estado del backend — JC Autoimport
- Backlog
- Despliegue
- JC Autoimport — Documentación del proyecto
- data-ops.md
- web-builder.md
- TestStackFlagWithDesignSystem
- TestTextLayoutDataContracts
- Navegar la web con CDP
- Vídeo demo del sitio
- Design system del proyecto
- Trampas caras en proyectos web (no volver a tropezar)
- maquina-check.sh
- Creditos de media (hero)
- Índice de decisiones (ADR)
- abogado-del-diablo.md
- build-verifier.md
- db-ops.md
- git-committer.md
- memory-keeper.md
- perf-auditor.md
- security-auditor.md
- playwright
- arquitecto-tecnico.md
- code-reviewer.md
- demo-video-producer.md
- experto-negocio.md
- experto-operaciones.md
- experto-seguridad.md
- experto-usuario.md
- ui-reviewer.md
- new-web.sh
- vehicles/CREDITS.md

## God Nodes (most connected - your core abstractions)
1. `reflect-metadata` - 64 edges
2. `@nestjs/common` - 63 edges
3. `search()` - 43 edges
4. `AppConfigService` - 42 edges
5. `PrismaService` - 41 edges
6. `DesignSystemGenerator` - 38 edges
7. `RedisService` - 36 edges
8. `search_stack()` - 35 edges
9. `scripts` - 32 edges
10. `cn()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Carrusel continuo (N+1) y paleta de marca (2026-09-28)` --references--> `FeaturedRail()`  [INFERRED]
  MEMORY.md → apps/web/src/components/featured-rail.tsx
- `Interaction (App)` --references--> `Button()`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/references/pro-rules.md → apps/web/src/components/ui.tsx
- `La URL cambia en cada reinicio` --references--> `resolveSiteUrl()`  [INFERRED]
  deploy/README.md → apps/web/src/lib/site.ts
- `Despliegue reproducible en portatil Debian (2026-09-28)` --references--> `resolveSiteUrl()`  [INFERRED]
  MEMORY.md → apps/web/src/lib/site.ts
- `Áreas a cubrir` --references--> `robots()`  [INFERRED]
  .opencode/agent/test-coordinator.md → apps/web/src/app/robots.ts

## Import Cycles
- None detected.

## Communities (176 total, 52 thin omitted)

### Community 0 - "PaymentsService"
Cohesion: 0.09
Nodes (7): PaymentsService, CancelReservationDto, CreateCheckoutDto, CreatePaymentDto, CreateReservationDto, StripeWebhookDto, PaymentsController

### Community 2 - "MediaService"
Cohesion: 0.08
Nodes (10): multer, @nestjs/platform-express, MediaService, UploadedFile, PresignedUploadDto, ReorderMediaDto, UpdateMediaDto, MediaController (+2 more)

### Community 3 - "totp.ts"
Cohesion: 0.16
Nodes (9): RFC-4226, RFC-6238, base32Decode(), base32Encode(), generateTotp(), generateTotpSecret(), hotp(), totpUri() (+1 more)

### Community 4 - "package.json"
Cohesion: 0.04
Nodes (46): author, description, @types/node, typescript, license, name, private, type (+38 more)

### Community 5 - "api.ts"
Cohesion: 0.08
Nodes (36): CatalogSkeleton(), metadata, Page(), revalidate, CatalogPage(), EMPTY, FilterFields(), Filters (+28 more)

### Community 6 - "AppConfigService"
Cohesion: 0.08
Nodes (21): Blockers, Checkboxes de seguimiento, Decisiones clave, @nestjs/jwt, AppConfigService, AppConfig, Argon2Config, AwsConfig (+13 more)

### Community 7 - "validate_data.py"
Cohesion: 0.06
Nodes (46): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, resolve(), shipped_invocations(), SkillScriptPathsTest (+38 more)

### Community 8 - "app.module.ts"
Cohesion: 0.07
Nodes (14): @nestjs/core, @nestjs/testing, rxjs, supertest, AppModule, globalProviders, RolesGuard, TransformInterceptor (+6 more)

### Community 9 - "web/package.json"
Cohesion: 0.12
Nodes (15): @types/node, typescript, name, private, type, version, clsx, postcss (+7 more)

### Community 10 - "dependencies"
Cohesion: 0.05
Nodes (39): dependencies, argon2, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, cache-manager, class-transformer, class-validator, compression (+31 more)

### Community 11 - "home-page.tsx"
Cohesion: 0.09
Nodes (35): Page(), Page(), revalidate, metadata, Page(), metadata, Page(), dynamic (+27 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (32): scripts, build, deploy, deploy:setup, deploy:update, deploy:verify, desktop:build, desktop:dev (+24 more)

### Community 13 - "layout.tsx"
Cohesion: 0.07
Nodes (36): metadata, archivoBlack, inter, LocaleLayout(), viewport, columns, Footer(), CustomCursor() (+28 more)

### Community 14 - "audit.module.ts"
Cohesion: 0.27
Nodes (4): AuditInterceptorProvider, AuditModule, AuditQuery, AuditService

### Community 15 - "PrismaService"
Cohesion: 0.07
Nodes (5): JwtAuthGuard, RateLimitGuard, PrismaService, RedisService, HealthController

### Community 16 - "desktop/package.json"
Cohesion: 0.06
Nodes (30): author, email, name, description, devDependencies, electron, electron-builder, @types/node (+22 more)

### Community 17 - "ref_node_fs"
Cohesion: 0.10
Nodes (14): dependencies, @opencode-ai/plugin, DIR, LOG, DIR, LOG, seen, DIR (+6 more)

### Community 18 - "vehicle-detail-page.tsx"
Cohesion: 0.19
Nodes (24): 7. Internacionalización (es/en, `next-intl`), Rutas congeladas (Oleada 0 — no renombrar/mover sin actualizar este listado), NotFound(), FeaturedRail(), RailCard(), SplitWords(), Button(), ButtonVariant (+16 more)

### Community 19 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, prettier, prisma (+16 more)

### Community 20 - "core.py"
Cohesion: 0.07
Nodes (23): _contains_phrase(), _domain_keywords(), _exact_match_diagnostic(), _exact_row_identity(), _file_signature(), _legacy_successor_guidance(), _load_csv(), _load_csv_snapshot() (+15 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+11 more)

### Community 23 - "lucide-react"
Cohesion: 0.19
Nodes (11): AccountPage(), dynamic, metadata, EmailVerifyBanner(), LogoutButton(), logout(), ErrorNote(), Skeleton() (+3 more)

### Community 24 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 25 - "@nestjs/swagger"
Cohesion: 0.10
Nodes (12): class-transformer, class-validator, @nestjs/swagger, ROLES_KEY, ApiResponse, PageMeta, PaginatedResponse, AuthenticatedUser (+4 more)

### Community 26 - "reflect-metadata"
Cohesion: 0.19
Nodes (7): @nestjs/event-emitter, reflect-metadata, stripe, CreateCheckoutParams, CreatePaymentIntentParams, StripeService, PaymentsModule

### Community 28 - "route.ts"
Cohesion: 0.15
Nodes (16): ALLOWED, clearCookie(), cookie(), Ctx, DELETE, DROP_REQUEST, DROP_RESPONSE, dynamic (+8 more)

### Community 29 - "seed.ts"
Cohesion: 0.15
Nodes (13): 10. Datos y medios, SeedVehicle, SPEC_CATALOG, SPEC_VALUE_BY_NAME, VEHICLES, Y, main(), prisma (+5 more)

### Community 30 - "make-icon.mjs"
Cohesion: 0.14
Nodes (11): chunk(), crc32(), crcTable, encodePng(), INK, INK_SOFT, out, OUT_DIR (+3 more)

### Community 31 - "main/main.ts"
Cohesion: 0.26
Nodes (8): createWindow(), __dirname, isPortOpen(), resolveAppUrl(), resourcePath(), SERVER_PORT, startBundledServer(), waitForPort()

### Community 32 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, outDir, resolveJsonModule (+7 more)

### Community 34 - "smoke.mjs"
Cohesion: 0.15
Nodes (10): checks, child, data, electron, entry, evaluate(), pending, root (+2 more)

### Community 35 - "design_system.py"
Cohesion: 0.10
Nodes (5): _write_persisted_file(), apply_decision_rules(), format_output(), read_rows(), read_rows()

### Community 36 - "record.mjs"
Cohesion: 0.20
Nodes (10): CDP, findChromium(), FPS, H, main(), PORT, RAW, SECONDS (+2 more)

### Community 37 - "Public"
Cohesion: 0.19
Nodes (3): CacheTTL(), Public(), SearchController

### Community 39 - "next"
Cohesion: 0.19
Nodes (8): Page(), Props, dynamic, robots(), dynamic, sitemap(), resolveSiteUrl(), next

### Community 40 - "test_design_system_mode.py"
Cohesion: 0.08
Nodes (12): _button_outline_text_color(), _contrast_ratio(), _derive_dark_palette(), _filter_anti_patterns_for_mode(), format_master_md(), _query_wants_dark(), _resolve_color_mode(), _select_palette_for_mode() (+4 more)

### Community 41 - "auth-extra.dto.ts"
Cohesion: 0.26
Nodes (6): ForgotPasswordDto, LogoutDto, RefreshTokenDto, ResendVerificationDto, ResetPasswordDto, VerifyEmailDto

### Community 42 - "media.service.ts"
Cohesion: 0.06
Nodes (17): sharp, LeadAssignedEvent, LeadCreatedEvent, LeadNotificationsListener, ALLOWED_3D_MIMES, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES, MediaUploadResult (+9 more)

### Community 43 - "vehicles.repository.ts"
Cohesion: 0.16
Nodes (11): vite-tsconfig-paths, vitest, CursorPaginationResult, SORT_CONFIG, SortKey, summarySelect, VehicleSummary, CursorData (+3 more)

### Community 44 - "@nestjs/common"
Cohesion: 0.09
Nodes (18): express, @nestjs/common, @nestjs/config, CACHE_KEY, CacheConfig, IS_PUBLIC_KEY, THROTTLE_KEY, ThrottleOptions (+10 more)

### Community 48 - "ref_node_path"
Cohesion: 0.15
Nodes (7): __dirname, nextConfig, withNextIntl, child, root, server, standaloneDir

### Community 49 - "setup-debian.sh"
Cohesion: 0.44
Nodes (7): die(), info(), install_pkgs(), need_sudo(), say(), setup-debian.sh script, warn()

### Community 51 - "Memoria del proyecto JC Autoimport"
Cohesion: 0.06
Nodes (30): Comandos utiles, Credenciales iniciales del seed, Despliegue en un portatil Debian, La URL cambia en cada reinicio, Para probarlo desde la red local, Puesta en marcha (5-10 minutos), Que queda expuesto, Requisitos (+22 more)

### Community 53 - "LoginPage"
Cohesion: 0.36
Nodes (7): metadata, Page(), ErrorNote(), LoginPage(), goHome(), onSubmit(), onSubmit2fa()

### Community 54 - "mcp"
Cohesion: 0.22
Nodes (9): command, enabled, type, command, enabled, type, mcp, chrome-devtools (+1 more)

### Community 55 - "permission"
Cohesion: 0.25
Nodes (8): ~/.cache/ms-playwright/**, ~/.local/state/jcautoimport/**, /tmp/opencode/**, permission, edit, external_directory, webfetch, websearch

### Community 56 - "search"
Cohesion: 0.09
Nodes (6): search(), _style_search_destination(), TestDiagnosticsContracts, TestSearchDomains, TestStyleTaxonomy, TestTextLayoutRetrieval

### Community 57 - "SearchQueryDto"
Cohesion: 0.39
Nodes (3): FacetsQueryDto, SearchQueryDto, SuggestionQueryDto

### Community 58 - "render.mjs"
Cohesion: 0.25
Nodes (7): args, fadeOutStart, FPS, H, SECONDS, vf, W

### Community 60 - "search_stack"
Cohesion: 0.11
Nodes (6): _exact_stack_identifier(), search_stack(), _rows(), TestNativeDesktopStackFreshness, _rows(), TestWebStackFreshness

### Community 61 - "bash"
Cohesion: 0.29
Nodes (7): git clean*, git commit*, git push*, git reset --hard*, rm -rf /, sudo *, bash

### Community 62 - "qwen2.5:7b"
Cohesion: 0.29
Nodes (7): qwen2.5:7b, qwen2.5-coder:14b, models, name, tool_call, name, tool_call

### Community 63 - "oxlint.json"
Cohesion: 0.29
Nodes (6): env, node, rules, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises, $schema

### Community 64 - "tsconfig.build.json"
Cohesion: 0.29
Nodes (6): ./tsconfig.json, compilerOptions, rootDir, exclude, extends, include

### Community 65 - "test_catalog_summary_line_endings.py"
Cohesion: 0.08
Nodes (5): CatalogSummaryLineEndingsTest, _load_generator(), TestFixtureValidation, TestMetricMath, TestThresholdGate

### Community 66 - "format_ascii_box"
Cohesion: 0.10
Nodes (11): ansi_ljust(), format_ascii_box(), add_wrapped(), wrap_text(), format_markdown(), generate_design_system(), hex_to_ansi(), _mode_support_labels() (+3 more)

### Community 67 - "verify.sh"
Cohesion: 0.60
Nodes (5): active(), badk(), head1(), okk(), verify.sh script

### Community 68 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 69 - "opencode.json"
Cohesion: 0.29
Nodes (6): experimental, mcp_timeout, instructions, plugin, $schema, small_model

### Community 70 - "after-pack.mjs"
Cohesion: 0.50
Nodes (3): afterPack(), exists(), require

### Community 72 - "BM25"
Cohesion: 0.14
Nodes (5): BM25, _get_bm25(), _suggest_identities(), TestBm25CoreBehavior, TestTokenizer

### Community 73 - "allowScripts"
Cohesion: 0.40
Nodes (5): allowScripts, argon2@0.45.1, esbuild@0.28.2, prisma@7.10.0, @prisma/engines@7.10.0

### Community 74 - "kit-lint.mjs"
Cohesion: 0.13
Nodes (12): hasGraph(), location, server(), setup(), ag, cmd, docs, errs (+4 more)

### Community 75 - "update.sh"
Cohesion: 0.83
Nodes (3): has_systemd(), say(), update.sh script

### Community 76 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.11
Nodes (17): Before Delivering App UI, Example Workflow, If a search returns 0 results, Output Formats, Query Contract, Rule Categories by Priority, Running the search tool, Step 1: Analyze User Requirements (+9 more)

### Community 77 - "postgres"
Cohesion: 0.50
Nodes (4): postgres, command, enabled, type

### Community 78 - "ollama"
Cohesion: 0.50
Nodes (4): options, baseURL, provider, ollama

### Community 79 - "CreateVehicleDto"
Cohesion: 0.19
Nodes (3): CreateVehicleDto, MediaItemDto, SpecificationItemDto

### Community 80 - "AuditInterceptor"
Cohesion: 0.13
Nodes (7): Formato de salida, Qué revisar (checklist), Arquitectura obligatoria (replicar el patrón existente), Patrones a seguir, Proceso, HttpExceptionFilter, AuditInterceptor

### Community 82 - "CreateLeadDto"
Cohesion: 0.19
Nodes (4): AssignLeadDto, CreateLeadDto, LeadQueryDto, UpdateLeadDto

### Community 87 - "Convenciones del proyecto"
Cohesion: 0.12
Nodes (15): Autonomía y permisos (opencode.json), Capacidades web (navegador por CDP), Convenciones del código, Convenciones del proyecto, Documentación y knowledge graph, Estado conocido, Flujo de tests (testing activo), Flujo frontend (web, `apps/web`) (+7 more)

### Community 88 - "DESIGN.md — Contrato visual de JC Autoimport (web) · v2"
Cohesion: 0.13
Nodes (14): 0. Dirección y referencias, 11. Checklist antes de dar por bueno un cambio visual, 1. Identidad, 2. Color (tokens reales, `globals.css`), 3. Tipografía, 4.1 Hero Koenigsegg (home), 4.2 Card Bugatti (catálogo y ficha), 4.3 Footer Lamborghini (global) (+6 more)

### Community 93 - "_palette_is_dark"
Cohesion: 0.18
Nodes (4): _palette_is_dark(), _relative_luminance(), TestEndToEndCoherence, TestLuminance

### Community 97 - "read_rows"
Cohesion: 0.21
Nodes (3): read_rows(), TestGeneratedCatalogContract, TestLandingAndStackContract

### Community 98 - "Pre-Delivery Checklist (canonical — the only one)"
Cohesion: 0.15
Nodes (12): Accessibility, Common Rules for Professional UI + Pre-Delivery Checklist, Icons & Visual Elements, Interaction, Interaction (App), Layout, Layout & Spacing, Light/Dark Mode (+4 more)

### Community 99 - "Quick Reference"
Cohesion: 0.15
Nodes (12): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+4 more)

### Community 101 - "VehiclesService"
Cohesion: 0.27
Nodes (3): VehiclesService, generateVehicleSlug(), slugify()

### Community 103 - "Checklist de contratos"
Cohesion: 0.18
Nodes (10): 1. Rutas principales, 2. Headers, 3. Contrato HTML, 4. Assets y recursos, 5. APIs públicas consumidas por la web, 6. SEO: sitemap.xml y robots.txt, Checklist de contratos, Contexto (+2 more)

### Community 104 - "security-pentester.md"
Cohesion: 0.18
Nodes (10): 1. XSS reflejado (P0 si se refleja sin escapar), 2. Inyección en querystrings de listados/búsqueda, 3. Open redirect, 4. Path traversal en assets, 5. Cabeceras de seguridad, 6. Cookies (si existen `Set-Cookie`), 7. Métodos HTTP, 8. Fuga de información (+2 more)

### Community 107 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, clsx, framer-motion, lucide-react, next, next-intl, react, react-dom (+2 more)

### Community 108 - "Diario — 2026-09-08"
Cohesion: 0.20
Nodes (8): ⚠️ Blockers encontrados, Diario — 2026-09-08, 💡 Ideas / Notas rápidas, 🔥 Lo que hice hoy, 🎯 Mañana / Siguiente paso, 2026-09-08 — Bóvedas Obsidian con sync Git, Bitácora de sesiones, Ver también

### Community 109 - "persist_design_system"
Cohesion: 0.20
Nodes (5): _detect_page_type(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system(), safe_slug()

### Community 110 - "TestReasoningContract"
Cohesion: 0.24
Nodes (4): _object_without_duplicates(), parse_decision_rules(), _validate_action(), TestReasoningContract

### Community 112 - "Roadmap — JC Autoimport"
Cohesion: 0.22
Nodes (8): Convención de este documento, Estado, P0 — Bloqueantes para producción, P1 — Experiencia y contenido, P2 — Automatización y calidad, P3 — Escritorio vs PWA, P4 — Fuera de alcance por ahora, Roadmap — JC Autoimport

### Community 113 - "auto-verify.ts"
Cohesion: 0.22
Nodes (4): DIR, ExecResult, LOG, PkgScripts

### Community 114 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript

### Community 115 - "data-integrity-tester.md"
Cohesion: 0.25
Nodes (7): 1. Coherencia entre vistas, 2. Persistencia de estado, 3. Duplicados, 4. Assets versionados, 5. Concurrencia, 6. BD directa (solo si `$DATABASE_URL` existe), Salida

### Community 116 - "Checklist de edge cases"
Cohesion: 0.25
Nodes (7): 1. Formularios, 2. Buscador y filtros, 3. Rutas y paths, 4. Criterio de errores, Checklist de edge cases, Contexto, Salida

### Community 118 - "lead-form.tsx"
Cohesion: 0.33
Nodes (5): Field(), LeadForm(), State, TYPES, LeadType

### Community 120 - "🏠 JC Autoimport — Dashboard"
Cohesion: 0.29
Nodes (7): ⚠️ Blockers abiertos, 📌 Enlaces útiles, 🔴 Estado actual, 🏠 JC Autoimport — Dashboard, Métricas backend, 🗂️ Navegación, 🔥 Últimos logs

### Community 121 - "Decisión {{001}} — Título"
Cohesion: 0.29
Nodes (6): Consecuencias, Contexto, Decisión, Decisión {{001}} — Título, Opciones, Referencia

### Community 123 - "plan-coordinator.md"
Cohesion: 0.29
Nodes (6): Fase de diagnóstico de tests (para hallazgos del test-coordinator), Mapa de responsables en esta fase, Miembros del consejo (subagentes disponibles), Protocolo de planeación, Protocolo de verificación post-fix, Reglas de estilo

### Community 124 - "resilience-tester.md"
Cohesion: 0.29
Nodes (6): 1. Caché y compresión, 2. Paginación profunda, 3. Concurrencia, 4. Latencia, 5. Fallos del backend (si el sitio consume una API/BD), Salida

### Community 125 - "test-coordinator.md"
Cohesion: 0.29
Nodes (6): Formato del diagnóstico consolidado, Protocolo, Reglas, Sitio bajo prueba, Testers disponibles (subagentes), Áreas a cubrir

### Community 126 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

### Community 127 - "Confirmación de correo al registrarse (2026-10-10)"
Cohesion: 0.40
Nodes (4): resend(), SessionUser, Confirmación de correo al registrarse (2026-10-10), TwoFactorUser

### Community 128 - "Agentes y flujo de trabajo opencode"
Cohesion: 0.33
Nodes (5): Agentes y flujo de trabajo opencode, Directiva de push directo, Flujo de tests (testing activo), Memoria y continuidad, Reglas de seguridad (nunca commitear)

### Community 129 - "Decisión 001 — ESM obligatorio (imports relativos con sufijo `.js`)"
Cohesion: 0.33
Nodes (6): Consecuencias, Contexto, Decisión, Decisión 001 — ESM obligatorio (imports relativos con sufijo `.js`), Opciones, Referencia

### Community 130 - "Diario — {{date}}"
Cohesion: 0.33
Nodes (5): ⚠️ Blockers encontrados, Diario — {{date}}, 💡 Ideas / Notas rápidas, 🔥 Lo que hice hoy, 🎯 Mañana / Siguiente paso

### Community 131 - "Mentor Linux"
Cohesion: 0.33
Nodes (5): Comportamiento, Flujo, Mentor Linux, Principios, Restricciones

### Community 132 - "split_values"
Cohesion: 0.47
Nodes (3): split_values(), style_identities(), TestStyleIdentityContract

### Community 133 - "DESIGN.md - Contrato visual"
Cohesion: 0.40
Nodes (4): Componentes mínimos, DESIGN.md - Contrato visual, Identidad, Reglas

### Community 134 - "Stack tecnológico"
Cohesion: 0.40
Nodes (5): Backend, Convenciones de código (resumen), Detalles de cada decisión, Infra local, Stack tecnológico

### Community 135 - "Estado del backend — JC Autoimport"
Cohesion: 0.40
Nodes (5): Estado: COMPLETO + RUNTIME VALIDADO (2026-09-08), Estado del backend — JC Autoimport, Objetivo, Próximo paso, Stack

### Community 136 - "Backlog"
Cohesion: 0.40
Nodes (5): Backlog, Notas sueltas (Inbox pendiente), P0 — Benchmark a escala, P1 — Preparar despliegue, P2 — Frontend

### Community 137 - "Despliegue"
Cohesion: 0.40
Nodes (5): Checklist de producción, Despliegue, Infra disponible, Pasos generales, Requisitos previos

### Community 138 - "JC Autoimport — Documentación del proyecto"
Cohesion: 0.40
Nodes (4): 📁 Estructura, JC Autoimport — Documentación del proyecto, Migración, 🔒 Regla de oro — contenido

### Community 139 - "data-ops.md"
Cohesion: 0.40
Nodes (4): Proceso, Salida, Según lo que haya en el proyecto, Trampas conocidas

### Community 140 - "web-builder.md"
Cohesion: 0.40
Nodes (4): Antes de escribir una línea, Scope, Trampas conocidas (no tropezar), Verificación antes de terminar

### Community 143 - "Navegar la web con CDP"
Cohesion: 0.40
Nodes (4): Arrancar el navegador CDP, Herramientas MCP disponibles, Navegar la web con CDP, Reglas

### Community 144 - "Vídeo demo del sitio"
Cohesion: 0.40
Nodes (4): Licencias, Pipeline (sin dependencias npm; usa Node + CDP + ffmpeg), Reglas de estilo del clip, Vídeo demo del sitio

### Community 145 - "Design system del proyecto"
Cohesion: 0.40
Nodes (4): Design system del proyecto, Pasos, Reglas duras (genéricas), Verificación obligatoria

### Community 146 - "Trampas caras en proyectos web (no volver a tropezar)"
Cohesion: 0.40
Nodes (4): Frontend / React, Infra / tooling, Next.js standalone, Trampas caras en proyectos web (no volver a tropezar)

### Community 147 - "maquina-check.sh"
Cohesion: 0.70
Nodes (4): bad(), ok(), maquina-check.sh script, warn()

### Community 148 - "Creditos de media (hero)"
Cohesion: 0.50
Nodes (3): Creditos de media (hero), Fondos, Video del hero

### Community 149 - "Índice de decisiones (ADR)"
Cohesion: 0.50
Nodes (3): Convenio, Registro, Índice de decisiones (ADR)

### Community 150 - "abogado-del-diablo.md"
Cohesion: 0.50
Nodes (3): Formato de salida, Lo que examinas, Tu estilo

### Community 151 - "build-verifier.md"
Cohesion: 0.50
Nodes (3): Comandos a ejecutar (en orden), Formato de salida, Reglas

### Community 152 - "db-ops.md"
Cohesion: 0.50
Nodes (3): Estado del proyecto (contexto), Proceso según la tarea, Salida

### Community 153 - "git-committer.md"
Cohesion: 0.50
Nodes (3): Contexto del repo, Proceso, Reglas de seguridad (críticas)

### Community 154 - "memory-keeper.md"
Cohesion: 0.50
Nodes (3): Cómo trabajas, Reglas de escritura, Salida

### Community 155 - "perf-auditor.md"
Cohesion: 0.50
Nodes (3): Qué revisar (API, `src/`), Qué revisar (web, `.`), Salida

### Community 156 - "security-auditor.md"
Cohesion: 0.50
Nodes (3): Checklist de auditoría, Estado del proyecto (contexto), Formato de salida

### Community 157 - "playwright"
Cohesion: 0.50
Nodes (4): playwright, command, enabled, type

## Knowledge Gaps
- **45 isolated node(s):** `@types/node`, `electron-builder`, `typescript`, `@tanstack/react-query`, `@tailwindcss/postcss` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1101 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Seguridad y UX (2026-10-10, commit `2553f94`)` connect `layout.tsx` to `AppConfigService`, `PrismaService`, `vehicle-detail-page.tsx`, `Memoria del proyecto JC Autoimport`, `lucide-react`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `@types/node`, `electron-builder`, `typescript` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PaymentsService` be split into smaller, more focused modules?**
  _Cohesion score 0.08773784355179703 - nodes in this community are weakly interconnected._
- **Why does `next-intl` connect `layout.tsx` to `ref_node_path`, `web/package.json`, `vehicle-detail-page.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `MediaService` be split into smaller, more focused modules?**
  _Cohesion score 0.08418079096045197 - nodes in this community are weakly interconnected._
- **Why does `reflect-metadata` connect `reflect-metadata` to `MediaService`, `package.json`, `AppConfigService`, `app.module.ts`, `media.service.ts`, `vehicles.repository.ts`, `@nestjs/common`, `audit.module.ts`, `PrismaService`, `leads.service.ts`, `@nestjs/swagger`, `seed.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._