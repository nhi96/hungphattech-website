import assert from "node:assert/strict";
import { describe, it } from "node:test";
import seed from "../.content/default-content.json" with { type: "json" };
import {
  createDraftFromPublished,
  parsePublishedEnvelope,
} from "../src/lib/content/content-schema.ts";

describe("content schema", () => {
  it("chấp nhận nội dung seed và tạo draft có revision độc lập", () => {
    const published = parsePublishedEnvelope(seed);
    const draft = createDraftFromPublished(published);

    assert.equal(published.content.site.brandName, "HƯNG PHÁT");
    assert.equal(draft.basePublishedRevision, published.publishedRevision);
    assert.equal(draft.draftRevision, 0);
  });

  it("từ chối token kích thước chữ không hỗ trợ", () => {
    const invalid = structuredClone(seed);
    invalid.content.pages.home.hero.style.titleSize = "giant";

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("từ chối ID section bị trùng", () => {
    const invalid = structuredClone(seed);
    invalid.content.pages.home.sectionOrder = ["hero", "hero"];

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("từ chối asset tham chiếu không tồn tại", () => {
    const invalid = structuredClone(seed);
    invalid.content.pages.home.hero.image.assetId = "missing";

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("chuyển section sản phẩm cũ thành hai ảnh kinh nghiệm cố định", () => {
    const legacy = structuredClone(seed);
    delete (legacy.content.pages.home.sections.featured as Record<string, unknown>).images;
    const published = parsePublishedEnvelope(legacy);
    const experience = published.content.pages.home.sections.featured;

    assert.equal(experience.eyebrow, "Kinh nghiệm Hưng Phát");
    assert.deepEqual(
      experience.images.map((image) => image.id),
      ["store", "team"],
    );
    assert.equal(experience.images[0].label, "Cửa hàng Hưng Phát");
    assert.equal(experience.images[1].label, "Đội ngũ công ty");
    assert.equal(experience.images[0].alt, "Cửa hàng Hưng Phát");
    assert.equal(experience.images[1].alt, "Đội ngũ công ty Hưng Phát");
    assert.equal(experience.images[0].image.assetId, null);
    assert.equal(experience.images[1].image.assetId, null);
    assert.equal(experience.images[0].image.focalX, "center");
    assert.equal(experience.images[1].image.focalY, "center");
  });

  it("từ chối ảnh kinh nghiệm tham chiếu asset không tồn tại", () => {
    const migrated = parsePublishedEnvelope(seed);
    const invalid = structuredClone(migrated);
    invalid.content.pages.home.sections.featured.images[0].image = {
      assetId: "missing",
      focalX: "center",
      focalY: "center",
    };

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("chuyển section dự án cũ thành bốn công trình trống cố định", () => {
    const legacy = structuredClone(seed);
    delete (legacy.content.pages.home.sections.projects as Record<string, unknown>).items;
    legacy.content.pages.home.sections.projects.title =
      "Một số công trình nổi bật của Công ty TNHH Thiết bị Công nghệ Hưng Phát";

    const published = parsePublishedEnvelope(legacy);
    const projects = published.content.pages.home.sections.projects;

    assert.equal(projects.title, "Một số công trình nổi bật");
    assert.deepEqual(
      projects.items.map((item) => item.id),
      ["project-1", "project-2", "project-3", "project-4"],
    );
    for (const item of projects.items) {
      assert.equal(item.title, "");
      assert.equal(item.description, "");
      assert.equal(item.alt, "");
      assert.equal(item.image.assetId, null);
      assert.equal(item.image.focalX, "center");
      assert.equal(item.image.focalY, "center");
    }
  });

  it("giữ tiêu đề dự án đã được người dùng tùy chỉnh", () => {
    const published = parsePublishedEnvelope(seed);

    assert.equal(
      published.content.pages.home.sections.projects.title,
      seed.content.pages.home.sections.projects.title,
    );
  });

  it("từ chối ảnh công trình tham chiếu asset không tồn tại", () => {
    const migrated = parsePublishedEnvelope(seed);
    const invalid = structuredClone(migrated);
    invalid.content.pages.home.sections.projects.items[0].image.assetId = "missing";

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("migrates legacy content with editable solar groups", () => {
    const legacy = structuredClone(seed);
    delete (legacy.content.pages as Record<string, unknown>).solar;
    legacy.content.pages.home.hero.title = "HOME EDIT PRESERVED";

    const published = parsePublishedEnvelope(legacy);

    assert.equal(published.content.pages.home.hero.title, "HOME EDIT PRESERVED");
    assert.equal(published.content.pages.solar.groups.panel.label, "Tấm pin");
    assert.equal(published.content.pages.solar.groups.inverter.label, "Biến tần");
    assert.equal(published.content.pages.solar.groups.battery.label, "Pin lưu trữ");
    assert.equal(
      published.content.pages.solar.hero.image.assetId,
      published.content.pages.home.categoryImages["dien-mat-troi"].assetId,
    );
  });

  it("rejects unknown solar image references", () => {
    const invalid = structuredClone(parsePublishedEnvelope(seed));
    invalid.content.pages.solar.groups.panel.image.assetId = "missing";

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("enforces fixed solar group identities", () => {
    const invalid = structuredClone(parsePublishedEnvelope(seed));
    (invalid.content.pages.solar.groups.panel as { id: string }).id = "battery";

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("migrates legacy content with editable camera page", () => {
    const legacy = structuredClone(seed);
    delete (legacy.content.pages as Record<string, unknown>).camera;
    legacy.content.pages.home.sections.about.title = "PRESERVED CAMERA MIGRATION";

    const published = parsePublishedEnvelope(legacy);

    assert.equal(
      published.content.pages.home.sections.about.title,
      "PRESERVED CAMERA MIGRATION",
    );
    assert.equal(published.content.pages.camera.hero.title, "Camera giám sát");
    assert.equal(
      published.content.pages.camera.hero.image.assetId,
      published.content.pages.home.categoryImages["camera-giam-sat"].assetId,
    );
    assert.equal(
      published.content.pages.camera.introduction.title,
      "Giải pháp camera theo không gian sử dụng",
    );
  });

  it("rejects unknown camera image references", () => {
    const invalid = structuredClone(parsePublishedEnvelope(seed));
    invalid.content.pages.camera.introduction.image.assetId = "missing";

    assert.throws(() => parsePublishedEnvelope(invalid));
  });

  it("từ chối schema version chưa hỗ trợ", () => {
    const invalid = structuredClone(seed);
    invalid.schemaVersion = 99;

    assert.throws(() => parsePublishedEnvelope(invalid));
  });
});
