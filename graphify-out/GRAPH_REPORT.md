# Graph Report - jcautoimport  (2026-10-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1577 nodes · 3360 edges · 96 communities (66 shown, 30 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 124 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5498dbaa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93

## God Nodes (most connected - your core abstractions)
1. `reflect-metadata` - 64 edges
2. `@nestjs/common` - 63 edges
3. `AppConfigService` - 42 edges
4. `PrismaService` - 41 edges
5. `RedisService` - 36 edges
6. `scripts` - 32 edges
7. `next` - 28 edges
8. `cn()` - 27 edges
9. `Public()` - 24 edges
10. `@nestjs/swagger` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Parallax()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/motion.tsx → apps/web/src/lib/utils.ts
- `Page()` --calls--> `VehicleDetailPage()`  [EXTRACTED]
  apps/web/src/app/vehiculo/[slug]/page.tsx → apps/web/src/components/vehicle-detail-page.tsx
- `MediaController` --references--> `Roles()`  [EXTRACTED]
  src/modules/media/infrastructure/media.controller.ts → src/common/decorators/roles.decorator.ts
- `Page()` --calls--> `HomePage()`  [EXTRACTED]
  apps/web/src/app/page.tsx → apps/web/src/components/home-page.tsx
- `Page()` --calls--> `ProcessPage()`  [EXTRACTED]
  apps/web/src/app/proceso/page.tsx → apps/web/src/components/process-page.tsx

## Import Cycles
- None detected.

## Communities (96 total, 30 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (7): PaymentsService, CancelReservationDto, CreateCheckoutDto, CreatePaymentDto, CreateReservationDto, StripeWebhookDto, PaymentsController

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (7): VehiclesService, CreateVehicleDto, MediaItemDto, SpecificationItemDto, VehiclesController, generateVehicleSlug(), slugify()

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (10): multer, @nestjs/platform-express, MediaService, UploadedFile, PresignedUploadDto, ReorderMediaDto, UpdateMediaDto, MediaController (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (15): RFC-4226, RFC-6238, LeadsService, AssignLeadDto, CreateLeadDto, LeadQueryDto, UpdateLeadDto, LeadsController (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (46): author, description, @types/node, typescript, license, name, private, type (+38 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (37): CatalogSkeleton(), metadata, Page(), revalidate, CatalogPage(), EMPTY, FilterFields(), Filters (+29 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (17): @nestjs/jwt, AppConfigService, AppConfig, Argon2Config, AwsConfig, DatabaseConfig, EncryptionConfig, JwtConfig (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (8): LeadAssignedEvent, LeadCreatedEvent, LeadNotificationsListener, EmailOptions, EmailService, WhatsAppMessage, WhatsAppService, SharedModule

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (14): @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/testing, rxjs, supertest, AppModule, globalProviders (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (38): dependencies, clsx, framer-motion, lucide-react, next, react, react-dom, tailwind-merge (+30 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (39): dependencies, argon2, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, cache-manager, class-transformer, class-validator, compression (+31 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (27): Page(), revalidate, metadata, Page(), HeroVideo(), BRANDS, HomePage(), ORIGINS (+19 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (32): scripts, build, deploy, deploy:setup, deploy:update, deploy:verify, desktop:build, desktop:dev (+24 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (22): metadata, archivoBlack, inter, metadata, RootLayout(), viewport, columns, Footer() (+14 more)

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (4): AuditInterceptorProvider, AuditModule, AuditQuery, AuditService

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (7): express, IS_PUBLIC_KEY, THROTTLE_KEY, ThrottleOptions, ErrorResponse, RateLimitGuard, RedisService

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (27): author, email, name, description, devDependencies, electron, electron-builder, @types/node (+19 more)

### Community 17 - "Community 17"
Cohesion: 0.10
Nodes (14): DIR, ExecResult, LOG, DIR, LOG, DIR, LOG, seen (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (19): FeaturedRail(), RailCard(), Field(), LeadForm(), State, TYPES, SplitWords(), Button() (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (24): devDependencies, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, prettier, prisma (+16 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (15): Page(), metadata, NotFound(), metadata, Page(), dynamic, metadata, Page() (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (4): reflect-metadata, vitest, LeadAssignmentService, LeadsModule

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (19): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (11): AccountPage(), dynamic, metadata, EmailVerifyBanner(), LogoutButton(), logout(), ErrorNote(), Skeleton() (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 25 - "Community 25"
Cohesion: 0.26
Nodes (5): class-validator, @nestjs/swagger, ROLES_KEY, safeUserSelect, UpdateUserRoleDto

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (6): @nestjs/event-emitter, stripe, CreateCheckoutParams, CreatePaymentIntentParams, StripeService, PaymentsModule

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (4): Roles(), AuditController, UsersService, UsersController

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (16): ALLOWED, clearCookie(), cookie(), Ctx, DELETE, DROP_REQUEST, DROP_RESPONSE, dynamic (+8 more)

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (12): SeedVehicle, SPEC_CATALOG, SPEC_VALUE_BY_NAME, VEHICLES, Y, main(), prisma, slugify() (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (11): chunk(), crc32(), crcTable, encodePng(), INK, INK_SOFT, out, OUT_DIR (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (11): createWindow(), __dirname, isPortOpen(), resolveAppUrl(), resourcePath(), SERVER_PORT, startBundledServer(), waitForPort() (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, outDir, resolveJsonModule (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (10): checks, child, data, electron, entry, evaluate(), pending, root (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (10): CDP, findChromium(), FPS, H, main(), PORT, RAW, SECONDS (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.23
Nodes (8): dynamic, robots(), dynamic, sitemap(), Page(), Props, resolveSiteUrl(), next

### Community 40 - "Community 40"
Cohesion: 0.07
Nodes (56): "audit_logs", audit_logs_created_at_idx, audit_logs_entity_entity_id_idx, audit_logs_user_id_idx, "leads", leads_assigned_to_id_idx, leads_created_at_idx, leads_lead_type_idx (+48 more)

### Community 41 - "Community 41"
Cohesion: 0.19
Nodes (8): ForgotPasswordDto, LogoutDto, RefreshTokenDto, ResendVerificationDto, ResetPasswordDto, VerifyEmailDto, TwoFactorCodeDto, TwoFactorVerifyDto

### Community 42 - "Community 42"
Cohesion: 0.11
Nodes (10): sharp, ALLOWED_3D_MIMES, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES, MediaUploadResult, MediaModule, CompressionService, ProcessedImage (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (8): CursorPaginationResult, SORT_CONFIG, SortKey, summarySelect, VehicleSummary, decodeCursor(), encodeCursor(), KEY

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (6): FacetsResponse, SearchResponse, SearchResult, SearchRow, SuggestionItem, SearchModule

### Community 45 - "Community 45"
Cohesion: 0.37
Nodes (3): Public(), Throttle(), AuthController

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (6): __dirname, nextConfig, child, root, server, standaloneDir

### Community 49 - "Community 49"
Cohesion: 0.38
Nodes (7): die(), info(), install_pkgs(), need_sudo(), say(), setup-debian.sh script, warn()

### Community 51 - "Community 51"
Cohesion: 0.13
Nodes (3): PrismaService, TwoFactorService, EncryptionService

### Community 53 - "Community 53"
Cohesion: 0.36
Nodes (7): metadata, Page(), ErrorNote(), LoginPage(), goHome(), onSubmit(), onSubmit2fa()

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (9): command, enabled, type, mcp, chrome-devtools, playwright, command, enabled (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (9): ~/.cache/ms-playwright/**, ~/Documentos/Obsidian/**, ~/.local/state/jcautoimport/**, /tmp/opencode/**, permission, edit, external_directory, webfetch (+1 more)

### Community 56 - "Community 56"
Cohesion: 0.39
Nodes (3): CACHE_KEY, CacheConfig, RedisCacheInterceptor

### Community 57 - "Community 57"
Cohesion: 0.39
Nodes (3): FacetsQueryDto, SearchQueryDto, SuggestionQueryDto

### Community 58 - "Community 58"
Cohesion: 0.18
Nodes (7): args, fadeOutStart, FPS, H, SECONDS, vf, W

### Community 59 - "Community 59"
Cohesion: 0.14
Nodes (4): ApiResponse, PageMeta, PaginatedResponse, PaginationQueryDto

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (7): git clean*, git commit*, git push*, git reset --hard*, rm -rf /, sudo *, bash

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (7): qwen2.5:7b, qwen2.5-coder:14b, models, name, tool_call, name, tool_call

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (6): env, node, rules, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises, $schema

### Community 64 - "Community 64"
Cohesion: 0.29
Nodes (6): ./tsconfig.json, compilerOptions, rootDir, exclude, extends, include

### Community 67 - "Community 67"
Cohesion: 0.60
Nodes (5): active(), badk(), head1(), okk(), verify.sh script

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (5): experimental, mcp_timeout, instructions, $schema, small_model

### Community 70 - "Community 70"
Cohesion: 0.50
Nodes (3): afterPack(), exists(), require

### Community 71 - "Community 71"
Cohesion: 0.25
Nodes (4): CurrentUser, AuthenticatedUser, JwtPayload, JwtRequest

### Community 73 - "Community 73"
Cohesion: 0.40
Nodes (5): allowScripts, argon2@0.45.1, esbuild@0.28.2, prisma@7.10.0, @prisma/engines@7.10.0

### Community 75 - "Community 75"
Cohesion: 0.83
Nodes (3): has_systemd(), say(), update.sh script

### Community 76 - "Community 76"
Cohesion: 0.50
Nodes (4): command, enabled, type, context7

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (4): postgres, command, enabled, type

### Community 78 - "Community 78"
Cohesion: 0.50
Nodes (4): options, baseURL, provider, ollama

## Knowledge Gaps
- **45 isolated node(s):** `@types/node`, `typescript`, `electron-builder`, `@types/node`, `typescript` (+40 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 690 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `reflect-metadata` connect `Community 21` to `Community 2`, `Community 35`, `Community 4`, `Community 6`, `Community 71`, `Community 8`, `Community 41`, `Community 7`, `Community 42`, `Community 44`, `Community 43`, `Community 14`, `Community 15`, `Community 93`, `Community 56`, `Community 25`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `@types/node`, `typescript`, `electron-builder` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07712765957446809 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `Community 8` to `Community 2`, `Community 35`, `Community 4`, `Community 6`, `Community 71`, `Community 7`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 14`, `Community 15`, `Community 21`, `Community 56`, `Community 25`, `Community 26`, `Community 93`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06766917293233082 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Community 12` to `Community 4`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08418079096045197 - nodes in this community are weakly interconnected._