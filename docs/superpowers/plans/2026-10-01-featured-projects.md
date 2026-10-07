# Featured Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage project placeholder with four independently editable project cards arranged two per row on desktop.

**Architecture:** Add a migrated fixed four-item project tuple to the content schema, reuse the existing asset upload pipeline, and render the items through the shared homepage content component. Runtime content is migrated and published only after confirming draft/published safety.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Tailwind CSS, Playwright.

---

### Task 1: Project Content Schema

**Files:**
- Modify: `tests/content-schema.test.ts`
- Modify: `src/lib/content/content-schema.ts`
- Modify: `.content/default-content.json`

- [ ] Add a schema test proving a legacy project section migrates to `project-1` through `project-4`, permits empty text/null images, and shortens only the exact legacy company title.
- [ ] Add a schema test proving an unknown project asset ID is rejected.
- [ ] Run `node --test tests/content-schema.test.ts` and confirm the tests fail because `items` does not exist.
- [ ] Add a `projectsSectionSchema` preprocess migration with a fixed four-item tuple and optional text fields.
- [ ] Include non-null project image IDs in the global asset-reference validation.
- [ ] Update `.content/default-content.json` to use the four migrated empty project items.
- [ ] Run the schema tests and confirm they pass.

### Task 2: Public Project Grid

**Files:**
- Modify: `e2e/site.spec.ts`
- Modify: `src/components/home/home-page-content.tsx`

- [ ] Add an E2E test against draft preview asserting title `Một số công trình nổi bật`, four project cards, two desktop columns, image above text, and no old project button.
- [ ] Run the targeted test and confirm it fails on the current single placeholder.
- [ ] Render `section.items` as `grid gap-5 md:grid-cols-2`.
- [ ] Give every card a `4:3` image area, empty image state, and text area with neutral fallbacks for blank title/description.
- [ ] Remove the old `ScanSearch` placeholder and `/du-an` button from this homepage section.
- [ ] Run the targeted E2E test and confirm it passes.

### Task 3: Project Editor Controls

**Files:**
- Modify: `e2e/admin.spec.ts`
- Modify: `src/components/admin/content-editor.tsx`

- [ ] Add an admin E2E test asserting four panels named `project-editor-project-1` through `project-editor-project-4`.
- [ ] Assert each panel exposes title, description, alt text, focal controls, and an upload input.
- [ ] Run the targeted test and confirm it fails because the four panels do not exist.
- [ ] Replace the legacy project card fields with four independent editor panels.
- [ ] Reuse `uploadImage` and update only the selected project item.
- [ ] Run the targeted admin E2E test and confirm it passes.

### Task 4: Runtime Migration And Publish

**Files:**
- Modify at runtime: `.content/draft.json`
- Modify at runtime: `.content/published.json`

- [ ] Compare draft and published content before migration.
- [ ] If they match, load the migrated draft through the schema and save/publish with current revisions.
- [ ] If they differ, preserve all unrelated fields and migrate the project section independently in both envelopes.
- [ ] Verify the published title is `Một số công trình nổi bật`, both envelopes contain four empty project items, and all non-project content remains unchanged.

### Task 5: Verification

**Files:**
- Test: `tests/*.test.ts`
- Test: `e2e/*.spec.ts`

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd run test:e2e -- --workers=1`.
- [ ] Capture and inspect desktop/mobile screenshots of the project section.
