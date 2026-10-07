# Prominent Product Group Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Solar and Laptop/PC group selection visually prominent, icon-led, responsive, and free of product totals in the button labels.

**Architecture:** Keep group state and filtering inside `ProductExplorer`, but replace its duplicated Solar/computing selector markup with one typed local `ProductGroupButtons` component. Use a labeled button group with `aria-pressed`, brand colors, Lucide icons, and responsive grid classes.

**Tech Stack:** Next.js 16.3.8, React 19, TypeScript, Tailwind CSS 4, Lucide React, Playwright.

---

### Task 1: Lock Selector Behavior And Presentation

**Files:**
- Modify: `e2e/site.spec.ts`

- [ ] **Step 1: Update the Solar test to require label-only group buttons**

Replace the count-based locators with:

```ts
const groupSelector = page.getByRole("group", {
  name: "Nhóm sản phẩm điện mặt trời",
});
const panelButton = groupSelector.getByRole("button", { name: "Tấm pin", exact: true });
const inverterButton = groupSelector.getByRole("button", { name: "Biến tần", exact: true });
const batteryButton = groupSelector.getByRole("button", { name: "Pin lưu trữ", exact: true });

await expect(panelButton).toHaveAttribute("aria-pressed", "true");
await expect(inverterButton).toHaveAttribute("aria-pressed", "false");
await expect(groupSelector).not.toContainText(/\b(?:5|8|7)\b/);
await expect(panelButton).toHaveCSS("background-color", "rgb(255, 196, 0)");
```

Keep the existing product-list count checks after each click.

- [ ] **Step 2: Update the computing test to require label-only group buttons**

Use:

```ts
const groupSelector = page.getByRole("group", {
  name: "Nhóm sản phẩm Laptop và PC",
});
const laptopButton = groupSelector.getByRole("button", { name: "Laptop", exact: true });
const desktopButton = groupSelector.getByRole("button", {
  name: "Máy tính để bàn",
  exact: true,
});
const printerButton = groupSelector.getByRole("button", { name: "Máy in", exact: true });

await expect(laptopButton).toHaveAttribute("aria-pressed", "true");
await expect(groupSelector).not.toContainText(/\b(?:15|4|12)\b/);
await expect(laptopButton).toHaveCSS("background-color", "rgb(255, 196, 0)");
```

Keep the existing 15, 4, and 12 product-card assertions.

- [ ] **Step 3: Add responsive layout assertions**

Inside each selector test, assert:

```ts
const columns = await groupSelector.evaluate(
  (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
);
expect(columns).toBe(testInfo.project.name === "mobile-edge" ? 1 : 3);
```

Accept `testInfo` in both Playwright test callbacks.

- [ ] **Step 4: Run the targeted tests and confirm RED**

Run:

```text
npx.cmd playwright test e2e/site.spec.ts --grep "danh mục điện mặt trời chia|Laptop và PC combines"
```

Expected: FAIL because the current selector still uses tab roles, numeric totals, and the old white bar.

### Task 2: Implement The Shared Prominent Selector

**Files:**
- Modify: `src/components/products/product-explorer.tsx`
- Test: `e2e/site.spec.ts`

- [ ] **Step 1: Add typed icon-led group definitions**

Import:

```ts
import {
  BatteryCharging,
  Laptop,
  Monitor,
  PanelsTopLeft,
  Printer,
  RotateCcw,
  Search,
  Zap,
  type LucideIcon,
} from "lucide-react";
```

Add:

```ts
type ProductGroupButton<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

const computingGroupButtons: ProductGroupButton<ComputingProductGroup>[] = [
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "desktop", label: "Máy tính để bàn", icon: Monitor },
  { id: "printer", label: "Máy in", icon: Printer },
];

const solarGroupIcons: Record<SolarProductGroup, LucideIcon> = {
  panel: PanelsTopLeft,
  inverter: Zap,
  battery: BatteryCharging,
};
```

- [ ] **Step 2: Add the focused local button-group component**

Add before `ProductExplorer`:

```tsx
function ProductGroupButtons<T extends string>({
  ariaLabel,
  activeGroup,
  buttons,
  onSelect,
}: {
  ariaLabel: string;
  activeGroup: T;
  buttons: ProductGroupButton<T>[];
  onSelect: (group: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="mb-6 grid grid-cols-1 gap-1.5 bg-[#0b0f12] p-1.5 sm:grid-cols-3"
    >
      {buttons.map(({ id, label, icon: Icon }) => {
        const selected = activeGroup === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(id)}
            className={`flex min-h-14 items-center justify-center gap-3 px-4 py-3 text-center text-sm font-extrabold transition-colors sm:min-h-18 ${
              selected
                ? "bg-[#ffc400] text-[#0b0f12]"
                : "bg-white text-[#37404a] hover:bg-[#fff2bd] hover:text-[#0b0f12]"
            } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc400]`}
          >
            <Icon size={22} strokeWidth={2.25} aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Replace both duplicated selectors**

Build Solar buttons from editable labels:

```ts
const solarGroupButtons = (["panel", "inverter", "battery"] as const).map(
  (group) => ({
    id: group,
    label: solarContent?.groups[group].label ?? solarProductGroupLabels[group],
    icon: solarGroupIcons[group],
  }),
);
```

Render:

```tsx
{showSolarGroups ? (
  <ProductGroupButtons
    ariaLabel="Nhóm sản phẩm điện mặt trời"
    activeGroup={activeSolarGroup}
    buttons={solarGroupButtons}
    onSelect={selectSolarGroup}
  />
) : null}
{showComputingGroups ? (
  <ProductGroupButtons
    ariaLabel="Nhóm sản phẩm Laptop và PC"
    activeGroup={
      filters.computingGroup === "all"
        ? initialComputingGroup
        : filters.computingGroup
    }
    buttons={computingGroupButtons}
    onSelect={selectComputingGroup}
  />
) : null}
```

Delete both count calculations and numeric `<span>` elements.

- [ ] **Step 4: Run targeted tests and confirm GREEN**

Run:

```text
npx.cmd playwright test e2e/site.spec.ts --grep "danh mục điện mặt trời chia|Laptop và PC combines"
```

Expected: both tests pass on desktop and mobile projects.

### Task 3: Full Verification And Visual Review

**Files:**
- Verify: `src/components/products/product-explorer.tsx`
- Verify: `e2e/site.spec.ts`

- [ ] **Step 1: Run static and unit verification**

```text
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Expected: all commands exit with code 0.

- [ ] **Step 2: Run the complete browser suite**

```text
npm.cmd run test:e2e
```

Expected: all applicable desktop/mobile tests pass.

- [ ] **Step 3: Capture final screenshots**

Capture `/danh-muc/laptop-pc` and `/danh-muc/dien-mat-troi` at `1440x900` and `390x844`.

Verify:

- The selector is visually separated from the notice and filters.
- The selected yellow button is immediately recognizable.
- Icons and labels remain aligned.
- No numeric totals appear inside the selector.
- Desktop uses three equal columns.
- Mobile uses one full-width button per row.
- Neither page has horizontal overflow.

- [ ] **Step 4: Record repository limitation**

This workspace has no `.git` metadata and Windows blocks `git.exe`, so commit steps cannot be performed. Preserve all changes in place and report this limitation.
