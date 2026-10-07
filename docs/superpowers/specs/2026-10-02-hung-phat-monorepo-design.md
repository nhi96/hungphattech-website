# Hưng Phát Monorepo Architecture

## Objective

Reorganize the current Hưng Phát website into a workspace monorepo with clear ownership boundaries and a shared data contract. Preserve all current behavior, content, URLs, editor workflows, and the local development address.

The repository remains one deployable Next.js application for now. New applications such as a worker or a standalone admin are added only when they need independent deployment or scaling.

## Why This Shape

The current system is a small Next.js application containing:

- Public website routes and components.
- A local content editor.
- Admin route handlers.
- Zod content schemas and API response shapes.
- File-based draft, published, history, and image storage.

Splitting these responsibilities into separate repositories now would add network contracts, authentication, CORS, deployment, and synchronization work without an operational requirement. A workspace monorepo provides the important benefit from the proposed architecture: agents and developers can work within explicit boundaries, while the system still runs as one application.

## Target Structure

```text
hungphat/
├── apps/
│   └── web/
│       ├── src/app/                 # Public, admin, preview, and API routes
│       ├── src/components/          # Web-only React components
│       ├── src/config/              # Web runtime configuration
│       ├── src/data/                # Static catalog/demo data
│       ├── public/                  # Static assets and uploaded images
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       └── tsconfig.json
├── packages/
│   ├── contracts/
│   │   └── src/                     # Zod schemas, inferred types, API envelopes
│   ├── content-core/
│   │   └── src/                     # Content use cases, revisions, repository ports
│   └── storage-file/
│       └── src/                     # JSON persistence and Sharp image storage
├── data/
│   └── content/
│       ├── default-content.json
│       ├── draft.json
│       ├── published.json
│       └── history/
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
│   └── architecture/
├── package.json                     # Workspace scripts and shared tooling
└── package-lock.json
```

## Package Ownership

### `apps/web`

Owns HTTP and UI concerns:

- Next.js routes, layouts, pages, metadata, and cache revalidation.
- Public website components.
- Admin editor and preview UI.
- Route handlers that authenticate, parse requests, call use cases, and map results to HTTP responses.
- Runtime path configuration passed into storage adapters.

It must not define duplicate content schemas or implement persistence logic.

Only server modules may import `@hungphat/storage-file`. Client component dependency graphs must stop at contracts and browser-safe web modules.

### `packages/contracts`

Acts as the single source of truth:

- Site content schema.
- Draft and published envelope schemas.
- Asset records.
- Admin API request and response schemas.
- Shared error codes.
- Types inferred directly from Zod schemas.

The web app, content package, storage package, and tests import these definitions rather than recreating object shapes.

### `packages/content-core`

Owns application behavior independent of Next.js and the filesystem:

- Read published content.
- Read and save drafts.
- Publish and reset content.
- Revision conflict rules.
- Content and asset-reference validation.
- Repository interfaces used by the application.

This package must not import `next/*`, React, `node:fs`, or Sharp.

### `packages/storage-file`

Implements infrastructure concerns:

- Atomic JSON reads and writes.
- Transaction recovery.
- History snapshots and pruning.
- File-based write serialization.
- Image validation and WebP conversion with Sharp.

All storage roots are constructor options. The package must not infer application paths from its own `process.cwd()`.

## Public Package APIs

Each package exposes only documented entry points through its `package.json` `exports` field:

- `@hungphat/contracts`
- `@hungphat/content-core`
- `@hungphat/storage-file`

Cross-package deep imports into `src/` are forbidden. Package internals may change without affecting consumers. An architecture test and ESLint restricted-import rules enforce dependency direction, prevent deep imports, and prevent client modules from importing the server-only storage package.

## Dependency Direction

```text
apps/web
  ├── packages/contracts
  ├── packages/content-core
  └── packages/storage-file

packages/content-core
  └── packages/contracts

packages/storage-file
  ├── packages/contracts
  └── packages/content-core
```

Packages may not import from `apps/web`. Cyclic package dependencies are not allowed.

## Data Flow

### Public content

1. A server page requests published content.
2. `apps/web` invokes a content-core use case.
3. Content-core reads through its repository interface.
4. Storage-file loads and validates JSON with contracts.
5. The validated `SiteContent` is returned to the page.

### Admin save and publish

1. The editor submits a request conforming to a contracts schema.
2. The route handler verifies local editor access.
3. The route handler parses the request with the shared contract.
4. Content-core enforces revision and publishing rules.
5. Storage-file performs atomic persistence.
6. The route handler returns a response envelope defined by contracts.
7. Next.js cache revalidation remains in the route handler.

### Image upload

1. The route handler authenticates and reads multipart data.
2. Storage-file validates and converts the image.
3. It writes the image under `apps/web/public/uploads` using a root path supplied by web runtime configuration.
4. It returns an `AssetRecord` defined by contracts.
5. The editor includes the asset record in the next draft save.

The `/uploads/...` URL format remains unchanged.

## Runtime Paths

`apps/web` owns a server-only runtime-path module that resolves:

- Monorepo root.
- `data/content`.
- `apps/web/public/uploads`.

Resolved absolute paths are passed into storage constructors. Tests pass temporary directories directly.

The runtime-path module is introduced before the application directory moves. During the workspace-shell migration the content root continues pointing to the existing root `.content`. The upload root changes to `apps/web/public/uploads` as part of the Phase 1 static-asset relocation, because Next.js serves the `public` directory belonging to the relocated app. The later controlled content cutover changes only the content root.

## Workspace Tooling

- Use npm workspaces declared in the root `package.json`.
- Preserve root commands such as `npm run dev`, `npm run build`, and `npm test`.
- Root commands delegate to `apps/web` and relevant packages.
- Keep one root lockfile.
- Use package names under the `@hungphat/*` scope.
- Next.js 16 Turbopack consumes the workspace TypeScript packages. Configuration must follow the bundled Next.js monorepo and Turbopack guidance.
- Set `turbopack.root` to the monorepo root rather than `process.cwd()`.
- Give every package an explicit `exports` map.
- Verify raw TypeScript workspace package resolution in both development and production builds.
- Keep server-only package imports outside client component graphs.

## Ownership Rules

- `apps/web/**`: web agent ownership.
- `packages/contracts/**`: contract agent ownership; schema changes require compatibility tests.
- `packages/content-core/**`: content-domain agent ownership.
- `packages/storage-file/**`: storage agent ownership.
- Root `package.json`, lockfile, TypeScript, ESLint, Playwright, and workspace configuration: platform-owner changes only.
- `data/content/default-content.json`: tracked seed data owned by the content domain.
- `data/content/draft.json`, `published.json`, `history/`, and `transaction.json`: mutable local runtime data, ignored by Git.
- `apps/web/public/uploads/*`: mutable local assets, ignored by Git except `.gitkeep`.
- `tests/unit/contracts/**`, `tests/unit/content-core/**`, and `tests/unit/storage-file/**`: owned with their corresponding packages.
- `tests/e2e/**` and `tests/architecture/**`: shared integration surfaces; changes require platform review.

## Migration Strategy

### Phase 1: Workspace shell

- Introduce server-only runtime path configuration while the app is still at the repository root.
- Point the compatibility content path at the existing root `.content`.
- Create the workspace directories and package manifests.
- Move the Next.js application into `apps/web`.
- Update root scripts, TypeScript, ESLint, Playwright, and Next.js paths.
- Set Turbopack root to the monorepo root and define workspace package exports.
- Stop the app, create a relative-path/size/SHA-256 manifest for root `public/uploads`, copy every upload without renaming into `apps/web/public/uploads`, and require the source/destination manifests to match.
- Change the configured upload root to `apps/web/public/uploads`.
- Preserve `http://127.0.0.1:3000`.
- Confirm the relocated app still reads and writes the original root content location.
- Verify representative existing `/uploads/...` URLs and one new image upload from the relocated app.
- Keep the original root `public/uploads` snapshot unchanged until the full migration passes.
- Do not change application behavior or active data locations in this phase.

### Phase 2: Shared contracts

- Move content schemas and shared types into `packages/contracts`.
- Add explicit admin request and response schemas.
- Update imports without changing JSON shapes.

### Phase 3: Content behavior

- Move revision and publish behavior into `packages/content-core`.
- Introduce repository interfaces.
- Keep cache invalidation and HTTP mapping inside `apps/web`.

### Phase 4: File storage

- Move file and image persistence into `packages/storage-file`.
- Supply all roots from `apps/web`.
- Perform the controlled data cutover defined below.

### Phase 5: Cleanup and documentation

- Remove obsolete compatibility imports after all checks pass.
- Document package ownership and dependency rules.
- Update README commands and architecture notes.

## Data Safety

- Never regenerate `draft.json` or `published.json` during migration.
- Copy before switching; do not move or delete the source data first.
- Compare SHA-256 hashes for each copied JSON and history file.
- Parse every copied envelope through contracts.
- Confirm draft, base-published, and published revisions match their source values.
- Confirm every referenced asset exists in the content asset registry.
- Preserve uploaded image filenames and public URLs.
- Keep `data/content/default-content.json` tracked while mutable content files remain ignored by Git.

## Controlled Data Cutover

1. Stop the development server and block editor writes.
2. Initialize the source repository once so any valid `.content/transaction.json` is recovered.
3. Require the transaction journal to be absent after recovery; abort otherwise.
4. Record one stable source manifest containing relative paths, sizes, and SHA-256 hashes for:
   - Default, draft, and published JSON.
   - Every history JSON file.
5. Copy the source content into a staging directory without renaming files.
6. Compare source and staging file counts, relative paths, sizes, and hashes.
7. Parse all staged content envelopes through contracts.
8. Verify revision relationships and every referenced asset record.
9. Verify that every referenced asset path resolves to an existing file in `apps/web/public/uploads`.
10. Promote the staged directory to `data/content`.
11. Change runtime content configuration to the new root in the same cutover.
12. Start the app and verify representative public, admin, API, and `/uploads/...` requests.
13. Keep the original `.content` and root upload snapshot unchanged until all acceptance checks pass.

Rollback restores the previous runtime roots, stops the app, and restarts against the untouched source snapshot. Failed staging directories may be removed only after their resolved paths are verified to be inside the intended migration workspace.

## Error Handling

- Contracts define stable error codes and response envelopes.
- Content-core throws domain errors for revision conflicts and invalid operations.
- Storage-file throws persistence and image errors without HTTP status knowledge.
- `apps/web` maps known errors to HTTP responses and logs unexpected failures.

## Testing

- Contract tests verify accepted and rejected JSON shapes.
- Content-core tests use in-memory repository fakes.
- Storage-file tests use temporary directories.
- Route tests verify request parsing, access control, response envelopes, and cache boundaries.
- Architecture tests enforce package dependency direction, public entry points, and server/client import restrictions.
- Existing Playwright flows remain valid at the same URLs.
- Run type checking, linting, unit tests, E2E tests, and a production build after each migration phase.

## Explicit Non-Goals

- No standalone API service.
- No standalone admin deployment.
- No worker, queue, database server, or cloud object storage.
- No content-schema redesign.
- No visual redesign.
- No URL or editor workflow changes.

These components can be added later behind the existing contracts when independent deployment, background processing, or scaling becomes necessary.

## Acceptance Criteria

- Root development command starts the website at `127.0.0.1:3000`.
- Public, admin, preview, and API URLs remain unchanged.
- Draft and published content retain their exact revision numbers and data.
- Existing uploaded image URLs continue to resolve.
- All cross-boundary data is validated by `packages/contracts`.
- Content-core has no framework or filesystem imports.
- Storage paths are injected rather than inferred internally.
- Package dependency direction contains no cycles.
- Workspace packages resolve from their public exports in development and production.
- No client bundle imports `@hungphat/storage-file` or Node-only modules.
- Source and destination content/upload manifests match before cutover.
- No transaction journal exists at snapshot time.
- Git tracks only seed content and upload placeholders, not mutable local data.
- Existing automated tests and production build pass.
