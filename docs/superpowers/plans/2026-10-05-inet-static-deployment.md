# iNET Static Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a verified static ZIP that runs when extracted directly into iNET `public_html`.

**Architecture:** Build from a temporary source staging directory configured with Next.js static export. Exclude server-only admin routes, then replace the deployment directory with the generated `out` contents and ZIP those contents without a wrapper directory.

**Tech Stack:** Next.js 16 static export, Node.js, PowerShell, ZIP archives.

---

### Task 1: Prepare Isolated Static-Build Staging

**Files:**
- Create temporarily: `%TEMP%/hungphat-inet-static-build-20261005`
- Modify in staging only: `next.config.ts`
- Remove in staging only: `src/app/api`, `src/app/quan-tri`

- [ ] Copy project build inputs without `.next`, `deployment`, tests, logs, or artifacts.
- [ ] Link or copy the installed dependencies into staging.
- [ ] Configure `output: "export"`, `trailingSlash: true`, and `images.unoptimized: true`.
- [ ] Confirm the production content files exist in staging.

### Task 2: Run Clean Static Export

- [ ] Run `npm.cmd run build` in staging with `NODE_ENV=production`.
- [ ] Confirm `out/index.html`, `out/404.html`, `out/_next`, and public assets exist.
- [ ] Confirm public category and product routes contain `index.html`.

### Task 3: Verify Export Behavior

- [ ] Start a temporary static HTTP server rooted at `out`.
- [ ] Request the homepage, a category, a product, CSS, JavaScript, an image, and favicon.
- [ ] Confirm all representative resources return HTTP 200.
- [ ] Confirm HTML does not reference `/_next/image`, localhost, or admin APIs.

### Task 4: Replace Production Directory

- [ ] Move the existing standalone production directory to a temporary backup.
- [ ] Copy only the static `out` contents into `deployment/hungphattech-production`.
- [ ] Scan the new directory for `.env`, secrets, `.git`, `node_modules`, logs, maps, source files, and development directories.
- [ ] Confirm `index.html` is at the production directory root.

### Task 5: Create and Inspect ZIP

- [ ] Create `deployment/hungphattech-production.zip` from the contents of the production directory.
- [ ] Inspect archive entries and confirm `index.html` is top-level.
- [ ] Confirm no archive entry starts with `hungphattech-production/`.
- [ ] Extract into a fresh temporary directory and repeat the forbidden-file and entry-point checks.
- [ ] Report the exact ZIP path, size, file count, and verification result.
