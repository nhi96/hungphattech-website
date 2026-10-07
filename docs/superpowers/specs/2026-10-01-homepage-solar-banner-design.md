# Homepage Solar Banner Design

## Goal

Update the homepage hero to match the supplied solar banner reference while preserving the website's existing navigation, page content, and information architecture.

## Scope

- Keep the existing navigation items: Trang chủ, Giới thiệu, Giải pháp, Sản phẩm, Dự án, Kiến thức, Liên hệ.
- Keep all existing routes and all homepage content below the hero unchanged.
- The existing hero content may be restyled and reorganized, but its meaning and verified claims must be preserved.
- Enlarge the HP logo mark in the site header.
- Change the displayed brand name from "HƯNG PHÁT TECH" to "HƯNG PHÁT".
- Redesign only the homepage hero using the supplied reference and image assets.

## Header

The existing global header structure remains in use. The HP image is rendered at 72 by 52 pixels on desktop and 64 by 46 pixels on smaller screens, replacing the current 55 by 40 presentation. The header keeps its current 80-pixel minimum height. The text lockup displays only "HƯNG PHÁT", and its accessible label is updated to match. Existing desktop navigation, mobile navigation, contact actions, and route links remain functional.

## Homepage Hero

The hero uses `tcl_panels_array.jpg` as a full-width background image. A dark left-to-right overlay maintains readable text while leaving the solar equipment visible on the right.

The content area reuses the website's verified copy and includes:

- Eyebrow: "Thiết bị và giải pháp công nghệ đa ngành".
- Headline: "GIẢI PHÁP CÔNG NGHỆ" with highlighted second line "CHO NGÔI NHÀ & DOANH NGHIỆP".
- Supporting copy: "Khám phá giải pháp điện mặt trời, camera giám sát, laptop, PC và khóa thông minh cùng Hưng Phát."
- Primary action "Nhận tư vấn" linking to `/lien-he#form-lien-he`.
- Secondary action "Khám phá sản phẩm" linking to `/san-pham`.
- Compact verified metrics: "04 - Danh mục chính", "02 - Hotline tư vấn", and "01 - Điểm tư vấn đa ngành".
- A floating showcase with four category cards using the existing category names and routes: Điện mặt trời, Camera giám sát, Laptop và PC, Khóa cửa thông minh. Every card is a link to its existing `/danh-muc/[slug]` route.

The reference's separate SolarTech navigation and background-style switcher are not included because the website already has its own navigation and the switcher is a demo control.

## Responsive Behavior

- At 1280 pixels and wider, hero copy stays on the left and the four-card showcase sits at the lower-right without covering the copy or metrics.
- From 768 through 1279 pixels, the showcase becomes a two-column grid below the hero copy in normal document flow.
- Below 768 pixels, the content is a vertical flow and category cards use a horizontal, touch-scrollable, snap-aligned row with a fixed card width of 168 pixels. Horizontal overflow is limited to the card row.
- The hero uses responsive minimum heights rather than a forced 100-viewport-height layout, so the next homepage section remains reachable and content cannot be clipped.

## Visual Direction

Use only the website's restrained black/charcoal, white, and warm yellow palette for interface surfaces and text. Headline emphasis, metrics, borders, and active accents use `#ffc400`; primary text and icons use white; backgrounds use neutral black and charcoal. Do not introduce cyan or additional accent hues. Preserve the existing site's typography and shared controls where practical. Use Lucide icons for interface actions and avoid decorative controls that do not perform a real action.

## Assets

Copy the source image from `C:\Users\MR Toi\.gemini\antigravity\brain\64dea48f-3dfa-4be3-a698-d645a2367041\scratch\tcl_panels_array.jpg` to `public/images/hero-solar-panels-array.jpg`. Use Next.js image handling for the full-bleed background. Do not depend on files outside the repository at runtime.

## Accessibility And Behavior

- Maintain semantic heading order.
- Ensure adequate contrast over the image.
- Keep links keyboard accessible with visible focus states.
- Respect reduced-motion preferences.
- All CTA buttons must navigate to valid existing routes.

## Verification

- Run type checking, linting, and relevant tests.
- Build the Next.js application.
- Verify the homepage at desktop and mobile viewport sizes.
- Confirm the banner image loads, text does not overlap, navigation remains intact, and header branding reads "HƯNG PHÁT".
