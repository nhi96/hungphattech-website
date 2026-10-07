# Solar Content Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an editable solar category page and three editable solar group presentations to the existing draft, preview, and publish administration workflow.

**Architecture:** Extend the shared `SiteContent` schema with backward-compatible solar defaults, then reuse one solar page component for public published content and admin draft preview. Keep group switching and product filtering in the existing client explorer, while isolating solar-specific admin fields in a dedicated inspector component.

**Tech Stack:** Next.js 16.3.8 App Router, React 19, TypeScript, Zod 4, Tailwind CSS 4, Node test runner, Playwright.

---

## File Map

- Modify `src/lib/content/content-schema.ts`: solar schemas, migration defaults, asset-reference validation, exported solar types.
- Modify `.content/default-content.json`: initial solar hero, notice, and group presentation content.
- Modify `tests/content-schema.test.ts`: migration and validation coverage.
- Create `src/components/admin/editor-fields.tsx`: shared text and select field primitives.
- Create `src/components/admin/solar-content-inspector.tsx`: solar hero, notice, group, image, alt, and focal-position controls.
- Modify `src/components/admin/content-editor.tsx`: page navigation, solar selection, preview route selection, shared field imports.
- Create `src/components/products/solar-category-page-content.tsx`: shared public and preview solar page composition.
- Modify `src/components/products/product-explorer.tsx`: active-group presentation and initial group support.
- Modify `src/app/danh-muc/[slug]/page.tsx`: load published content only for the solar category and use the shared solar composition.
- Modify `src/app/quan-tri/xem-truoc/[page]/page.tsx`: accept `solar`, load draft content, and render the shared solar composition.
- Modify `e2e/admin.spec.ts`: solar editor and draft preview coverage.
- Modify `e2e/site.spec.ts`: published solar presentation and group-introduction behavior.

### Task 1: Add Solar Content Schema And Legacy Migration

**Files:**
- Modify: `tests/content-schema.test.ts`
- Modify: `src/lib/content/content-schema.ts`
- Modify: `.content/default-content.json`

- [ ] **Step 1: Write failing schema tests**

Add tests that require a solar page, preserve homepage edits during migration, and reject unknown solar assets:

```ts
it("migrates legacy content with editable solar groups", () => {
  const legacy = structuredClone(seed);
  delete (legacy.content.pages as Record<string, unknown>).solar;
  legacy.content.pages.home.hero.title = "HOME EDIT PRESERVED";

  const published = parsePublishedEnvelope(legacy);

  assert.equal(published.content.pages.home.hero.title, "HOME EDIT PRESERVED");
  assert.equal(published.content.pages.solar.groups.panel.label, "Tấm pin");
  assert.equal(published.content.pages.solar.groups.inverter.label, "Biến tần");
  assert.equal(published.content.pages.solar.groups.battery.label, "Pin lưu trữ");
  assert.equal(
    published.content.pages.solar.hero.image.assetId,
    published.content.pages.home.categoryImages["dien-mat-troi"].assetId,
  );
});

it("rejects unknown solar image references", () => {
  const invalid = structuredClone(seed);
  invalid.content.pages.solar.groups.panel.image.assetId = "missing";

  assert.throws(() => parsePublishedEnvelope(invalid));
});

it("enforces fixed solar group identities", () => {
  const invalid = structuredClone(seed);
  invalid.content.pages.solar.groups.panel.id = "battery";

  assert.throws(() => parsePublishedEnvelope(invalid));
});
```

- [ ] **Step 2: Run the schema tests and verify RED**

Run:

```text
node --test tests/content-schema.test.ts
```

Expected: FAIL because `pages.solar` does not exist in the inferred schema or seed data.

- [ ] **Step 3: Add solar schemas and deterministic migration**

In `content-schema.ts`, define:

```ts
const solarGroupSchema = <T extends "panel" | "inverter" | "battery">(id: T) =>
  z.object({
    id: z.literal(id),
    label: requiredText,
    title: requiredText,
    description: optionalText,
    alt: optionalText,
    image: imageRefSchema,
  });

const solarPageSchema = z.object({
  hero: z.object({
    eyebrow: requiredText,
    title: requiredText,
    description: requiredText,
    buttonLabel: requiredText,
    alt: optionalText,
    image: imageRefSchema,
  }),
  notice: optionalText,
  groups: z.object({
    panel: solarGroupSchema("panel"),
    inverter: solarGroupSchema("inverter"),
    battery: solarGroupSchema("battery"),
  }),
});
```

Wrap the `pages` object in `z.preprocess`. When `solar` is absent, derive its image reference from `home.categoryImages["dien-mat-troi"]` and inject the exact default labels and initial Vietnamese copy. Do not mutate the input object.

Export:

```ts
export type SolarPageContent = SiteContent["pages"]["solar"];
export type SolarGroupContent = SolarPageContent["groups"][keyof SolarPageContent["groups"]];
```

Extend the root asset-reference validation with the solar hero and three group asset IDs.

- [ ] **Step 4: Add matching seed content**

Add `content.pages.solar` to `.content/default-content.json` with:

```json
{
  "hero": {
    "eyebrow": "Giải pháp năng lượng",
    "title": "Điện mặt trời",
    "description": "Thiết bị điện mặt trời cho gia đình, cửa hàng và doanh nghiệp.",
    "buttonLabel": "Yêu cầu tư vấn",
    "alt": "Thiết bị và giải pháp điện mặt trời",
    "image": {
      "assetId": "category-solar",
      "focalX": "center",
      "focalY": "center"
    }
  },
  "notice": "Thông tin sản phẩm tham khảo. Khả năng cung ứng, cấu hình và tình trạng phân phối cần được Hưng Phát xác nhận khi tư vấn.",
  "groups": {
    "panel": {
      "id": "panel",
      "label": "Tấm pin",
      "title": "Tấm pin năng lượng mặt trời",
      "description": "Các lựa chọn tấm pin hiệu suất cao cho nhiều quy mô hệ thống.",
      "alt": "Tấm pin năng lượng mặt trời",
      "image": {
        "assetId": "category-solar",
        "focalX": "center",
        "focalY": "center"
      }
    },
    "inverter": {
      "id": "inverter",
      "label": "Biến tần",
      "title": "Biến tần điện mặt trời",
      "description": "Biến tần hybrid và hòa lưới từ 6 kW đến 20 kW.",
      "alt": "Biến tần điện mặt trời",
      "image": {
        "assetId": "category-solar",
        "focalX": "center",
        "focalY": "center"
      }
    },
    "battery": {
      "id": "battery",
      "label": "Pin lưu trữ",
      "title": "Pin lưu trữ năng lượng",
      "description": "Giải pháp lưu trữ điện cho hệ thống dân dụng và thương mại.",
      "alt": "Pin lưu trữ năng lượng",
      "image": {
        "assetId": "category-solar",
        "focalX": "center",
        "focalY": "center"
      }
    }
  }
}
```

- [ ] **Step 5: Run schema tests and verify GREEN**

Run:

```text
node --test tests/content-schema.test.ts
```

Expected: all content schema tests pass.

- [ ] **Step 6: Commit when Git becomes available**

```text
git add .content/default-content.json src/lib/content/content-schema.ts tests/content-schema.test.ts
git commit -m "feat: add editable solar content schema"
```

If Windows Security still blocks `git.exe`, record the limitation and continue without altering the working tree.

### Task 2: Add Shared Solar Public And Preview Presentation

**Files:**
- Modify: `e2e/site.spec.ts`
- Create: `src/components/products/solar-category-page-content.tsx`
- Modify: `src/components/products/product-explorer.tsx`
- Modify: `src/app/danh-muc/[slug]/page.tsx`
- Modify: `src/app/quan-tri/xem-truoc/[page]/page.tsx`

- [ ] **Step 1: Write failing public solar presentation tests**

Add a test that opens `/danh-muc/dien-mat-troi` and asserts the seed solar hero and active panel introduction:

```ts
test("solar category renders published hero and active group introduction", async ({ page }) => {
  await page.goto("/danh-muc/dien-mat-troi");

  await expect(page.getByRole("heading", { level: 1, name: "Điện mặt trời" })).toBeVisible();
  await expect(page.getByTestId("solar-group-introduction")).toContainText(
    "Tấm pin năng lượng mặt trời",
  );
  await page.getByRole("tab", { name: /Biến tần/ }).click();
  await expect(page.getByTestId("solar-group-introduction")).toContainText(
    "Biến tần điện mặt trời",
  );
});
```

Extend the responsive checks to assert the group introduction stays inside the viewport.

- [ ] **Step 2: Run the selected E2E test and verify RED**

Run:

```text
npx playwright test e2e/site.spec.ts --project=desktop-edge --grep "active group introduction"
```

Expected: FAIL because no group introduction exists and the route still uses static category content.

- [ ] **Step 3: Create the shared solar composition**

Create `SolarCategoryPageContent` with props:

```ts
type SolarCategoryPageContentProps = {
  content: SiteContent;
  products: Product[];
  initialGroup?: SolarProductGroup;
};
```

It must:

- Resolve `content.pages.solar.hero.image` through `content.assets`.
- Render the hero eyebrow, title, description, button label, alt text, and focal position.
- Render `content.pages.solar.notice`.
- Pass `content.pages.solar`, `content.assets`, and `initialGroup` to `ProductExplorer`.

- [ ] **Step 4: Extend ProductExplorer with active group presentation**

Add optional props:

```ts
solarContent?: SolarPageContent;
assets?: SiteContent["assets"];
initialSolarGroup?: SolarProductGroup;
```

Initialize `filters.solarGroup` from `initialSolarGroup ?? "panel"` when solar groups are enabled. Resolve the active group and asset, then render:

```tsx
<section
  data-testid="solar-group-introduction"
  className="mb-6 grid overflow-hidden border border-[#d9dde0] bg-white lg:grid-cols-[0.8fr_1.2fr]"
>
  <div className="relative aspect-[4/3] bg-[#171c21] lg:aspect-auto">
    <Image
      src={asset.path}
      alt={group.alt}
      fill
      className="object-cover"
      style={{ objectPosition: `${group.image.focalX} ${group.image.focalY}` }}
      sizes="(max-width: 1024px) 100vw, 40vw"
    />
  </div>
  <div className="p-6 md:p-8">
    <p className="eyebrow">{group.label}</p>
    <h2 className="mt-4 text-3xl font-black text-[#0b0f12]">{group.title}</h2>
    <p className="mt-4 leading-7 text-[#59616a]">{group.description}</p>
  </div>
</section>
```

Use editable group labels in public tab buttons. Keep fixed product-card labels unchanged.

- [ ] **Step 5: Wire public and preview routes**

In the category route:

- Load `getPublishedSiteContent()` only when `slug === "dien-mat-troi"`.
- Render `SolarCategoryPageContent` for solar.
- Preserve the existing static layout for all other categories.

In the preview route:

- Accept `page === "home"` or `page === "solar"`.
- Read `searchParams.group`.
- Validate it against `panel | inverter | battery`, defaulting to `panel`.
- Render `SolarCategoryPageContent` with draft content and the 19 solar products.

- [ ] **Step 6: Run selected tests and static checks**

Run:

```text
npx playwright test e2e/site.spec.ts --project=desktop-edge --grep "active group introduction"
npm.cmd run typecheck
npm.cmd run lint
```

Expected: all commands pass.

- [ ] **Step 7: Commit when Git becomes available**

```text
git add src/components/products src/app/danh-muc src/app/quan-tri/xem-truoc e2e/site.spec.ts
git commit -m "feat: render editable solar category content"
```

### Task 3: Add Solar Administration Navigation And Inspector

**Files:**
- Modify: `e2e/admin.spec.ts`
- Create: `src/components/admin/editor-fields.tsx`
- Create: `src/components/admin/solar-content-inspector.tsx`
- Modify: `src/components/admin/content-editor.tsx`

- [ ] **Step 1: Write failing admin navigation and inspector tests**

Add:

```ts
test("solar administration exposes hero notice and three group editors", async ({ page }) => {
  await page.goto("/quan-tri");
  await page.getByRole("button", { name: "Điện mặt trời", exact: true }).click();

  await expect(page.getByRole("button", { name: "Banner điện mặt trời" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thông báo sản phẩm" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tấm pin", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Biến tần", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pin lưu trữ", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Tấm pin", exact: true }).click();
  await expect(page.getByLabel("Tên tab")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề nhóm")).toBeVisible();
  await expect(page.getByLabel("Mô tả nhóm")).toBeVisible();
  await expect(page.getByLabel("Alt ảnh Tấm pin")).toBeVisible();
  await expect(page.getByLabel("Tải ảnh Tấm pin")).toBeVisible();
});
```

- [ ] **Step 2: Run the admin test and verify RED**

Run:

```text
npx playwright test e2e/admin.spec.ts --project=desktop-edge --grep "three group editors"
```

Expected: FAIL because the admin only exposes homepage controls.

- [ ] **Step 3: Extract shared editor fields**

Move `TextField`, `TextArea`, and `SelectField` from `content-editor.tsx` to `editor-fields.tsx` and export them with their existing behavior and CSS. Update homepage imports without changing labels or behavior.

- [ ] **Step 4: Create SolarContentInspector**

Define:

```ts
type SolarSelection = "hero" | "notice" | SolarProductGroup;

type SolarContentInspectorProps = {
  content: SiteContent;
  selection: SolarSelection;
  uploading: boolean;
  commit: (mutator: (draft: SiteContent) => void) => void;
  uploadImage: (
    file: File,
    apply: (draft: SiteContent, assetId: string) => void,
  ) => Promise<void>;
};
```

Render hero fields for `hero`, one textarea for `notice`, and group fields for the three product groups. Use one internal `ImagePlacementEditor` to render:

- Current image or empty state.
- Placement alt text.
- Horizontal and vertical focal selects.
- Upload/replace input with a group-specific accessible label.

All mutations must target only the selected solar placement.

- [ ] **Step 5: Add page-aware editor navigation**

In `ContentEditor`, add:

```ts
type EditorPage = "home" | "solar";
type HomeSelection = "site" | "hero" | "images" | keyof SiteContent["pages"]["home"]["sections"];
type SolarSelection = "hero" | "notice" | SolarProductGroup;
```

Maintain independent `homeSelection` and `solarSelection` state. Add a two-option page control at the top of the navigator. When solar is selected:

- Render solar navigation buttons.
- Render `SolarContentInspector`.
- Hide homepage section move controls.
- Set iframe source to `/quan-tri/xem-truoc/solar?revision=...&group=...`.

When home is selected, retain the current homepage behavior and `/quan-tri/xem-truoc/home`.

- [ ] **Step 6: Run admin tests and static checks**

Run:

```text
npx playwright test e2e/admin.spec.ts --project=desktop-edge --grep "three group editors"
npm.cmd run typecheck
npm.cmd run lint
```

Expected: all commands pass.

- [ ] **Step 7: Commit when Git becomes available**

```text
git add src/components/admin e2e/admin.spec.ts
git commit -m "feat: add solar content administration"
```

### Task 4: Verify Draft Isolation, Upload, Preview, Publish, And Reset

**Files:**
- Modify: `e2e/admin.spec.ts`

- [ ] **Step 1: Write failing workflow tests**

Add a desktop test that:

1. Opens the solar panel inspector.
2. Records the inverter title and image.
3. Changes the panel title.
4. Uploads `public/images/category-camera.png` only to the panel placement.
5. Waits for draft save.
6. Confirms the solar preview shows the changed panel title and image.
7. Confirms the inverter content remains unchanged.
8. Publishes and confirms the public route shows the changed panel title.
9. Restores the original values and publishes them in `finally`.

Use response waiters for `/api/admin/content/draft`, `/api/admin/assets`, and `/api/admin/content/publish` so the test does not race autosave.

- [ ] **Step 2: Run the workflow test and verify RED**

Run:

```text
npx playwright test e2e/admin.spec.ts --project=desktop-edge --grep "solar draft preview publish"
```

Expected: FAIL at the first missing or incorrect workflow behavior.

- [ ] **Step 3: Make minimal workflow corrections**

Correct only behaviors exposed by the failing test:

- Ensure the preview iframe key or URL updates after draft save.
- Ensure selecting a solar group changes the preview `group` query.
- Ensure image upload mutates only the selected placement.
- Ensure publishing uses the revision returned by an in-flight draft save.
- Ensure reset reloads solar content and preview just like homepage content.

- [ ] **Step 4: Run workflow and existing admin tests**

Run:

```text
npx playwright test e2e/admin.spec.ts --project=desktop-edge
```

Expected: all desktop admin tests pass.

- [ ] **Step 5: Commit when Git becomes available**

```text
git add src/components/admin e2e/admin.spec.ts
git commit -m "test: cover solar content publishing workflow"
```

### Task 5: Responsive And Accessibility Verification

**Files:**
- Modify: `e2e/admin.spec.ts`
- Modify: `e2e/site.spec.ts`

- [ ] **Step 1: Add mobile solar editor coverage**

Add a `mobile-edge` test that selects the navigator pane, chooses `Điện mặt trời`, selects `Pin lưu trữ`, opens the inspector pane, and confirms every control is visible without document-level horizontal overflow.

- [ ] **Step 2: Add public responsive coverage**

At both `1440x900` and `390x844`, switch through all three public tabs and assert:

```ts
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
);
expect(overflow).toBe(false);
```

Also assert each `solar-group-introduction` image has non-zero natural width and height.

- [ ] **Step 3: Run responsive E2E tests**

Run:

```text
npx playwright test e2e/admin.spec.ts e2e/site.spec.ts
```

Expected: all desktop and mobile tests pass.

### Task 6: Full Verification And Visual Review

**Files:**
- Create: `.artifacts/solar-admin-desktop.png`
- Create: `.artifacts/solar-admin-mobile.png`
- Create: `.artifacts/solar-public-panels.png`
- Create: `.artifacts/solar-public-inverters.png`
- Create: `.artifacts/solar-public-batteries-mobile.png`

- [ ] **Step 1: Run unit and static verification**

Run:

```text
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
```

Expected: all commands exit with code `0`.

- [ ] **Step 2: Run full browser verification**

Run:

```text
npm.cmd run test:e2e
```

Expected: all Playwright tests pass in `desktop-edge` and `mobile-edge`.

- [ ] **Step 3: Run production build**

Run:

```text
npm.cmd run build
```

Expected: Next.js production build exits with code `0`.

- [ ] **Step 4: Capture and inspect screenshots**

Use Playwright against `http://127.0.0.1:3000` to capture the admin solar editor and all three public group states at desktop and mobile sizes. Inspect for:

- Missing or cropped images.
- Overlapping controls or text.
- Horizontal overflow.
- Incorrect active tab or preview group.
- Inconsistent page content between admin preview and public output.

- [ ] **Step 5: Report Git limitation**

Run:

```text
git status --short
```

If Windows Security still blocks `git.exe`, report that files are saved but commits could not be created.
