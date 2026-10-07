# Solar Content Administration

## Goal

Extend the existing Hưng Phát content editor so the business can independently update the presentation of the `Điện mặt trời` category without editing source code.

The editor must support:

- The main solar category hero.
- The public product-group tabs `Tấm pin`, `Biến tần`, and `Pin lưu trữ`.
- A title, description, image, image alternative text, and focal position for each group.
- The existing draft, autosave, undo, redo, reset, preview, and publish workflow.

Product records, technical specifications, prices, manufacturers, and product images remain code-managed. This feature manages category and group presentation only.

## Chosen Approach

Add a `solar` page to the existing shared content document and expose it through the current `/quan-tri` editor.

This is preferred over:

1. Building a separate solar administration application, which would duplicate authentication, persistence, upload, preview, and revision handling.
2. Making every solar product editable, which is a larger product-information-management feature and increases the risk of invalid technical data.

The current file repository remains the single source of truth for draft and published presentation content.

## Content Model

Extend `SiteContent.pages` with a fixed `solar` page:

```ts
type SolarPageContent = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    buttonLabel: string;
    alt: string;
    image: ImageRef;
  };
  notice: string;
  groups: {
    panel: SolarGroupContent;
    inverter: SolarGroupContent;
    battery: SolarGroupContent;
  };
};

type SolarGroupContent = {
  id: "panel" | "inverter" | "battery";
  label: string;
  title: string;
  description: string;
  alt: string;
  image: ImageRef;
};
```

Rules:

- Group keys and IDs are fixed and cannot be added, removed, or reordered.
- Text uses the same trimmed length limits as the current editor.
- Every hero and group image references an existing asset.
- `alt` belongs to the placement, not the asset, so the same image can be reused with context-specific alternative text.
- Focal positions use the existing `left | center | right` and `top | center | bottom` values.
- The public group label is editable in the solar tabs and group introduction.
- Technical group labels on product cards and product detail pages remain the fixed labels from `solarProductGroupLabels`.

## Default Content And Migration

Add default solar content to `.content/default-content.json`.

Existing `.content/published.json` and `.content/draft.json` may predate this feature and must not be deleted or replaced. Schema parsing will migrate documents that do not contain `pages.solar` by injecting deterministic defaults:

- Hero title and description start from the current `Điện mặt trời` category data.
- Hero and all three groups initially reuse the existing `category-solar` asset.
- Group labels default to `Tấm pin`, `Biến tần`, and `Pin lưu trữ`.
- Each group receives a concise description appropriate to its current catalog.

The migration preserves all existing homepage edits, assets, revisions, and published history. The migrated solar data is persisted on the next normal draft save or publish.

The envelope remains schema version `1` because this is a backward-compatible content migration handled by the parser.

## Administration Interface

### Page Navigation

The left navigator gains a page selector:

- `Trang chủ`
- `Điện mặt trời`

Selecting `Trang chủ` preserves all current homepage controls and section ordering.

Selecting `Điện mặt trời` replaces the homepage navigator with:

- `Banner điện mặt trời`
- `Thông báo sản phẩm`
- `Tấm pin`
- `Biến tần`
- `Pin lưu trữ`

The solar groups use a three-tab control in the inspector. Selecting a group changes both the inspector fields and the active group in the preview.

### Inspector Fields

The solar hero inspector provides:

- Eyebrow
- Main title
- Description
- Consultation button label
- Image preview
- Alternative text
- Horizontal and vertical focal position
- Upload or replace image

The notice inspector provides the advisory text currently shown above the product explorer.

Each solar group inspector provides:

- Public tab label
- Group title
- Group description
- Image preview
- Alternative text
- Horizontal and vertical focal position
- Upload or replace image

All changes use the existing `commit` history mechanism. Uploads use `/api/admin/assets`. Autosave, explicit save, reset, publish, revision conflict handling, and unsaved-change protection continue to operate on the complete content document.

### Preview

The iframe source changes with the selected page:

- Homepage: `/quan-tri/xem-truoc/home`
- Solar: `/quan-tri/xem-truoc/solar`

The solar preview renders draft content with the real 19-product catalog and the same components used by the public category page.

When the user selects a solar group in the admin navigator or inspector, the editor tells the preview which group to display. This may be implemented through a query parameter on iframe refresh or a same-origin `postMessage`; it must not introduce a second preview-only rendering implementation.

Desktop and mobile viewport controls continue to work for both pages.

## Public Solar Page

`/danh-muc/dien-mat-troi` reads published site content and renders:

1. The editable solar hero.
2. The editable advisory notice.
3. The existing three product-group tabs and product filters.
4. An active-group introduction containing the editable group image, title, and description.
5. The products belonging to the active group.

Changing the public product-group tab updates the introduction and product grid together without a page reload.

The group introduction uses a restrained two-column layout on desktop and a single-column layout on mobile. Images use the saved focal position and must not cause layout shifts or horizontal overflow.

Other category routes continue using the current static category data and are not coupled to the solar content schema.

## Component Boundaries

Use focused responsibilities:

- `content-schema.ts`: validation, types, and backward-compatible solar migration.
- `content-editor.tsx`: shared editor state plus page selection.
- A solar-specific admin inspector component: solar fields and upload controls.
- A shared solar category presentation component: hero, notice, and product explorer composition.
- `product-explorer.tsx`: active product group, filters, tabs, and active group introduction.
- The category route and preview route: load published or draft content and pass it to the same presentation component.

The solar inspector should not further enlarge the existing homepage-specific conditional block. Shared primitive fields may remain in `content-editor.tsx` or be extracted only when both editors use them.

## Data Flow

### Editing

1. `/quan-tri` loads draft and published revisions.
2. The user selects `Điện mặt trời` and a solar section.
3. Field changes update the in-memory complete `SiteContent`.
4. The existing autosave endpoint validates and writes the next draft revision.
5. The preview reloads using draft content.
6. Publish atomically promotes the complete draft to published content.

### Public Rendering

1. The solar category route loads published site content.
2. It resolves all referenced assets from `content.assets`.
3. It passes serializable solar presentation data and solar products to the client explorer.
4. The explorer switches group presentation and product results from one shared active-group state.

## Error Handling

- Invalid content or unknown asset references are rejected by the schema before persistence.
- Upload failures keep the current image and leave the editor usable.
- Revision conflicts continue to show the existing conflict status and block publishing.
- Missing editor access continues to return not found.
- Unknown preview page names continue to return not found.
- If a referenced asset cannot render in the browser, the saved text remains visible and the existing editor error behavior is unchanged; schema validation prevents missing asset IDs.

## Accessibility And Responsive Behavior

- Page controls and solar groups use real buttons with an exposed selected state.
- Public group tabs retain `tablist`, `tab`, and `aria-selected`.
- Every editable image placement requires alternative text, with an empty value allowed only for intentionally decorative imagery.
- Upload controls have explicit Vietnamese accessible labels.
- All fields remain reachable in the existing mobile navigator, preview, and inspector panes.
- At `390x844`, navigation, controls, group text, and images must stay within the viewport.

## Testing

### Unit Tests

Verify:

- The default content parses with `pages.solar`.
- A legacy document without `pages.solar` migrates without losing homepage edits.
- Fixed group IDs and keys are enforced.
- Unknown solar asset references are rejected.
- Solar text and focal-position validation is enforced.
- Draft creation retains solar content.

### Browser Tests

Verify:

- `Điện mặt trời` appears in the admin page selector.
- Hero, notice, and all three group inspectors expose their complete fields.
- Editing each group updates only that group.
- Replacing a group image does not replace another group image.
- Draft preview displays edited text and image without publishing.
- Publishing displays the changed content on `/danh-muc/dien-mat-troi`.
- Reset restores published solar content.
- The public tab introduction changes together with the product list.
- Desktop and mobile layouts have no overlap or horizontal overflow.

### Full Verification

Run:

```text
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:e2e
npm.cmd run build
```

Capture desktop and mobile screenshots of the admin solar editor and all three public solar tabs.

## Out Of Scope

- Editing individual product records or technical specifications.
- Adding, deleting, or reordering the three solar product groups.
- Product inventory, prices, checkout, or payment.
- A separate CMS, database, or authentication system.
- Changes to non-solar category administration.
