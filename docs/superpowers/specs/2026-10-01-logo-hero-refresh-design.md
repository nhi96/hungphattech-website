# Logo And Homepage Hero Refresh

## Goal

Replace the temporary HP text mark with the supplied red HP artwork and update the homepage hero to follow the approved solar technology composition while preserving HƯNG PHÁT TECH's truthful content and black-yellow visual identity.

## Approved Visual Direction

- Extract the white background from `Capture.png` and save a non-destructive transparent PNG in `public/images/`.
- Display the red HP monogram beside the existing HƯNG PHÁT TECH wordmark in the sticky header and footer.
- Use `solar_tech_banner_1790846538377.jpg` as the homepage hero background under a neutral project filename.
- Keep the main content left aligned over a charcoal overlay, with the solar panels visible on the right.
- Keep the verified Vietnamese headline, supporting copy, yellow primary call to action, and product discovery action.
- Present the four verified product categories in a translucent dock near the lower portion of the hero.
- Do not copy brands, performance figures, warranties, project counts, or commercial claims from the reference HTML.

## Responsive Behavior

- Desktop: full-width background, readable left copy, four-column category dock.
- Tablet: preserve the image focal point and allow the category dock to wrap without covering the call to action.
- Mobile: increase overlay strength, keep text and actions compact, and use a two-column category dock.
- On narrow or short screens, keep the dock in normal document flow below the main hero copy instead of allowing it to overlap calls to action.
- At desktop (1440x900), tablet (768x1024), and standard mobile (390x844), the layout must keep both calls to action visible, preserve the image focal point, avoid horizontal overflow, and show a hint of the next section. At short mobile (390x667), calls to action, no overlap, and no horizontal overflow take priority; the next-section hint is not required.
- Respect reduced-motion preferences; the hero does not require automatic animation.

## Assets And Ownership

- Source logo: `C:\Users\MR Toi\Desktop\hung lợi\Capture.png`
- Source hero reference asset: `C:\Users\MR Toi\.gemini\antigravity\brain\64dea48f-3dfa-4be3-a698-d645a2367041\scratch\solar_tech_banner_1790846538377.jpg`
- Project logo output: `public/images/hung-phat-logo-transparent.png`
- Project hero output: `public/images/hero-solar-technology.jpg`
- Source files remain unchanged.
- The user supplied and explicitly selected the local reference assets for this local prototype. Their reuse rights must be confirmed before public deployment; otherwise the hero must be replaced with a cleared equivalent.
- Inspect the full hero raster at desktop, tablet, and mobile crops. It must not contain readable third-party logos, brands, performance figures, warranties, or project claims.

## Accessibility

- Category links remain semantic links with a visible keyboard focus state.
- Text and controls in the translucent dock must meet WCAG AA contrast against representative image crops by using a sufficiently opaque charcoal surface and border.
- The linked brand has one accessible name. The decorative HP monogram image must not create a duplicate screen-reader announcement alongside the wordmark.

## Verification

- Confirm the generated logo has an alpha channel and transparent corner pixels.
- Inspect the entire red silhouette at rendered header and footer sizes over the actual charcoal backgrounds; no white matte or fringe may remain around its edges.
- Verify header branding and hero image load on desktop and mobile.
- Check that the hero reveals the next homepage section at 1440x900, 768x1024, and 390x844. Do not require that hint at the 390x667 short-mobile viewport.
- Confirm no reference brands or unsupported performance claims appear in the rendered page.
- Verify desktop, tablet, narrow-mobile, and short-mobile layouts for image crop, dock contrast, keyboard focus, call-to-action visibility, overlap, and horizontal overflow.
- Run unit tests, type checking, linting, production build, and Playwright tests.
