# Logo And Homepage Hero Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the supplied transparent HP logo and approved solar technology hero into the existing HƯNG PHÁT TECH website.

**Architecture:** Keep branding in the existing shared `BrandMark` component and keep homepage-specific presentation in `src/app/page.tsx`. Store processed assets under `public/images` and extend the existing Playwright coverage for rendered asset and content checks.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Playwright, local image processing.

---

### Task 1: Add Asset Regression Checks

**Files:**
- Modify: `e2e/site.spec.ts`

- [ ] Add checks that the header contains the transparent HP logo and the homepage hero loads the new solar image.
- [ ] Add checks that reference brand names and unsupported metrics are absent.
- [ ] Run `npm run test:e2e -- --grep "branding"` and confirm the new assertions fail because the assets are not yet wired.

### Task 2: Prepare Project Assets

**Files:**
- Create: `public/images/hung-phat-logo-transparent.png`
- Create: `public/images/hero-solar-technology.jpg`

- [ ] Remove the near-white connected background from the supplied logo while preserving the red mark and antialiased edges.
- [ ] Crop excess transparent margins without changing the monogram proportions.
- [ ] Copy the approved hero image into the project under its neutral filename.
- [ ] Verify the logo alpha channel, transparent corner pixels, dimensions, and subject coverage.

### Task 3: Update Shared Branding

**Files:**
- Modify: `src/components/layout/site-header.tsx`
- Modify if required: `src/components/layout/site-footer.tsx`

- [ ] Replace the temporary HP text square with `next/image` using the transparent red monogram.
- [ ] Retain the adjacent HƯNG PHÁT TECH wordmark and accessible home-page label.
- [ ] Keep the brand lockup stable at mobile and desktop sizes.

### Task 4: Refresh Homepage Hero

**Files:**
- Modify: `src/app/page.tsx`

- [ ] Replace the old illustration with `/images/hero-solar-technology.jpg`.
- [ ] Add a dark left-to-right overlay that protects text contrast without hiding the panels.
- [ ] Preserve the verified Hưng Phát headline, description, calls to action, and local-image disclosure.
- [ ] Restyle the four category links as a translucent responsive dock.
- [ ] Keep the hero height constrained so the next section remains visible in the first viewport.

### Task 5: Verify And Inspect

**Files:**
- Modify only if a test reveals a defect.

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run test:e2e`.
- [ ] Capture desktop and mobile screenshots and inspect logo transparency, image cropping, text contrast, overflow, and hero height.
- [ ] Confirm the local development server responds at `http://localhost:3000`.
