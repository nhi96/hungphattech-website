# Hưng Phát Wordmark Refresh

## Goal

Replace only the `HƯNG PHÁT` lettering in the shared header and footer brand mark with a more distinctive angular technology style.

## Scope

- Keep the red `HP` symbol unchanged.
- Keep `public/images/hung-phat-logo-transparent.png` byte-for-byte unchanged.
- Keep the existing header and footer layouts, logo dimensions, gap, placement, and overall proportions.
- Keep the wordmark white and uppercase.
- Change only the letterforms used for `HƯNG PHÁT`.

## Visual Direction

The new wordmark will use Chakra Petch at weight 700. Its compact, angular letterforms provide a clear technology character while preserving Vietnamese diacritics. The result should add emphasis without competing with the red `HP` symbol.

## Implementation

Load Chakra Petch through `next/font/google` with the Vietnamese subset and weight 700. Expose it as a dedicated CSS variable and apply it only to the wordmark `<span>` in the shared `BrandMark` component. This intentionally updates the same brand treatment in both the header and footer. Keep the existing font size, line height, color, content, image element, dimensions, and spacing unchanged.

The approved visual reference is `.artifacts/hung-phat-wordmark-preview.png`. It is rendered at twice the header scale for easier review.

## Validation

- Confirm the logo PNG has no content changes.
- Verify the header and footer at 1440x900 and 390x844 viewports.
- Confirm the wordmark remains white, uppercase, single-line, and aligned with the logo.
- Confirm `HƯNG PHÁT`, including both diacritics, remains readable at the mobile rendered size of 1rem.
- Compare the result with the approved preview.
- Run type checking, linting, and the relevant header/site tests.
