# Hưng Phát Tech Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng website Next.js tiếng Việt, responsive và chạy local cho HƯNG PHÁT TECH với đầy đủ trang, dữ liệu sản phẩm minh họa, bộ lọc và biểu mẫu thử nghiệm.

**Architecture:** Next.js App Router render các trang nội dung từ dữ liệu TypeScript cục bộ. Component server được ưu tiên; client component chỉ dùng cho menu, bộ lọc sản phẩm và biểu mẫu. Mọi dữ liệu minh họa có cờ và nhãn hiển thị bắt buộc.

**Tech Stack:** Next.js, React, TypeScript strict, Tailwind CSS, Lucide React, Vitest, Testing Library, Playwright.

---

## File Map

- `src/app/`: route, metadata, loading, error và 404.
- `src/components/layout/`: header, footer, mobile call bar.
- `src/components/home/`: các section trang chủ.
- `src/components/products/`: card, grid, filters, gallery và related products.
- `src/components/contact/`: contact form và validation UI.
- `src/config/company.ts`: dữ liệu doanh nghiệp đã xác thực.
- `src/data/*.ts`: danh mục và nội dung demo.
- `src/lib/*.ts`: lọc sản phẩm, validation và metadata helpers.
- `src/types/content.ts`: hợp đồng dữ liệu.
- `public/images/`: ảnh bitmap minh họa tự tạo.
- `tests/`: unit/integration tests.
- `e2e/`: smoke và viewport tests.

### Task 1: Khởi tạo nền tảng và bộ kiểm thử

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `src/app/globals.css`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Khởi tạo Next.js TypeScript/Tailwind bằng CLI ổn định**

Run:
```powershell
cmd /c npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Expected: dự án được tạo nhưng giữ nguyên `docs/` và `.superpowers/`.

- [ ] **Step 2: Cài thư viện kiểm thử và icon**

Run:
```powershell
cmd /c npm install lucide-react
cmd /c npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react playwright
```

- [ ] **Step 3: Cấu hình script**

`package.json` phải có:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 4: Chạy baseline**

Run:
```powershell
cmd /c npm run lint
cmd /c npm run build
```

Expected: exit code `0`.

### Task 2: Hợp đồng dữ liệu và logic sản phẩm theo TDD

**Files:**
- Create: `src/types/content.ts`
- Create: `src/config/company.ts`
- Create: `src/data/categories.ts`
- Create: `src/data/products.demo.ts`
- Create: `src/lib/product-filter.ts`
- Test: `tests/product-filter.test.ts`

- [ ] **Step 1: Viết test thất bại cho tìm kiếm, lọc, brand và tên**

```ts
expect(filterProducts(products, { query: "camera", category: "all", brand: "all", sort: "name-asc" }))
  .toHaveLength(1);
expect(filterProducts(products, { query: "", category: "camera-giam-sat", brand: "DemoCam", sort: "name-asc" }))
  .toHaveLength(1);
expect(filterProducts(products, { query: "", category: "all", brand: "all", sort: "name-desc" })[0].name)
  .toBe("Khóa mẫu");
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `cmd /c npm test -- tests/product-filter.test.ts`

Expected: FAIL vì module chưa tồn tại.

- [ ] **Step 3: Tạo types, dữ liệu 12 sản phẩm và hàm lọc tối thiểu**

`Product` phải có `isDemo: true`, `price: null`, `categorySlug`, `brand`, `features`, `specifications`, `images`.

- [ ] **Step 4: Chạy test và xác nhận GREEN**

Run: `cmd /c npm test -- tests/product-filter.test.ts`

Expected: PASS.

### Task 3: Validation biểu mẫu theo TDD

**Files:**
- Create: `src/lib/contact-validation.ts`
- Test: `tests/contact-validation.test.ts`

- [ ] **Step 1: Viết test thất bại**

```ts
expect(validateContact({ name: "", phone: "", category: "", message: "" }).name).toBeTruthy();
expect(validateContact({ name: "An", phone: "abc", category: "", message: "" }).phone).toBeTruthy();
expect(validateContact({ name: "Nguyễn Văn An", phone: "0937100368", category: "camera-giam-sat", message: "" }))
  .toEqual({});
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `cmd /c npm test -- tests/contact-validation.test.ts`

- [ ] **Step 3: Cài đặt validation không lưu hoặc gửi dữ liệu**

Chuẩn hóa khoảng trắng; yêu cầu họ tên tối thiểu 2 ký tự; điện thoại Việt Nam chấp nhận khoảng trắng/dấu chấm nhưng phải có 10 chữ số và bắt đầu bằng `0`.

- [ ] **Step 4: Chạy test và xác nhận GREEN**

Run: `cmd /c npm test -- tests/contact-validation.test.ts`

### Task 4: Layout, hệ thống thiết kế và ảnh minh họa

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/site-header.tsx`
- Create: `src/components/layout/site-footer.tsx`
- Create: `src/components/layout/mobile-call-bar.tsx`
- Create: `src/components/ui/demo-badge.tsx`
- Create: `public/images/*.webp`

- [ ] **Step 1: Viết integration test thất bại cho header/footer**

Test phải kiểm tra thương hiệu, đúng hai `tel:` và nút menu có accessible name.

- [ ] **Step 2: Chạy test và xác nhận RED**

- [ ] **Step 3: Cài đặt layout**

Header sticky không che anchor; desktop navigation rõ; mobile drawer đóng bằng Escape; footer có đúng tên công ty, hai số điện thoại và địa chỉ.

- [ ] **Step 4: Tạo ảnh bitmap minh họa**

Dùng công cụ image generation hoặc tài sản tự tạo hợp lệ cho hero và bốn ngành hàng; không dùng ảnh dự án của đơn vị khác.

- [ ] **Step 5: Chạy integration test và xác nhận GREEN**

### Task 5: Trang chủ và các trang nội dung

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/gioi-thieu/page.tsx`
- Create: `src/app/giai-phap/page.tsx`
- Create: `src/app/du-an/page.tsx`
- Create: `src/app/kien-thuc/page.tsx`
- Create: `src/app/lien-he/page.tsx`
- Create: `src/components/home/*.tsx`
- Create: `src/components/contact/contact-form.tsx`

- [ ] **Step 1: Viết test thất bại cho nội dung quan trọng**

Kiểm tra hero copy chính xác, quy trình có nhãn cần xác nhận, trang dự án không có số liệu/công trình giả, form có thông báo thử nghiệm.

- [ ] **Step 2: Chạy test và xác nhận RED**

- [ ] **Step 3: Cài đặt các trang và section**

Trang chủ theo hướng showroom đen-vàng, section sản phẩm nền sáng, hình ảnh lớn nhưng không làm hero thành slideshow. Form submit hợp lệ chỉ hiển thị: “Bản thử nghiệm: thông tin chưa được gửi tới doanh nghiệp.”

- [ ] **Step 4: Chạy test và xác nhận GREEN**

### Task 6: Danh sách, danh mục và chi tiết sản phẩm

**Files:**
- Create: `src/app/san-pham/page.tsx`
- Create: `src/app/san-pham/[slug]/page.tsx`
- Create: `src/app/danh-muc/[slug]/page.tsx`
- Create: `src/components/products/product-explorer.tsx`
- Create: `src/components/products/product-card.tsx`
- Create: `src/components/products/product-gallery.tsx`
- Test: `tests/product-ui.test.tsx`

- [ ] **Step 1: Viết test thất bại**

Kiểm tra mọi card có “Sản phẩm minh họa trong bản local”, giá rỗng hiển thị “Liên hệ báo giá”, empty state có nút “Xóa bộ lọc”, trang chi tiết có gọi điện và sản phẩm liên quan.

- [ ] **Step 2: Chạy test và xác nhận RED**

- [ ] **Step 3: Cài đặt product explorer và route động**

Bộ lọc đồng bộ state phía client, không có sort giá, brand chỉ hiện khi có dữ liệu; `generateStaticParams` tạo route cho 12 sản phẩm và bốn danh mục.

- [ ] **Step 4: Chạy test và xác nhận GREEN**

### Task 7: Metadata, JSON-LD và trạng thái hệ thống

**Files:**
- Create: `src/lib/metadata.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/not-found.tsx`
- Create: `src/app/loading.tsx`
- Create: `src/app/error.tsx`
- Test: `tests/metadata.test.ts`

- [ ] **Step 1: Viết test thất bại**

Kiểm tra robots luôn `noindex, nofollow` ở local; schema chỉ có tên, telephone và PostalAddress; không có email, rating, priceRange, openingHours hoặc URL local.

- [ ] **Step 2: Chạy test và xác nhận RED**

- [ ] **Step 3: Cài đặt metadata và fallback UI**

Mỗi route có title/description; error có nút thử lại; 404 có link về trang chủ và sản phẩm.

- [ ] **Step 4: Chạy test và xác nhận GREEN**

### Task 8: Kiểm tra trình duyệt, build và chạy local

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/site.spec.ts`

- [ ] **Step 1: Viết smoke test**

Test các route chính, mobile menu, bộ lọc không kết quả/xóa bộ lọc, đúng `tel:`, form không gọi request ngoài, no horizontal overflow ở `390x844`, `768x1024`, `1440x900`.

- [ ] **Step 2: Chạy test và sửa lỗi đến khi pass**

Run:
```powershell
cmd /c npm test
cmd /c npm run typecheck
cmd /c npm run lint
cmd /c npm run build
cmd /c npx playwright test
```

- [ ] **Step 3: Kiểm tra ảnh chụp desktop/mobile**

Xác nhận hero, header sticky, card, form và mobile call bar không chồng lấn; ảnh không vỡ; chữ không tràn.

- [ ] **Step 4: Chạy máy chủ local**

Run:
```powershell
cmd /c npm run dev -- --hostname 0.0.0.0 --port 3000
```

Nếu cổng 3000 bận, dùng cổng trống tiếp theo và báo chính xác URL.
