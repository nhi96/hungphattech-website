import { expect, test } from "@playwright/test";

test("trang chủ hiển thị thương hiệu Hưng Phát và banner mới", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("HƯNG PHÁT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("TECH", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: /GIẢI PHÁP CÔNG NGHỆ CHO NGÔI NHÀ & DOANH NGHIỆP/i,
    }),
  ).toBeVisible();

  const logo = page.locator('header img[src*="hung-phat-logo-transparent"]').first();
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("src", /hung-phat-logo-transparent/);
  await expect(logo).toHaveAttribute("alt", "");

  const heroImage = page.getByRole("img", { name: "Hệ thống pin năng lượng mặt trời" });
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
  await expect(page.locator('a[href="tel:0937100368"]:visible').first()).toBeVisible();
  await expect(page.locator('a[href="tel:0357985073"]').first()).toBeAttached();
});

test("banner dùng danh mục và số liệu đã xác minh", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator('[data-testid="home-hero"]');

  const metrics = hero.locator('[data-testid="hero-metric"]');
  await expect(metrics).toHaveCount(3);
  for (const metric of await metrics.all()) {
    await expect(metric).not.toHaveText("");
  }

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

test("banner chỉ dùng bảng màu chữ vàng trắng trên nền tối", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[data-testid="hero-highlight"]')).toHaveCSS(
    "color",
    "rgb(255, 196, 0)",
  );
  await expect(page.locator('[data-testid="hero-metric"]').first()).toHaveCSS(
    "color",
    "rgb(255, 196, 0)",
  );
  await expect(page.locator('[data-testid="home-hero"] h1')).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
});

test("section kinh nghiệm hiển thị hai ảnh doanh nghiệp và bỏ sản phẩm", async ({ page }) => {
  await page.goto("/");
  const section = page.getByTestId("experience-section");

  await expect(section).toBeVisible();
  await expect(section.getByText("Cửa hàng Hưng Phát")).toBeVisible();
  await expect(section.getByText("Đội ngũ công ty")).toBeVisible();
  await expect(section.locator("figure img")).toHaveCount(2);
  await expect(section.getByText("Chưa thêm ảnh")).toHaveCount(0);
  await expect(section.getByRole("link", { name: /Xem toàn bộ sản phẩm/i })).toHaveCount(0);
  await expect(section.locator("article")).toHaveCount(0);
});

test("ảnh kinh nghiệm trong bản nháp hiển thị dọc và không bị cắt", async ({ page }) => {
  await page.goto("/quan-tri/xem-truoc/home");
  const frames = page.getByTestId("experience-section").locator("figure > div");
  const images = frames.locator("img");

  await expect(images).toHaveCount(2);
  await expect(images.first()).toHaveCSS("object-fit", "contain");

  for (const frame of await frames.all()) {
    const box = await frame.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width / box!.height).toBeCloseTo(0.75, 1);
  }
});

test("mục công trình có bốn thẻ ảnh trên chữ dưới theo lưới responsive", async ({ page }, testInfo) => {
  await page.goto("/quan-tri/xem-truoc/home");
  const section = page.getByTestId("projects-section");
  const cards = section.getByTestId("project-card");

  await expect(section.getByRole("heading", { name: "Một số công trình nổi bật" })).toBeVisible();
  await expect(cards).toHaveCount(4);
  await expect(section.getByRole("link", { name: /Xem trạng thái trang dự án/i })).toHaveCount(0);

  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  const third = await cards.nth(2).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(third).not.toBeNull();
  if (testInfo.project.name === "desktop-edge") {
    expect(second!.y).toBeCloseTo(first!.y, 0);
    expect(third!.y).toBeGreaterThan(first!.y + first!.height);
  } else {
    expect(second!.y).toBeGreaterThan(first!.y + first!.height);
  }

  const imageBox = await cards.nth(0).getByTestId("project-image").boundingBox();
  const textBox = await cards.nth(0).getByTestId("project-text").boundingBox();
  expect(imageBox).not.toBeNull();
  expect(textBox).not.toBeNull();
  expect(textBox!.y).toBeGreaterThanOrEqual(imageBox!.y + imageBox!.height);
});

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

test("các tuyến chính hoạt động và không tràn ngang", async ({ page }) => {
  for (const path of [
    "/gioi-thieu",
    "/giai-phap",
    "/san-pham",
    "/danh-muc/dien-mat-troi",
    "/du-an",
    "/kien-thuc",
    "/lien-he",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow, `${path} không được tràn ngang`).toBe(false);
  }
});

test("danh sách sản phẩm lọc được và có trạng thái rỗng", async ({ page }) => {
  await page.goto("/san-pham");
  await expect(page.getByText("Thông tin sản phẩm tham khảo").first()).toBeVisible();

  await page.getByLabel("Tìm theo tên sản phẩm").fill("không có sản phẩm này");
  await expect(page.getByText("Không tìm thấy sản phẩm phù hợp")).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(page.getByText("Liên hệ báo giá").first()).toBeVisible();
});

test("biểu mẫu local không giả thông báo gửi thành công", async ({ page }) => {
  await page.goto("/lien-he");
  await page.getByLabel("Họ và tên").fill("Nguyễn Văn An");
  await page.getByLabel("Số điện thoại").fill("0937100368");
  await page.getByRole("button", { name: "Kiểm tra yêu cầu" }).click();

  await expect(
    page.getByText("Bản thử nghiệm: thông tin chưa được gửi tới doanh nghiệp."),
  ).toBeVisible();
  await expect(page.getByText("Đã gửi thành công")).toHaveCount(0);
});

test("form báo lỗi trợ năng và chuyển focus tới trường đầu tiên", async ({ page }) => {
  await page.goto("/lien-he");
  await page.getByRole("button", { name: "Kiểm tra yêu cầu" }).click();

  await expect(page.locator("#contact-error-summary")).toContainText("Vui lòng kiểm tra");
  await expect(page.getByLabel("Họ và tên")).toBeFocused();
});

test("xóa bộ lọc trên trang danh mục vẫn giữ phạm vi danh mục", async ({ page }) => {
  await page.goto("/danh-muc/dien-mat-troi");
  await expect(page.getByText("5 sản phẩm")).toBeVisible();
  await expect(page.getByLabel("Lọc theo danh mục")).toHaveCount(0);
  await page.getByLabel("Tìm theo tên sản phẩm").fill("không tồn tại");
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(page.getByText("5 sản phẩm")).toBeVisible();
});

test("lọc thương hiệu LONGi hiển thị đúng hai tấm pin", async ({ page }) => {
  await page.goto("/danh-muc/dien-mat-troi");
  await page.getByLabel("Lọc theo thương hiệu").selectOption("LONGi");

  await expect(page.getByText("2 sản phẩm")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: /LONGi 545W/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /LONGi 615W/i })).toBeVisible();
});

test("danh mục điện mặt trời chia đúng ba nhóm sản phẩm", async ({
  page,
}, testInfo) => {
  await page.goto("/danh-muc/dien-mat-troi");

  const groupSelector = page.getByRole("group", {
    name: "Nhóm sản phẩm điện mặt trời",
  });
  const panelTab = groupSelector.getByRole("button", {
    name: "Tấm pin",
    exact: true,
  });
  const inverterTab = groupSelector.getByRole("button", {
    name: "Biến tần",
    exact: true,
  });
  const batteryTab = groupSelector.getByRole("button", {
    name: "Pin lưu trữ",
    exact: true,
  });

  await expect(panelTab).toHaveAttribute("aria-pressed", "true");
  await expect(inverterTab).toHaveAttribute("aria-pressed", "false");
  await expect(groupSelector).not.toContainText(/\b(?:5|8|7)\b/);
  await expect(panelTab).toHaveCSS("background-color", "rgb(255, 196, 0)");
  const columns = await groupSelector.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(testInfo.project.name === "mobile-edge" ? 1 : 3);
  await expect(page.locator("article")).toHaveCount(5);

  await inverterTab.click();
  await expect(inverterTab).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("8 sản phẩm")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(8);

  await page.getByLabel("Lọc theo thương hiệu").selectOption("GoodWe");
  await expect(page.getByText("2 sản phẩm")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(2);

  await batteryTab.click();
  await expect(batteryTab).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Lọc theo thương hiệu")).toHaveValue("all");
  await expect(page.getByText("7 sản phẩm")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(7);

  await page.getByLabel("Lọc theo thương hiệu").selectOption("Deye");
  await expect(page.getByText("2 sản phẩm")).toBeVisible();
  await page.getByRole("button", { name: "Đặt lại bộ lọc" }).click();
  await expect(batteryTab).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("7 sản phẩm")).toBeVisible();
});

test("solar category renders published hero and active group introduction", async ({ page }) => {
  await page.goto("/danh-muc/dien-mat-troi");

  await expect(
    page.getByRole("heading", { level: 1, name: "Điện mặt trời" }),
  ).toBeVisible();
  await expect(page.getByTestId("solar-group-introduction")).toContainText(
    "Tấm pin năng lượng mặt trời",
  );

  await page.getByRole("button", { name: "Biến tần", exact: true }).click();
  await expect(page.getByTestId("solar-group-introduction")).toContainText(
    "Biến tần điện mặt trời",
  );
});

test("solar group introductions load images without horizontal overflow", async ({ page }) => {
  await page.goto("/danh-muc/dien-mat-troi");

  for (const name of [/Tấm pin/, /Biến tần/, /Pin lưu trữ/]) {
    await page.getByRole("button", { name }).click();
    const introduction = page.getByTestId("solar-group-introduction");
    const image = introduction.locator("img");
    await expect(introduction).toBeVisible();
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0 && element.naturalHeight > 0,
        ),
      )
      .toBe(true);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }
});

test("camera category renders editable content and 28 sourced products", async ({
  page,
}) => {
  await page.goto("/danh-muc/camera-giam-sat");

  await expect(
    page.getByRole("heading", { level: 1, name: "Camera giám sát" }),
  ).toBeVisible();
  await expect(page.getByTestId("category-introduction")).toContainText(
    "Giải pháp camera theo không gian sử dụng",
  );
  await expect(page.getByText("28 sản phẩm")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(28);
  await expect(page.getByText("Liên hệ báo giá").first()).toBeVisible();
  await expect(page.getByText("Dữ liệu minh họa")).toHaveCount(0);

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("Laptop và PC combines three computing groups and redirects legacy routes", async ({
  page,
}, testInfo) => {
  await page.goto("/danh-muc/laptop-pc");
  await expect(
    page.getByRole("heading", { level: 1, name: "Laptop và PC" }),
  ).toBeVisible();
  const groupSelector = page.getByRole("group", {
    name: "Nhóm sản phẩm Laptop và PC",
  });
  const laptopTab = groupSelector.getByRole("button", {
    name: "Laptop",
    exact: true,
  });
  const desktopTab = groupSelector.getByRole("button", {
    name: "Máy tính để bàn",
    exact: true,
  });
  const printerTab = groupSelector.getByRole("button", {
    name: "Máy in",
    exact: true,
  });

  await expect(laptopTab).toHaveAttribute("aria-pressed", "true");
  await expect(groupSelector).not.toContainText(/\b(?:15|4|12)\b/);
  await expect(laptopTab).toHaveCSS("background-color", "rgb(255, 196, 0)");
  const columns = await groupSelector.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(columns).toBe(testInfo.project.name === "mobile-edge" ? 1 : 3);
  await expect(page.locator("article")).toHaveCount(15);
  await expect(page.getByText("13.190.000 ₫").first()).toBeVisible();

  await desktopTab.click();
  await expect(page.locator("article")).toHaveCount(4);

  await printerTab.click();
  await expect(page.locator("article")).toHaveCount(12);
  await expect(page.getByText("Liên hệ báo giá").first()).toBeVisible();

  for (const oldPath of ["/danh-muc/laptop", "/danh-muc/may-tinh-de-ban", "/danh-muc/may-in"]) {
    await page.goto(oldPath);
    await expect(page).toHaveURL(/\/danh-muc\/laptop-pc$/);
  }

  await page.goto("/danh-muc/khoa-cua-thong-minh");
  await expect(page.locator("article")).toHaveCount(9);
  await expect(page.getByText("Liên hệ báo giá").first()).toBeVisible();
});

const solarEquipmentSlugs = [
  "bien-tan-goodwe-6kw-gw6000-es-20",
  "bien-tan-goodwe-20kw-gw20k-et-l-g10",
  "bien-tan-luxpower-6kw-trip2-lb-3p-6k",
  "bien-tan-luxpower-20kw-trip2-lb-3p-20k",
  "bien-tan-deye-6kw-sun-6k-sg06lp1-eu-bm2",
  "bien-tan-deye-20kw-sun-20k-sg01hp3-eu-am2",
  "bien-tan-sungrow-6kw-sh6-0rs",
  "bien-tan-sungrow-20kw-sh20t",
  "pin-luu-tru-lithium-valley-5-12kwh-lv-bat-w5-12da",
  "pin-luu-tru-lithium-valley-14-336kwh-w15-5a",
  "pin-luu-tru-deye-5-12kwh-se-g5-1-pro-b",
  "pin-luu-tru-deye-16kwh-rw-f16",
  "pin-luu-tru-hithium-8kwh-arkvolt-f8s",
  "pin-luu-tru-hithium-16kwh-heroee-16",
];

const referencePanelSlugs = [
  "tam-pin-longi-545w-lr5-72hbd-545m",
  "tam-pin-astronergy-540w-chsm72mdg-f-bh-540",
  "tam-pin-jinko-590w-jkm590n-72hl4-v",
  "tam-pin-longi-615w-lr8-66hgd-615m",
  "tam-pin-tcl-solar-630w-hsm-nd66-gr630",
];

test("năm tấm pin tham khảo có trang chi tiết, ảnh cục bộ và giá liên hệ", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");

  for (const slug of referencePanelSlugs) {
    const response = await request.get(`/san-pham/${slug}`);
    expect(response.status(), slug).toBe(200);

    await page.goto(`/san-pham/${slug}`);
    await expect(page.getByText("Liên hệ báo giá").first()).toBeVisible();
    await expect(page.getByText("Dữ liệu minh họa")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Đặc điểm", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Thông số kỹ thuật", exact: true })).toBeVisible();

    const image = page.locator('main img[src*="solar-panels"]').first();
    await expect(image).toBeVisible();
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("biến tần và pin lưu trữ có trang chi tiết cùng ảnh hãng cục bộ", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");

  for (const slug of solarEquipmentSlugs) {
    const response = await request.get(`/san-pham/${slug}`);
    expect(response.status(), slug).toBe(200);

    await page.goto(`/san-pham/${slug}`);
    await expect(page.getByText("Liên hệ báo giá").first()).toBeVisible();
    await expect(page.getByText("Dữ liệu minh họa")).toHaveCount(0);
    await expect(
      page.getByText(slug.startsWith("bien-tan-") ? "Biến tần" : "Pin lưu trữ", {
        exact: true,
      }).first(),
    ).toBeVisible();

    const image = page.locator('main img[src*="solar-"]').first();
    await expect(image).toBeVisible();
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("sản phẩm liên quan giữ cùng nhóm điện mặt trời", async ({ page }) => {
  for (const [slug, label] of [
    ["bien-tan-goodwe-6kw-gw6000-es-20", "Biến tần"],
    ["pin-luu-tru-deye-16kwh-rw-f16", "Pin lưu trữ"],
  ] as const) {
    await page.goto(`/san-pham/${slug}`);
    const related = page.getByRole("heading", { name: "Sản phẩm liên quan" }).locator("..");
    await expect(related.locator("article")).toHaveCount(3);
    await expect(related.locator("article").getByText(label, { exact: true })).toHaveCount(3);
  }
});

test("trang tấm pin không tràn ngang và tiêu đề nằm trong khung", async ({ page }) => {
  await page.goto("/san-pham/tam-pin-astronergy-540w-chsm72mdg-f-bh-540");

  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toBeVisible();
  const titleBox = await title.boundingBox();
  const titleParentBox = await title.locator("..").boundingBox();
  const viewport = page.viewportSize();
  expect(titleBox).not.toBeNull();
  expect(titleParentBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(titleBox!.x).toBeGreaterThanOrEqual(titleParentBox!.x);
  expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(
    Math.min(titleParentBox!.x + titleParentBox!.width, viewport!.width),
  );

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("menu mobile mở và điều hướng được", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-edge");
  await page.goto("/");
  await expect(page.locator('header a[href^="tel:"]')).toBeHidden();
  await page.getByRole("button", { name: "Mở menu" }).click();
  await expect(page.getByRole("navigation", { name: "Điều hướng di động" })).toBeVisible();
  await page.getByRole("link", { name: "Sản phẩm", exact: true }).last().click();
  await expect(page).toHaveURL(/\/san-pham$/);
});

test("hero để lộ phần nội dung kế tiếp trong viewport đầu", async ({ page }) => {
  await page.goto("/");
  const nextSection = page.locator('[data-testid="home-hero"] + div');
  const box = await nextSection.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y).toBeLessThan(viewport!.height);
});

test("ảnh sản phẩm tải được khi cuộn vào vùng nhìn thấy", async ({ page }) => {
  await page.goto("/san-pham");
  const images = page.locator("article img");
  const count = await images.count();

  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("slug sản phẩm không tồn tại trả về HTTP 404", async ({ request }) => {
  const response = await request.get("/san-pham/khong-ton-tai");
  expect(response.status()).toBe(404);
});
