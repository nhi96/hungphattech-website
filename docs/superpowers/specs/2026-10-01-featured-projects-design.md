# Featured Projects Section Design

## Goal

Replace the single empty-state project panel on the homepage with four editable project cards. The section title becomes `Một số công trình nổi bật`, removing the company-name suffix.

## Public Layout

- Keep the existing section ID, index `04`, eyebrow, description, style, and position in the homepage section order.
- Render exactly four project cards.
- Use a two-column grid on tablet and desktop so the cards appear as two cards per row and two rows.
- Use one column on mobile.
- Each card contains:
  - A `4:3` image area at the top.
  - A text area below with a project title and description.
- When no image exists, show a restrained dashed empty state labeled `Chưa thêm ảnh`.
- When title or description is empty, show neutral display placeholders so the reserved text area remains visible.
- Remove the old single dashed project panel and its `/du-an` button.
- Use the existing black, white, and yellow visual system.

## Content Model

Replace the legacy `cardTitle`, `cardDescription`, and `buttonLabel` fields with a fixed `items` array of four entries:

```ts
{
  id: "project-1" | "project-2" | "project-3" | "project-4";
  title: string;
  description: string;
  alt: string;
  image: {
    assetId: string | null;
    focalX: "left" | "center" | "right";
    focalY: "top" | "center" | "bottom";
  };
}
```

The schema migration converts legacy project sections into four empty items while preserving the section heading fields. During migration, the title is normalized to `Một số công trình nổi bật` only when it exactly equals `Một số công trình nổi bật của Công ty TNHH Thiết bị Công nghệ Hưng Phát`. Any other user-edited title remains unchanged.

Empty project titles, descriptions, alt text, and null asset IDs are schema-valid so the owner can fill each card later.

All non-null project asset references must exist in `content.assets`.

## Editor

The `Dự án` inspector shows four independent project panels. Each panel provides:

- Image preview or empty image state.
- Image upload/replacement.
- Project title input.
- Project description textarea.
- Alt text input.
- Horizontal and vertical image-position controls.

Uploading an image updates only the selected project item and reuses the existing asset upload pipeline. The four item IDs and order remain fixed.

## Runtime Data

Before changing runtime data, compare the current draft content with the current published content:

- If they match, migrate the draft and publish it through the repository so revision history remains valid.
- If they differ, preserve the unpublished draft and do not auto-publish unrelated edits. Apply the project migration independently to published content and merge the same project-section shape into the draft without changing other draft fields.

In both cases, verify that every non-project field is unchanged.

## Testing

- Schema tests cover legacy migration, fixed item order, and unknown asset rejection.
- Public E2E verifies the new title, four cards, responsive two-column layout, image-above-text structure, and removal of the old button.
- Admin E2E verifies four independent editor panels, text fields, alt fields, focal-position controls, upload isolation, save/reload behavior, and publish behavior.
- Run unit tests, typecheck, lint, build, and the complete E2E suite.
- Capture desktop and mobile screenshots for visual inspection.
