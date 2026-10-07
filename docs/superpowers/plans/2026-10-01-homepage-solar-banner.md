# Homepage Solar Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero with the approved solar-panel banner, enlarge the HP logo, and remove "TECH" from the visible brand while preserving all routes and content below the hero.

**Architecture:** Add a focused server component for the homepage hero and keep existing category data as its source of truth. The global header remains responsible for branding and navigation. Playwright tests verify branding, asset use, routes, responsive overflow, and first-viewport composition.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `next/image`, Lucide React, Playwright.

---

## File Map

- Create `src/components/home/home-hero.tsx`: hero image, copy, metrics, CTA links, and responsive category showcase.
- Modify `src/app/page.tsx`: replace the existing inline hero with `HomeHero`; preserve every following section.
- Modify `src/components/layout/site-header.tsx`: enlarge the HP mark and change visible/accessibility branding to HƯNG PHÁT.
- Modify `e2e/site.spec.ts`: encode the approved branding, image, links, responsive layout, and no-unverified-claims requirements.
- Add `public/images/hero-solar-panels-array.jpg`: repository-owned copy of the supplied image.

### Task 1: Confirm Next.js 16 Image Conventions And Add The Asset

**Files:**
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
- Read: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`
- Create: `public/images/hero-solar-panels-array.jpg`

- [ ] **Step 1: Read the project-local Next.js image documentation**

Run:

```powershell
Get-Content -Raw 'node_modules\next\dist\docs\01-app\01-getting-started\12-images.md'
Get-Content -Raw 'node_modules\next\dist\docs\01-app\03-api-reference\02-components\image.md'
```

Expected: documentation confirms the current `Image` component behavior for `fill`, `sizes`, `priority`, and object positioning.

- [ ] **Step 2: Copy the approved source image into the repository**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\MR Toi\.gemini\antigravity\brain\64dea48f-3dfa-4be3-a698-d645a2367041\scratch\tcl_panels_array.jpg' -Destination 'public\images\hero-solar-panels-array.jpg'
```

Expected: `public/images/hero-solar-panels-array.jpg` exists and has a non-zero file length.

- [ ] **Step 3: Verify the copied file**

Run:

```powershell
Get-Item -LiteralPath 'public\images\hero-solar-panels-array.jpg' | Select-Object FullName,Length
```

Expected: one JPEG file with `Length` greater than zero.

- [ ] **Step 4: Commit the asset when Git is available**

```powershell
git add -- public/images/hero-solar-panels-array.jpg
git commit -m "assets: add solar panel hero image"
```

Expected: commit succeeds. If Windows Security continues blocking `git.exe`, record the blocker and continue without changing security settings.

### Task 2: Add Failing End-To-End Expectations

**Files:**
- Modify: `e2e/site.spec.ts`

- [ ] **Step 1: Update the homepage branding and hero test**

Replace the old HƯNG PHÁT TECH and old hero-image expectations with:

```ts
test("trang chủ hiển thị thương hiệu Hưng Phát và banner mới", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("HƯNG PHÁT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("TECH", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: /GIẢI PHÁP CÔNG NGHỆ CHO NGÔI NHÀ & DOANH NGHIỆP/i,
    }),
  ).toBeVisible();

  const heroImage = page.getByRole("img", {
    name: "Hệ thống pin năng lượng mặt trời",
  });
  await expect(heroImage).toBeVisible();
  await expect(heroImage).toHaveAttribute("src", /hero-solar-panels-array/);

  await expect(page.getByRole("link", { name: /Nhận tư vấn/i })).toHaveAttribute(
    "href",
    "/lien-he#form-lien-he",
  );
  await expect(page.getByRole("link", { name: /Khám phá sản phẩm/i })).toHaveAttribute(
    "href",
    "/san-pham",
  );
});
```

- [ ] **Step 2: Add category-showcase and verified-metrics assertions**

```ts
test("banner dùng danh mục và số liệu đã xác minh", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator('[data-testid="home-hero"]');

  await expect(hero.getByText("04")).toBeVisible();
  await expect(hero.getByText("02")).toBeVisible();
  await expect(hero.getByText("01")).toBeVisible();

  for (const name of [
    "Điện mặt trời",
    "Camera giám sát",
    "Laptop và PC",
    "Khóa cửa thông minh",
  ]) {
    await expect(hero.getByRole("link", { name: new RegExp(name, "i") })).toBeVisible();
  }

  await expect(hero.getByText(/TCL|GoodWe|SolaX|Deye|630W|98\.8%|25 năm/i)).toHaveCount(0);
});
```

- [ ] **Step 3: Add responsive overflow coverage**

```ts
test("banner không tràn ngang trên desktop và mobile", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
    await expect(page.locator("#danh-muc-chinh")).toBeAttached();
  }
});
```

- [ ] **Step 4: Run the targeted tests and verify they fail**

Run:

```powershell
npx playwright test e2e/site.spec.ts --grep "banner|thương hiệu Hưng Phát"
```

Expected: failures mention missing new image, old TECH text, missing metrics, or missing `home-hero` test id.

- [ ] **Step 5: Commit the tests when Git is available**

```powershell
git add -- e2e/site.spec.ts
git commit -m "test: define homepage solar banner behavior"
```

### Task 3: Update Header Branding

**Files:**
- Modify: `src/components/layout/site-header.tsx`

- [ ] **Step 1: Change the brand mark markup**

Use this structure in `BrandMark`:

```tsx
<Link
  href="/"
  className="inline-flex items-center gap-3"
  aria-label="HƯNG PHÁT - Trang chủ"
>
  <Image
    src="/images/hung-phat-logo-transparent.png"
    alt=""
    width={72}
    height={52}
    sizes="(max-width: 767px) 64px, 72px"
    className="h-[46px] w-auto shrink-0 md:h-[52px]"
  />
  <span className="text-[1rem] font-black leading-none text-white md:text-[1.08rem]">
    HƯNG PHÁT
  </span>
</Link>
```

Keep the existing `min-h-20` header container, navigation links, phone action, and mobile menu unchanged.

- [ ] **Step 2: Run type checking**

Run:

```powershell
npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 3: Commit the header change when Git is available**

```powershell
git add -- src/components/layout/site-header.tsx
git commit -m "feat: update Hung Phat header branding"
```

### Task 4: Build The Homepage Hero Component

**Files:**
- Create: `src/components/home/home-hero.tsx`

- [ ] **Step 1: Create the component constants and icon map**

The component must import `ArrowRight`, `Camera`, `Laptop`, `LockKeyhole`, and `Sun` from `lucide-react`, plus `Image`, `Link`, and `categories`. Define:

```tsx
const metrics = [
  { value: "04", label: "Danh mục chính" },
  { value: "02", label: "Hotline tư vấn" },
  { value: "01", label: "Điểm tư vấn đa ngành" },
] as const;

const categoryIcons = {
  "dien-mat-troi": Sun,
  "camera-giam-sat": Camera,
  "laptop-pc": Laptop,
  "khoa-cua-thong-minh": LockKeyhole,
} as const;
```

- [ ] **Step 2: Add the full-bleed image and overlays**

Start the returned markup with:

```tsx
<section
  data-testid="home-hero"
  className="relative overflow-hidden border-b border-white/10 bg-[#050b14]"
>
  <Image
    src="/images/hero-solar-panels-array.jpg"
    alt="Hệ thống pin năng lượng mặt trời"
    fill
    priority
    sizes="100vw"
    className="object-cover object-[66%_center] sm:object-[70%_center] xl:object-center"
  />
  <div
    className="absolute inset-0 bg-[linear-gradient(90deg,#080b0d_0%,rgba(8,11,13,0.96)_38%,rgba(8,11,13,0.58)_70%,rgba(8,11,13,0.2)_100%)]"
    aria-hidden
  />
  <div className="absolute inset-0 bg-[#050b14]/35 md:bg-transparent" aria-hidden />
  {/* content */}
</section>
```

- [ ] **Step 3: Add the verified copy, CTAs, and metrics**

Inside a relative `container-shell`, render the exact copy and routes approved in the spec. Use a compact badge, `display-title`, existing button classes, and:

```tsx
<dl className="mt-8 grid max-w-xl grid-cols-3 border-t border-white/15 pt-5">
  {metrics.map((metric) => (
    <div key={metric.label} className="pr-3">
      <dt className="text-xs font-bold uppercase leading-5 text-[#91a0b2]">
        {metric.label}
      </dt>
      <dd className="mt-1 text-2xl font-black text-[#ffc400]">{metric.value}</dd>
    </div>
  ))}
</dl>
```

- [ ] **Step 4: Add the responsive category showcase**

Map `categories` into links to `/danh-muc/${category.slug}`. The wrapper must use:

```tsx
className="mt-10 flex snap-x gap-3 overflow-x-auto pb-3 xl:absolute xl:bottom-8 xl:right-0 xl:mt-0 xl:grid xl:w-[760px] xl:grid-cols-4 xl:overflow-visible xl:pb-0"
```

Each card must use a stable width below desktop and natural grid width on desktop:

```tsx
className="group min-w-[168px] snap-start border border-[#ffc400]/25 bg-[#111518]/85 p-4 text-white shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-[#ffc400]/70 hover:bg-[#171c21]/95 xl:min-w-0"
```

Render the mapped Lucide icon, category short name, full name, and a short "Xem danh mục" action label. Do not add product brands or performance specifications.

- [ ] **Step 5: Ensure tablet layout is a two-column grid**

Add tablet-specific classes so the showcase becomes `md:grid md:grid-cols-2 md:overflow-visible` before switching to four columns at `xl`. The mobile row remains the only horizontally scrollable region.

- [ ] **Step 6: Run type checking**

Run:

```powershell
npm run typecheck
```

Expected: exit code 0 and category slug keys match the icon map.

- [ ] **Step 7: Commit the hero component when Git is available**

```powershell
git add -- src/components/home/home-hero.tsx
git commit -m "feat: add responsive homepage solar hero"
```

### Task 5: Integrate The Hero Without Changing Remaining Homepage Content

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import the new component**

```tsx
import { HomeHero } from "@/components/home/home-hero";
```

- [ ] **Step 2: Remove only the old inline hero**

Replace the section from the opening hero `<section>` through its matching closing tag immediately before `#danh-muc-chinh` with:

```tsx
<HomeHero />
```

Remove imports that were used only by the old hero, while retaining imports used by later homepage sections. Do not alter any content beginning with:

```tsx
<section id="danh-muc-chinh"
```

- [ ] **Step 3: Run static checks**

Run:

```powershell
npm run typecheck
npm run lint
```

Expected: both commands exit 0 with no unused imports.

- [ ] **Step 4: Commit the integration when Git is available**

```powershell
git add -- src/app/page.tsx
git commit -m "feat: integrate approved homepage banner"
```

### Task 6: Verify Behavior And Visual Layout

**Files:**
- Verify: `src/components/home/home-hero.tsx`
- Verify: `src/components/layout/site-header.tsx`
- Verify: `e2e/site.spec.ts`

- [ ] **Step 1: Run unit tests**

Run:

```powershell
npm test
```

Expected: all existing Node tests pass.

- [ ] **Step 2: Run type checking and linting**

Run:

```powershell
npm run typecheck
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 3: Build the application**

Run:

```powershell
npm run build
```

Expected: Next.js production build completes successfully.

- [ ] **Step 4: Run the complete Playwright suite**

Run:

```powershell
npm run test:e2e
```

Expected: all desktop and mobile projects pass, including the existing check that the next homepage section is visible in the initial viewport.

- [ ] **Step 5: Start the local server and inspect screenshots**

Run the development server on an unused port:

```powershell
npm run dev -- --port 3001
```

Use Playwright screenshots at 1440 by 900 and 390 by 844. Verify:

- HƯNG PHÁT is visible and TECH is absent.
- The HP mark is larger without increasing the 80-pixel header minimum height.
- The solar array is visible, not blank, and remains legible behind the overlay.
- Hero copy, metrics, and cards do not overlap.
- Mobile scrolling is restricted to the category-card row.
- A hint of `#danh-muc-chinh` remains visible in the first viewport.

- [ ] **Step 6: Record Git blocker or create the final commit**

```powershell
git add -- src/components/home/home-hero.tsx src/components/layout/site-header.tsx src/app/page.tsx e2e/site.spec.ts public/images/hero-solar-panels-array.jpg
git commit -m "feat: redesign homepage solar banner"
```

Expected: commit succeeds when `git.exe` is no longer blocked. Do not weaken Windows Security settings to force it.
