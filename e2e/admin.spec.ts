import { expect, test } from "@playwright/test";

test("content API lists homepage and solar editor pages", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");

  const response = await request.get("/api/admin/content");
  expect(response.ok()).toBe(true);
  const result = await response.json();

  expect(result.data.pages).toEqual([
    { id: "home", label: "Trang chủ" },
    { id: "solar", label: "Điện mặt trời" },
    { id: "camera", label: "Camera giám sát" },
  ]);
});

test("applies changes with the revision returned by draft save", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");

  const contentResponse = await page.request.get("/api/admin/content");
  const initial = (await contentResponse.json()).data;
  const savedRevision = initial.draft.draftRevision + 1;

  await page.route("**/api/admin/content/draft", async (route) => {
    const body = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          draft: {
            ...initial.draft,
            draftRevision: savedRevision,
            content: body.content,
          },
        },
      }),
    });
  });

  await page.route("**/api/admin/content/publish", async (route) => {
    const body = route.request().postDataJSON();
    if (body.expectedDraftRevision !== savedRevision) {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, code: "REVISION_CONFLICT" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          published: {
            schemaVersion: 1,
            publishedRevision: initial.publishedRevision + 1,
            content: initial.draft.content,
          },
          draft: {
            ...initial.draft,
            draftRevision: savedRevision + 1,
            basePublishedRevision: initial.publishedRevision + 1,
          },
        },
      }),
    });
  });

  await page.goto("/quan-tri");
  await page.getByRole("button", { name: "Banner trang chủ" }).click();
  await page.getByLabel("Tiêu đề chính").fill("NỘI DUNG KIỂM TRA REVISION");
  await page.getByRole("button", { name: "Áp dụng thay đổi" }).click();

  await expect(page.getByText("Đã lưu bản nháp")).toBeVisible();
  await expect(page.getByText("Xung đột phiên bản")).toHaveCount(0);
});

test("inspector exposes complete homepage fields and image positioning", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");

  await page.getByRole("button", { name: "Cài đặt chung" }).click();
  await expect(page.getByLabel("Ghi chú chân trang")).toBeVisible();
  await expect(page.getByLabel("Nhãn menu Trang chủ")).toBeVisible();

  await page.getByRole("button", { name: "Banner trang chủ" }).click();
  await expect(page.getByLabel("Giá trị số liệu 1")).toBeVisible();
  await expect(page.getByLabel("Nhãn số liệu 1")).toBeVisible();

  await page.getByRole("button", { name: "Theo nhu cầu", exact: true }).click();
  await expect(page.getByLabel("Nút liên kết")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề thẻ 1")).toBeVisible();
  await expect(page.getByLabel("Mô tả thẻ 1")).toBeVisible();

  await page.getByRole("button", { name: "Hình ảnh" }).click();
  await expect(page.getByLabel("Vị trí ngang Ảnh banner")).toBeVisible();
  await expect(page.getByLabel("Vị trí dọc Ảnh banner")).toBeVisible();
});

test("solar administration exposes hero notice and three group editors", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");
  await page.getByRole("button", { name: "Điện mặt trời", exact: true }).click();

  await expect(
    page.getByRole("button", { name: "Banner điện mặt trời" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Thông báo sản phẩm" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Tấm pin", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Biến tần", exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pin lưu trữ", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Tấm pin", exact: true }).click();
  await expect(page.getByLabel("Tên tab")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề nhóm")).toBeVisible();
  await expect(page.getByLabel("Mô tả nhóm")).toBeVisible();
  await expect(page.getByLabel("Alt ảnh Tấm pin")).toBeVisible();
  await expect(page.getByLabel("Tải ảnh Tấm pin")).toBeVisible();
});

test("camera administration follows solar and exposes complete fields", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");

  const pageButtons = page.locator("aside").first().locator("div").first().locator("button");
  await expect(pageButtons).toHaveCount(3);
  await expect(pageButtons.nth(1)).toHaveText("Điện mặt trời");
  await expect(pageButtons.nth(2)).toHaveText("Camera giám sát");

  await page.getByRole("button", { name: "Camera giám sát", exact: true }).click();
  await expect(page.getByRole("button", { name: "Banner camera" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Thông báo sản phẩm" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Giới thiệu danh mục" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Giới thiệu danh mục" }).click();
  await expect(page.getByLabel("Nhãn nhỏ")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề giới thiệu")).toBeVisible();
  await expect(page.getByLabel("Mô tả giới thiệu")).toBeVisible();
  await expect(page.getByLabel("Alt ảnh Giới thiệu camera")).toBeVisible();
  await expect(page.getByLabel("Tải ảnh Giới thiệu camera")).toBeVisible();
});

test("camera draft preview keeps introduction isolated from homepage and solar", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");

  const initialResponse = await page.request.get("/api/admin/content");
  const initial = (await initialResponse.json()).data;
  const changedTitle = `GIỚI THIỆU CAMERA ${Date.now()}`;

  try {
    await page.goto("/quan-tri");
    await page.getByRole("button", { name: "Camera giám sát", exact: true }).click();
    await page.getByRole("button", { name: "Giới thiệu danh mục" }).click();

    const introImage = page.locator("aside").last().locator("img").first();
    const initialIntroImage = await introImage.getAttribute("src");
    const titleSaved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/content/draft") &&
        response.request().method() === "PUT" &&
        response.ok(),
    );
    await page.getByLabel("Tiêu đề giới thiệu").fill(changedTitle);
    await titleSaved;
    await expect(page.getByText("Đã lưu bản nháp")).toBeVisible();

    await expect(
      page.frameLocator('iframe[title="Xem trước website"]').getByRole("heading", {
        name: changedTitle,
      }),
    ).toBeVisible();

    const uploadFinished = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/assets") &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    const imageSaved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/content/draft") &&
        response.request().method() === "PUT" &&
        response.ok(),
    );
    await page.getByLabel("Tải ảnh Giới thiệu camera").setInputFiles(
      "public/images/category-camera.png",
    );
    await uploadFinished;
    await imageSaved;
    await expect(introImage).not.toHaveAttribute("src", initialIntroImage!);

    await page.getByRole("button", { name: "Điện mặt trời", exact: true }).click();
    await page.getByRole("button", { name: "Tấm pin", exact: true }).click();
    await expect(page.getByLabel("Tiêu đề nhóm")).toHaveValue(
      initial.draft.content.pages.solar.groups.panel.title,
    );
  } finally {
    const currentResponse = await page.request.get("/api/admin/content");
    const current = (await currentResponse.json()).data;
    const restore = await page.request.put("/api/admin/content/draft", {
      headers: {
        origin: "http://127.0.0.1:3000",
        "content-type": "application/json",
      },
      data: {
        content: initial.draft.content,
        expectedDraftRevision: current.draft.draftRevision,
      },
    });
    expect(restore.ok()).toBe(true);
  }
});

test("solar draft preview keeps group content and images isolated", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");

  const initialResponse = await page.request.get("/api/admin/content");
  const initialDraft = (await initialResponse.json()).data.draft;
  const changedTitle = `TẤM PIN KIỂM TRA ${Date.now()}`;

  try {
    await page.goto("/quan-tri");
    await page.getByRole("button", { name: "Điện mặt trời", exact: true }).click();
    await page.getByRole("button", { name: "Tấm pin", exact: true }).click();

    const panelImage = page.locator("aside").last().locator("img").first();
    const initialPanelImage = await panelImage.getAttribute("src");

    const titleSaved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/content/draft") &&
        response.request().method() === "PUT" &&
        response.ok(),
    );
    await page.getByLabel("Tiêu đề nhóm").fill(changedTitle);
    await titleSaved;
    await expect(page.getByText("Đã lưu bản nháp")).toBeVisible();

    const preview = page.frameLocator('iframe[title="Xem trước website"]');
    await expect(
      preview.getByRole("heading", { name: changedTitle }),
    ).toBeVisible();

    const uploadFinished = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/assets") &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    const imageSaved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/content/draft") &&
        response.request().method() === "PUT" &&
        response.ok(),
    );
    await page
      .getByLabel("Tải ảnh Tấm pin")
      .setInputFiles("public/images/category-camera.png");
    await uploadFinished;
    await imageSaved;
    await expect(panelImage).not.toHaveAttribute("src", initialPanelImage!);

    await page.getByRole("button", { name: "Biến tần", exact: true }).click();
    await expect(page.getByLabel("Tiêu đề nhóm")).toHaveValue(
      initialDraft.content.pages.solar.groups.inverter.title,
    );
    await expect(
      page.frameLocator('iframe[title="Xem trước website"]').getByRole("heading", {
        name: initialDraft.content.pages.solar.groups.inverter.title,
      }),
    ).toBeVisible();
  } finally {
    const currentResponse = await page.request.get("/api/admin/content");
    const currentDraft = (await currentResponse.json()).data.draft;
    const restoreResponse = await page.request.put("/api/admin/content/draft", {
      headers: {
        origin: "http://127.0.0.1:3000",
        "content-type": "application/json",
      },
      data: {
        content: initialDraft.content,
        expectedDraftRevision: currentDraft.draftRevision,
      },
    });
    expect(restoreResponse.ok()).toBe(true);
  }
});

test("quản trị kinh nghiệm có hai vị trí ảnh độc lập", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");

  await page.getByRole("button", { name: "Kinh nghiệm Hưng Phát", exact: true }).click();
  await expect(page.getByLabel("Tên ảnh Cửa hàng Hưng Phát")).toBeVisible();
  await expect(page.getByLabel("Alt ảnh Cửa hàng Hưng Phát")).toBeVisible();
  await expect(page.getByLabel("Tải ảnh Cửa hàng Hưng Phát")).toBeVisible();
  await expect(page.getByLabel("Vị trí ngang Cửa hàng Hưng Phát")).toBeVisible();
  await expect(page.getByLabel("Vị trí dọc Cửa hàng Hưng Phát")).toBeVisible();

  await expect(page.getByLabel("Tên ảnh Đội ngũ công ty")).toBeVisible();
  await expect(page.getByLabel("Alt ảnh Đội ngũ công ty")).toBeVisible();
  await expect(page.getByLabel("Tải ảnh Đội ngũ công ty")).toBeVisible();
});

test("ảnh cửa hàng lưu độc lập với ảnh đội ngũ", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");
  await page.getByRole("button", { name: "Kinh nghiệm Hưng Phát", exact: true }).click();

  const storeImage = page.getByTestId("experience-editor-store").locator("img");
  const teamImage = page.getByTestId("experience-editor-team").locator("img");
  const initialStoreSrc = await storeImage.getAttribute("src");
  const initialTeamSrc = await teamImage.getAttribute("src");
  let uploaded = false;

  try {
    const draftSaved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/content/draft") &&
        response.request().method() === "PUT" &&
        response.ok(),
    );
    await page.getByLabel("Tải ảnh Cửa hàng Hưng Phát").setInputFiles(
      "public/images/category-camera.png",
    );
    await draftSaved;
    uploaded = true;
    await page.reload();
    await page.getByRole("button", { name: "Kinh nghiệm Hưng Phát", exact: true }).click();

    await expect(page.getByTestId("experience-editor-store").locator("img")).not.toHaveAttribute(
      "src",
      initialStoreSrc!,
    );
    await expect(page.getByTestId("experience-editor-team").locator("img")).toHaveAttribute(
      "src",
      initialTeamSrc!,
    );
  } finally {
    if (uploaded) {
      const resetFinished = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/admin/content/reset") &&
          response.request().method() === "POST" &&
          response.ok(),
      );
      await page.getByRole("button", { name: "Khôi phục" }).click();
      await resetFinished;
    }
  }
});

test("quản trị dự án có bốn công trình chỉnh sửa độc lập", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");
  await page.getByRole("button", { name: "Dự án", exact: true }).click();

  for (let index = 1; index <= 4; index += 1) {
    const panel = page.getByTestId(`project-editor-project-${index}`);
    await expect(panel).toBeVisible();
    await expect(page.getByLabel(`Tiêu đề công trình ${index}`)).toBeVisible();
    await expect(page.getByLabel(`Mô tả công trình ${index}`)).toBeVisible();
    await expect(page.getByLabel(`Alt ảnh công trình ${index}`)).toBeVisible();
    await expect(page.getByLabel(`Vị trí ngang công trình ${index}`)).toBeVisible();
    await expect(page.getByLabel(`Vị trí dọc công trình ${index}`)).toBeVisible();
    await expect(page.getByLabel(`Tải ảnh công trình ${index}`)).toBeVisible();
  }
});

test("replaces the hero image and can reset the draft", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");
  await page.getByRole("button", { name: "Hình ảnh" }).click();

  const heroImage = page.locator("aside").last().locator("img").first();
  const initialSrc = await heroImage.getAttribute("src");
  await page.locator('input[type="file"]').first().setInputFiles(
    "public/images/category-camera.png",
  );
  await expect(heroImage).not.toHaveAttribute("src", initialSrc!);
  await expect(page.getByText("Đã lưu bản nháp")).toBeVisible({ timeout: 10_000 });

  const resetFinished = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/admin/content/reset") &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await page.getByRole("button", { name: "Khôi phục" }).click();
  await resetFinished;
  await expect(heroImage).toHaveAttribute("src", initialSrc!);
});

test("moves homepage sections with explicit arrow controls", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-edge");
  await page.goto("/quan-tri");

  const navigator = page.locator("aside").first();
  const sectionButtons = navigator.locator("div.flex.items-center.gap-1 > button:first-child");
  const firstLabel = (await sectionButtons.nth(0).textContent())!.trim();
  const secondLabel = (await sectionButtons.nth(1).textContent())!.trim();

  await page.getByRole("button", { name: `Đưa ${firstLabel} xuống` }).click();
  await expect(sectionButtons.nth(0)).toHaveText(secondLabel);
  await expect(sectionButtons.nth(1)).toHaveText(firstLabel);

  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(sectionButtons.nth(0)).toHaveText(firstLabel);
  await expect(sectionButtons.nth(1)).toHaveText(secondLabel);
});

test("trình quản trị sửa banner và cập nhật preview draft", async ({ page }, testInfo) => {
  await page.goto("/quan-tri");

  await expect(page.getByRole("heading", { name: "Trình quản trị nội dung" })).toBeVisible();
  if (testInfo.project.name === "mobile-edge") {
    await page.getByRole("button", { name: "Nội dung" }).click();
  }
  await page.getByRole("button", { name: "Banner trang chủ" }).click();
  if (testInfo.project.name === "mobile-edge") {
    await page.getByRole("button", { name: "Chỉnh sửa" }).click();
  }

  const title = page.getByLabel("Tiêu đề chính");
  const original = await title.inputValue();
  await title.fill("GIẢI PHÁP CÔNG NGHỆ MỚI");
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByText("Đã lưu bản nháp")).toBeVisible();

  if (testInfo.project.name === "mobile-edge") {
    await page.getByRole("button", { name: "Xem trước" }).click();
  }
  const preview = page.frameLocator('iframe[title="Xem trước website"]');
  await expect(
    preview.getByRole("heading", { name: /GIẢI PHÁP CÔNG NGHỆ MỚI/i }),
  ).toBeVisible();

  if (testInfo.project.name === "mobile-edge") {
    await page.getByRole("button", { name: "Chỉnh sửa" }).click();
  }
  await title.fill(original);
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByText("Đã lưu bản nháp")).toBeVisible();
});

test("trình quản trị đổi chế độ xem desktop và mobile", async ({ page }) => {
  await page.goto("/quan-tri");
  const preview = page.locator('iframe[title="Xem trước website"]');

  await page.getByRole("button", { name: "Xem mobile" }).click();
  await expect(preview).toHaveAttribute("data-viewport", "mobile");

  await page.getByRole("button", { name: "Xem desktop" }).click();
  await expect(preview).toHaveAttribute("data-viewport", "desktop");
});

test("thanh công cụ quản trị không bị cắt trên mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-edge");
  await page.goto("/quan-tri");

  const heading = page.getByRole("heading", { name: "Trình quản trị nội dung" });
  const headingBox = await heading.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(headingBox!.width).toBeGreaterThan(180);
  await expect(page.getByRole("button", { name: "Áp dụng thay đổi" })).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("solar administration remains usable on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-edge");
  await page.goto("/quan-tri");

  await page.getByRole("button", { name: "Nội dung" }).click();
  await page.getByRole("button", { name: "Điện mặt trời", exact: true }).click();
  await page.getByRole("button", { name: "Pin lưu trữ", exact: true }).click();
  await page.getByRole("button", { name: "Chỉnh sửa" }).click();

  await expect(page.getByLabel("Tên tab")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề nhóm")).toBeVisible();
  await expect(page.getByLabel("Mô tả nhóm")).toBeVisible();
  await expect(page.getByLabel("Alt ảnh Pin lưu trữ")).toBeVisible();
  await expect(page.getByLabel("Tải ảnh Pin lưu trữ")).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("camera administration remains usable on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-edge");
  await page.goto("/quan-tri");

  await page.getByRole("button", { name: "Nội dung" }).click();
  await page.getByRole("button", { name: "Camera giám sát", exact: true }).click();
  await page.getByRole("button", { name: "Giới thiệu danh mục" }).click();
  await page.getByRole("button", { name: "Chỉnh sửa" }).click();

  await expect(page.getByLabel("Tiêu đề giới thiệu")).toBeVisible();
  await expect(page.getByLabel("Tải ảnh Giới thiệu camera")).toBeVisible();
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});
