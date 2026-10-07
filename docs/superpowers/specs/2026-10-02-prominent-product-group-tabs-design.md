# Prominent Product Group Tabs

## Goal

Redesign the three product-group selectors on the `Laptop và PC` and `Điện mặt trời` category pages so customers immediately recognize them as primary navigation and can select a group comfortably on desktop and mobile.

Remove the product totals displayed after every tab label. The result count below the filters remains unchanged.

## Chosen Direction

Use the approved high-contrast segmented block:

- A dark `#0b0f12` outer container visually separates the selector from the notice and filters.
- Three equal-width buttons appear in one row on desktop.
- Buttons stack into one column on narrow mobile viewports.
- The selected button uses the brand yellow `#ffc400` with black text.
- Unselected buttons use white with dark text and a pale-yellow hover state.
- Every button includes a Lucide icon followed by its text label.
- The selector keeps square corners to match the existing Hưng Phát interface.

This direction is more visible than the current thin white tab bar while staying within the established black, white, and yellow brand system.

## Labels And Icons

### Laptop And PC

| Group | Label | Icon |
| --- | --- | --- |
| `laptop` | `Laptop` | `Laptop` |
| `desktop` | `Máy tính để bàn` | `Monitor` |
| `printer` | `Máy in` | `Printer` |

### Solar

Solar labels continue to come from editable solar content, with the existing static labels as fallback.

| Group | Default label | Icon |
| --- | --- | --- |
| `panel` | `Tấm pin` | `PanelsTopLeft` |
| `inverter` | `Biến tần` | `Zap` |
| `battery` | `Pin lưu trữ` | `BatteryCharging` |

No tab renders a numeric total, badge, superscript, or hidden count.

## Component Design

Extract the duplicated Solar and computing tab markup from `ProductExplorer` into a focused local `ProductGroupTabs` component in the same file.

The component receives:

```ts
type ProductGroupTab<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type ProductGroupTabsProps<T extends string> = {
  ariaLabel: string;
  activeGroup: T;
  tabs: ProductGroupTab<T>[];
  onSelect: (group: T) => void;
};
```

It renders:

- A labeled `role="group"` container because this control filters one shared
  product region rather than switching between separate tab panels.
- Real `button` elements.
- `aria-pressed` for the active state.
- Existing group-selection behavior without changing filtering logic.
- Stable icon and text alignment without layout shifts.

Solar and computing group definitions remain typed constants near their existing labels. No new shared file is needed for this small presentation-only component.

## Responsive Behavior

- Desktop and tablet: `grid-cols-3`, equal-width buttons, minimum height `72px`.
- Mobile below the existing small breakpoint: `grid-cols-1`, minimum height `56px`.
- The component does not rely on horizontal scrolling.
- Long Vietnamese labels wrap inside their own button without overlapping another tab.
- Focus-visible styling uses a visible yellow/black outline appropriate to the active background.

## Unchanged Behavior

- Laptop remains the default computing group.
- Solar panels remain the default Solar group.
- Selecting a group still clears search and brand filters.
- Reset still preserves the active group.
- Product totals under the filter toolbar remain visible.
- Solar group introduction content and images continue changing with the active Solar tab.
- The general `/san-pham` explorer does not display group tabs.

## Testing

Update Playwright coverage to verify:

- Solar tabs are located by label only: `Tấm pin`, `Biến tần`, and `Pin lưu trữ`.
- Computing tabs are located by label only: `Laptop`, `Máy tính để bàn`, and `Máy in`.
- None of the six tabs contains a product total.
- The active group button exposes `aria-pressed="true"` and inactive buttons
  expose `aria-pressed="false"`.
- Selected tabs use the yellow active background and unselected tabs remain visually distinct.
- Clicking every tab still changes the product list to the expected size.
- The selector uses three columns on desktop and one column on mobile.
- Both category pages remain free of horizontal overflow.

Run unit tests, TypeScript, ESLint, the targeted desktop/mobile Playwright tests, the full Playwright suite, and the production build.

## Out Of Scope

- Changing product records, prices, filters, or category copy.
- Removing the filtered result count below the toolbar.
- Editing the category notice.
- Adding new Solar or computing groups.
- Changing the content editor.
