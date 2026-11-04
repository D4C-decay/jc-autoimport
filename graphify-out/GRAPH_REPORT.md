# Graph Report - jc-autoimport  (2026-11-02)

## Corpus Check
- 323 files · ~892,510 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 55 file(s) not represented in the graph (top: .csv 37, (none) 9, .service 3)

## Summary
- 2819 nodes · 5241 edges · 185 communities (141 shown, 44 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 192 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10e7ea54`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CurrentUser
- VehiclesController
- MediaService
- GlassSurface.tsx
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
- reflect-metadata
- PrismaService
- desktop/package.json
- ref_node_fs
- vehicle-detail-page.tsx
- devDependencies
- core.py
- MagicBento.tsx
- compilerOptions
- createClient
- compilerOptions
- @nestjs/common
- WarmTooltip.tsx
- UsersController
- route.ts
- seed.ts
- make-icon.mjs
- main/main.ts
- compilerOptions
- LoggerService
- smoke.mjs
- test_data_contracts.py
- record.mjs
- Public
- GlassIcons.tsx
- api
- design_system.py
- LogoLoop.tsx
- media.service.ts
- search.service.ts
- next
- auth.service.ts
- VehiclesRepository
- VehicleFilterDto
- ref_node_path
- setup-debian.sh
- api.ts
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
- csv
- SplitFlapText.tsx
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
- Antigravity.tsx
- launch-smoke.sh
- globals.d.ts
- postcss.config.mjs
- Convenciones del proyecto
- InfiniteMenu.tsx
- TechText.tsx
- DecryptedText.tsx
- chrome-debug.sh
- mcp-postgres.sh
- _palette_is_dark
- CatalogRefreshTest
- detect_domain
- DesignSystemGenerator
- read_rows
- Pre-Delivery Checklist (canonical — the only one)
- Quick Reference
- SupabaseAdminService
- VehiclesService
- .generate
- Checklist de contratos
- security-pentester.md
- AnimatedList.tsx
- LeadsService
- dependencies
- Diario — 2026-09-08
- RippleDistortion.tsx
- Stepper.tsx
- AuditController
- Roadmap — JC Autoimport
- auto-verify.ts
- devDependencies
- data-integrity-tester.md
- Checklist de edge cases
- CreateReservationDto
- CometDial.tsx
- Home.md
- 🏠 JC Autoimport — Dashboard
- Decisión {{001}} — Título
- GlowCursor.tsx
- plan-coordinator.md
- resilience-tester.md
- SpecularButton.tsx
- scripts
- jwt-auth.guard.spec.ts
- Agentes y flujo de trabajo opencode
- Decisión 001 — ESM obligatorio (imports relativos con sufijo `.js`)
- Diario — {{date}}
- Mentor Linux
- split_values
- DESIGN.md - Contrato visual
- Stack tecnológico
- PaymentsService
- Backlog
- Despliegue
- JC Autoimport — Documentación del proyecto
- data-ops.md
- web-builder.md
- TestStackFlagWithDesignSystem
- GradualBlur.tsx
- Navegar la web con CDP
- Vídeo demo del sitio
- Design system del proyecto
- Trampas caras en proyectos web (no volver a tropezar)
- maquina-check.sh
- Creditos de media (hero)
- Decisión 002 — Supabase Auth como proveedor de identidad
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
- JellyRadio.tsx
- ScrollVelocity.tsx
- DepthCarousel.tsx
- ScrollStack.tsx
- MagicBento
- ChromaGrid.tsx
- _select_palette_for_mode
- TestThresholdGate
- pagination.dto.ts

## God Nodes (most connected - your core abstractions)
1. `reflect-metadata` - 64 edges
2. `@nestjs/common` - 62 edges
3. `react` - 45 edges
4. `search()` - 43 edges
5. `PrismaService` - 40 edges
6. `DesignSystemGenerator` - 38 edges
7. `AppConfigService` - 37 edges
8. `search_stack()` - 35 edges
9. `scripts` - 32 edges
10. `RedisService` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Carrusel continuo (N+1) y paleta de marca (2026-09-28)` --references--> `FeaturedRail()`  [INFERRED]
  MEMORY.md → apps/web/src/components/featured-rail.tsx
- `Interaction (App)` --references--> `Button()`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/references/pro-rules.md → apps/web/src/components/ui.tsx
- `Rediseño visual del home y catálogo (2026-09-28, commit `e4bba16`)` --references--> `FilterFields()`  [INFERRED]
  MEMORY.md → apps/web/src/components/catalog-page.tsx
- `Seguridad` --references--> `logout()`  [INFERRED]
  deploy/README.md → apps/web/src/components/logout-button.tsx
- `Hero 1080p y rediseño del cuerpo de la home (2026-10-10, commit `1fc09e4`)` --references--> `Reveal()`  [INFERRED]
  MEMORY.md → apps/web/src/components/motion.tsx

## Import Cycles
- None detected.

## Communities (185 total, 44 thin omitted)

### Community 2 - "MediaService"
Cohesion: 0.11
Nodes (4): MediaService, UploadedFile, MediaController, StorageService

### Community 3 - "GlassSurface.tsx"
Cohesion: 0.10
Nodes (31): bendShape(), blurGrid(), blurLine(), CachedTrace, CHANNELS, compileGlass(), contentBox(), distanceGrid() (+23 more)

### Community 4 - "package.json"
Cohesion: 0.04
Nodes (49): author, description, @supabase/supabase-js, @types/node, typescript, license, name, prisma (+41 more)

### Community 5 - "api.ts"
Cohesion: 0.07
Nodes (34): CatalogSkeleton(), metadata, Page(), revalidate, CatalogPage(), EMPTY, FilterFields(), Filters (+26 more)

### Community 6 - "AppConfigService"
Cohesion: 0.08
Nodes (21): Decisiones clave, ioredis, @nestjs/config, @nestjs/event-emitter, stripe, AppConfigService, AppConfig, Argon2Config (+13 more)

### Community 7 - "validate_data.py"
Cohesion: 0.06
Nodes (44): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, TestGeneratedCatalogContract, _catalog_date(), _check_app_interface_contract() (+36 more)

### Community 8 - "app.module.ts"
Cohesion: 0.06
Nodes (16): compression, helmet, @nestjs/core, @nestjs/testing, pino, rxjs, supertest, AppModule (+8 more)

### Community 9 - "web/package.json"
Cohesion: 0.12
Nodes (16): @supabase/supabase-js, @types/node, typescript, name, private, type, version, clsx (+8 more)

### Community 10 - "dependencies"
Cohesion: 0.05
Nodes (41): dependencies, argon2, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, cache-manager, class-transformer, class-validator, compression (+33 more)

### Community 11 - "home-page.tsx"
Cohesion: 0.09
Nodes (35): Page(), Page(), revalidate, metadata, Page(), dynamic, metadata, Page() (+27 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (32): scripts, build, deploy, deploy:setup, deploy:update, deploy:verify, desktop:build, desktop:dev (+24 more)

### Community 13 - "layout.tsx"
Cohesion: 0.10
Nodes (25): metadata, archivoBlack, inter, viewport, columns, Footer(), links, Wordmark() (+17 more)

### Community 14 - "reflect-metadata"
Cohesion: 0.06
Nodes (16): reflect-metadata, PrismaService, AuditInterceptorProvider, AuditModule, AuditQuery, AuditService, LeadAssignmentService, LeadAssignedEvent (+8 more)

### Community 15 - "PrismaService"
Cohesion: 0.09
Nodes (6): CACHE_KEY, CacheConfig, RateLimitGuard, RedisCacheInterceptor, RedisService, HealthController

### Community 16 - "desktop/package.json"
Cohesion: 0.07
Nodes (27): author, email, name, description, devDependencies, electron, electron-builder, @types/node (+19 more)

### Community 17 - "ref_node_fs"
Cohesion: 0.09
Nodes (15): dependencies, @opencode-ai/plugin, DIR, LOG, DIR, LOG, seen, DIR (+7 more)

### Community 18 - "vehicle-detail-page.tsx"
Cohesion: 0.12
Nodes (31): NotFound(), Page(), Props, FeaturedRail(), RailCard(), Field(), LeadForm(), State (+23 more)

### Community 19 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, prettier, prisma (+16 more)

### Community 20 - "core.py"
Cohesion: 0.08
Nodes (22): _contains_phrase(), _domain_keywords(), _exact_match_diagnostic(), _exact_row_identity(), _file_signature(), _get_bm25(), _legacy_successor_guidance(), _load_csv() (+14 more)

### Community 21 - "MagicBento.tsx"
Cohesion: 0.07
Nodes (22): APPS, BARS, BORDER_STYLE, CardState, CHART, DEFAULT_ITEMS, FALLOFF, FLOW (+14 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+11 more)

### Community 23 - "createClient"
Cohesion: 0.09
Nodes (38): AccountPage(), dynamic, metadata, metadata, Page(), metadata, Page(), dynamic (+30 more)

### Community 24 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 25 - "@nestjs/common"
Cohesion: 0.08
Nodes (20): class-validator, express, @nestjs/common, @nestjs/swagger, IS_PUBLIC_KEY, Public(), ROLES_KEY, Throttle() (+12 more)

### Community 26 - "WarmTooltip.tsx"
Cohesion: 0.09
Nodes (29): anchorOf(), clamp(), EASE_OUT, GroupApi, GroupContext, GroupState, horizontal(), LAYER (+21 more)

### Community 28 - "route.ts"
Cohesion: 0.15
Nodes (11): ALLOWED, Ctx, DELETE, DROP_REQUEST, DROP_RESPONSE, dynamic, GET, PATCH (+3 more)

### Community 29 - "seed.ts"
Cohesion: 0.06
Nodes (37): 0. Dirección y referencias, 10. Datos y medios, 11. Checklist antes de dar por bueno un cambio visual, 1. Identidad, 2. Color (tokens reales, `globals.css`), 3. Tipografía, 4.1 Hero Koenigsegg (home), 4.2 Card Bugatti (catálogo y ficha) (+29 more)

### Community 30 - "make-icon.mjs"
Cohesion: 0.14
Nodes (11): chunk(), crc32(), crcTable, encodePng(), INK, INK_SOFT, out, OUT_DIR (+3 more)

### Community 31 - "main/main.ts"
Cohesion: 0.17
Nodes (11): createWindow(), __dirname, isPortOpen(), resolveAppUrl(), resourcePath(), SERVER_PORT, startBundledServer(), waitForPort() (+3 more)

### Community 32 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, outDir, resolveJsonModule (+7 more)

### Community 34 - "smoke.mjs"
Cohesion: 0.15
Nodes (10): checks, child, data, electron, entry, evaluate(), pending, root (+2 more)

### Community 35 - "test_data_contracts.py"
Cohesion: 0.22
Nodes (4): apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), _validate_action()

### Community 36 - "record.mjs"
Cohesion: 0.20
Nodes (10): CDP, findChromium(), FPS, H, main(), PORT, RAW, SECONDS (+2 more)

### Community 37 - "Public"
Cohesion: 0.18
Nodes (3): CacheTTL(), SearchService, SearchController

### Community 38 - "GlassIcons.tsx"
Cohesion: 0.10
Nodes (28): buildMaps(), clamp(), compile(), drive(), ease(), Engine, fade(), GlassIcons() (+20 more)

### Community 39 - "api"
Cohesion: 0.13
Nodes (14): dynamic, robots(), dynamic, sitemap(), api, resolveSiteUrl(), La URL cambia en cada reinicio, Despliegue reproducible en portatil Debian (2026-09-28) (+6 more)

### Community 40 - "design_system.py"
Cohesion: 0.04
Nodes (28): ansi_ljust(), _button_outline_text_color(), _contrast_ratio(), _derive_dark_palette(), _detect_page_type(), _filter_anti_patterns_for_mode(), format_ascii_box(), add_wrapped() (+20 more)

### Community 41 - "LogoLoop.tsx"
Cohesion: 0.12
Nodes (25): FooterLogoLoop(), slug(), clamp(), createEngine(), cx(), Drag, easeInOut(), easeOut() (+17 more)

### Community 42 - "media.service.ts"
Cohesion: 0.09
Nodes (15): multer, @nestjs/platform-express, sharp, ALLOWED_3D_MIMES, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES, MediaUploadResult, PresignedUploadDto (+7 more)

### Community 43 - "search.service.ts"
Cohesion: 0.09
Nodes (17): class-transformer, FacetsResponse, SearchResponse, SearchResult, SearchRow, SuggestionItem, SearchModule, CursorPaginationResult (+9 more)

### Community 44 - "next"
Cohesion: 0.14
Nodes (19): GET(), OTP_TYPES, PendingCookie, safeNext(), BrowserClient, SUPABASE_ANON_KEY, SUPABASE_URL, copyCookies() (+11 more)

### Community 45 - "auth.service.ts"
Cohesion: 0.16
Nodes (4): AuthModule, AuthService, Profile, AuthController

### Community 48 - "ref_node_path"
Cohesion: 0.14
Nodes (8): __dirname, nextConfig, supabaseUrl, withNextIntl, child, root, server, standaloneDir

### Community 49 - "setup-debian.sh"
Cohesion: 0.44
Nodes (7): die(), info(), install_pkgs(), need_sudo(), say(), setup-debian.sh script, warn()

### Community 50 - "api.ts"
Cohesion: 0.11
Nodes (23): authHeader(), baseUrl(), DriveType, Envelope, Facet, MediaItem, Paginated, request() (+15 more)

### Community 51 - "Memoria del proyecto JC Autoimport"
Cohesion: 0.05
Nodes (36): LocaleLayout(), CustomCursor(), Comandos utiles, Credenciales iniciales del seed, Despliegue en un portatil Debian, Para probarlo desde la red local, Puesta en marcha (5-10 minutos), Que queda expuesto (+28 more)

### Community 53 - "LoginPage"
Cohesion: 0.24
Nodes (10): dynamic, metadata, Page(), authMessage(), ErrorNote(), LoginPage(), goNext(), onSubmit() (+2 more)

### Community 54 - "mcp"
Cohesion: 0.22
Nodes (9): command, enabled, type, command, enabled, type, mcp, chrome-devtools (+1 more)

### Community 55 - "permission"
Cohesion: 0.25
Nodes (8): ~/.cache/ms-playwright/**, ~/.local/state/jcautoimport/**, /tmp/opencode/**, permission, edit, external_directory, webfetch, websearch

### Community 56 - "search"
Cohesion: 0.10
Nodes (6): _project_row(), search(), _style_search_destination(), TestSearchDomains, TestStyleTaxonomy, TestTextLayoutRetrieval

### Community 57 - "SearchQueryDto"
Cohesion: 0.39
Nodes (3): FacetsQueryDto, SearchQueryDto, SuggestionQueryDto

### Community 58 - "render.mjs"
Cohesion: 0.25
Nodes (7): args, fadeOutStart, FPS, H, SECONDS, vf, W

### Community 60 - "search_stack"
Cohesion: 0.09
Nodes (7): _exact_stack_identifier(), search_stack(), _valid_max_results(), _rows(), TestNativeDesktopStackFreshness, _rows(), TestWebStackFreshness

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

### Community 65 - "csv"
Cohesion: 0.06
Nodes (10): CatalogSummaryLineEndingsTest, _load_generator(), TestFixtureValidation, TestMetricMath, resolve(), shipped_invocations(), SkillScriptPathsTest, read_rows() (+2 more)

### Community 66 - "SplitFlapText.tsx"
Cohesion: 0.12
Nodes (23): AnimationPlan, buildSequence(), cascadeStep(), CHARSETS, clampUnit(), createTiles(), DEFAULT_WORDS, getReducedMotion() (+15 more)

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
Nodes (4): BM25, _suggest_identities(), TestBm25CoreBehavior, TestTokenizer

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
Nodes (8): VehicleStatus, Formato de salida, Qué revisar (checklist), Arquitectura obligatoria (replicar el patrón existente), Patrones a seguir, Proceso, HttpExceptionFilter, AuditInterceptor

### Community 82 - "CreateLeadDto"
Cohesion: 0.19
Nodes (4): AssignLeadDto, CreateLeadDto, LeadQueryDto, UpdateLeadDto

### Community 83 - "Antigravity.tsx"
Cohesion: 0.16
Nodes (20): Antigravity(), AntigravityProps, buildPalette(), clamp(), COLOR_MODES, ColorMode, compile(), DEFAULT_COLORS (+12 more)

### Community 87 - "Convenciones del proyecto"
Cohesion: 0.12
Nodes (15): Autonomía y permisos (opencode.json), Capacidades web (navegador por CDP), Convenciones del código, Convenciones del proyecto, Documentación y knowledge graph, Estado conocido, Flujo de tests (testing activo), Flujo frontend (web, `apps/web`) (+7 more)

### Community 88 - "InfiniteMenu.tsx"
Cohesion: 0.20
Nodes (17): ArrowIcon(), clamp(), compile(), cross(), dot(), Engine, FRONT, InfiniteMenu() (+9 more)

### Community 89 - "TechText.tsx"
Cohesion: 0.15
Nodes (17): approach(), Art, Band, Box, Cell, clamp01(), Glyph, Kick (+9 more)

### Community 90 - "DecryptedText.tsx"
Cohesion: 0.17
Nodes (15): advance(), DecryptedText(), DecryptedTextProps, Engine, flipFrames(), FontMetrics, Frame, glyphWidths (+7 more)

### Community 93 - "_palette_is_dark"
Cohesion: 0.18
Nodes (4): _palette_is_dark(), _relative_luminance(), TestEndToEndCoherence, TestLuminance

### Community 95 - "detect_domain"
Cohesion: 0.17
Nodes (3): detect_domain(), TestDiagnosticsContracts, TestDomainDetection

### Community 97 - "read_rows"
Cohesion: 0.19
Nodes (3): read_rows(), TestLandingAndStackContract, TestReasoningContract

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

### Community 105 - "AnimatedList.tsx"
Cohesion: 0.15
Nodes (13): AnimatedList(), AnimatedListEntry, AnimatedListItem, AnimatedListProps, Animation, DEFAULT_ITEMS, Engine, FADE_MASK (+5 more)

### Community 107 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, clsx, framer-motion, gsap, @hugeicons/core-free-icons, @hugeicons/react, lucide-react, next (+8 more)

### Community 108 - "Diario — 2026-09-08"
Cohesion: 0.20
Nodes (8): ⚠️ Blockers encontrados, Diario — 2026-09-08, 💡 Ideas / Notas rápidas, 🔥 Lo que hice hoy, 🎯 Mañana / Siguiente paso, 2026-09-08 — Bóvedas Obsidian con sync Git, Bitácora de sesiones, Ver también

### Community 109 - "RippleDistortion.tsx"
Cohesion: 0.15
Nodes (14): CompositeUniforms, hexToRGB(), LIFE_CONSTANT, QUALITY_SCALE, RippleDistortion(), RippleDistortionProps, RippleQuality, RippleTrigger (+6 more)

### Community 110 - "Stepper.tsx"
Cohesion: 0.18
Nodes (13): Check(), clamp(), ease(), readableOn(), size(), StepIndicatorProps, Stepper(), StepperProps (+5 more)

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

### Community 117 - "CreateReservationDto"
Cohesion: 0.27
Nodes (5): CancelReservationDto, CreateCheckoutDto, CreatePaymentDto, CreateReservationDto, StripeWebhookDto

### Community 118 - "CometDial.tsx"
Cohesion: 0.23
Nodes (12): arcPath(), clamp(), CometDial(), CometDialChangeDetail, CometDialProps, decimalsOf(), Grip, Live (+4 more)

### Community 120 - "🏠 JC Autoimport — Dashboard"
Cohesion: 0.29
Nodes (7): ⚠️ Blockers abiertos, 📌 Enlaces útiles, 🔴 Estado actual, 🏠 JC Autoimport — Dashboard, Métricas backend, 🗂️ Navegación, 🔥 Últimos logs

### Community 121 - "Decisión {{001}} — Título"
Cohesion: 0.29
Nodes (6): Consecuencias, Contexto, Decisión, Decisión {{001}} — Título, Opciones, Referencia

### Community 122 - "GlowCursor.tsx"
Cohesion: 0.21
Nodes (12): clamp(), compile(), fromHsv(), GlowCursor(), GlowCursorProps, Pair, Pass, Quality (+4 more)

### Community 123 - "plan-coordinator.md"
Cohesion: 0.29
Nodes (6): Fase de diagnóstico de tests (para hallazgos del test-coordinator), Mapa de responsables en esta fase, Miembros del consejo (subagentes disponibles), Protocolo de planeación, Protocolo de verificación post-fix, Reglas de estilo

### Community 124 - "resilience-tester.md"
Cohesion: 0.29
Nodes (6): 1. Caché y compresión, 2. Paginación profunda, 3. Concurrencia, 4. Latencia, 5. Fallos del backend (si el sitio consume una API/BD), Salida

### Community 125 - "SpecularButton.tsx"
Cohesion: 0.26
Nodes (12): clamp(), compile(), link(), loopPosition(), rimPoint(), Settings, SIZES, SpecularButton() (+4 more)

### Community 126 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

### Community 127 - "jwt-auth.guard.spec.ts"
Cohesion: 0.21
Nodes (4): jose, JwtAuthGuard, boot(), localUser

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

### Community 142 - "GradualBlur.tsx"
Cohesion: 0.25
Nodes (10): clamp01(), CURVES, DIRECTIONS, findScroller(), GradualBlur(), GradualBlurCurve, GradualBlurPosition, GradualBlurProps (+2 more)

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

### Community 149 - "Decisión 002 — Supabase Auth como proveedor de identidad"
Cohesion: 0.18
Nodes (9): Consecuencias, Contexto, Decisión, Decisión 002 — Supabase Auth como proveedor de identidad, Opciones, Referencia, Convenio, Registro (+1 more)

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

### Community 176 - "JellyRadio.tsx"
Cohesion: 0.22
Nodes (10): Chip, ChipProps, ChipValues, Config, DEFAULT_ITEMS, JellyRadio(), JellyRadioItem, JellyRadioProps (+2 more)

### Community 177 - "ScrollVelocity.tsx"
Cohesion: 0.24
Nodes (9): FADE_STEPS, OUTLINE_STYLE, ScrollVelocity(), ScrollVelocityProps, useElementWidth(), VelocityMapping, VelocityText(), VelocityTextProps (+1 more)

### Community 178 - "DepthCarousel.tsx"
Cohesion: 0.24
Nodes (9): CarouselConfig, clamp(), DEFAULT_ITEMS, DepthCarousel(), DepthCarouselItem, DepthCarouselProps, DragState, normalizeItem() (+1 more)

### Community 179 - "ScrollStack.tsx"
Cohesion: 0.27
Nodes (8): CARD_SHADOW, resolveOffset(), scrollsInside(), ScrollStack(), ScrollStackItemProps, ScrollStackProps, StackSettings, toLength()

### Community 180 - "MagicBento"
Cohesion: 0.28
Nodes (9): AnalyticsVisual(), clamp(), curve(), finite(), inkFor(), MagicBento(), nameOf(), parseRgb() (+1 more)

### Community 181 - "ChromaGrid.tsx"
Cohesion: 0.36
Nodes (7): ChromaGrid(), ChromaGridProps, ChromaItem, clamp(), DEFAULT_ITEMS, falloffStops(), THEMES

### Community 184 - "pagination.dto.ts"
Cohesion: 0.33
Nodes (3): ApiResponse, PageMeta, PaginatedResponse

## Knowledge Gaps
- **47 isolated node(s):** `@types/node`, `electron-builder`, `typescript`, `@supabase/supabase-js`, `@tanstack/react-query` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1335 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `home-page.tsx` to `GlassSurface.tsx`, `api.ts`, `web/package.json`, `layout.tsx`, `GradualBlur.tsx`, `vehicle-detail-page.tsx`, `MagicBento.tsx`, `createClient`, `WarmTooltip.tsx`, `GlassIcons.tsx`, `LogoLoop.tsx`, `JellyRadio.tsx`, `ScrollVelocity.tsx`, `DepthCarousel.tsx`, `ScrollStack.tsx`, `ChromaGrid.tsx`, `SplitFlapText.tsx`, `Antigravity.tsx`, `InfiniteMenu.tsx`, `TechText.tsx`, `DecryptedText.tsx`, `AnimatedList.tsx`, `RippleDistortion.tsx`, `Stepper.tsx`, `CometDial.tsx`, `GlowCursor.tsx`, `SpecularButton.tsx`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **What connects `@types/node`, `electron-builder`, `typescript` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MediaService` be split into smaller, more focused modules?**
  _Cohesion score 0.10884353741496598 - nodes in this community are weakly interconnected._
- **Why does `reflect-metadata` connect `reflect-metadata` to `package.json`, `AppConfigService`, `app.module.ts`, `media.service.ts`, `search.service.ts`, `auth.service.ts`, `PrismaService`, `@nestjs/common`, `seed.ts`, `jwt-auth.guard.spec.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `GlassSurface.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09879032258064516 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.03991291727140784 - nodes in this community are weakly interconnected._