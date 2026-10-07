import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import seed from "../.content/default-content.json" with { type: "json" };
import { FileContentRepository, RevisionConflictError } from "../src/lib/content/content-repository.ts";

const temporaryRoots: string[] = [];
const seedRevision = seed.publishedRevision;

async function createRepository() {
  const root = await mkdtemp(path.join(os.tmpdir(), "hungphat-content-"));
  temporaryRoots.push(root);
  return new FileContentRepository({
    root,
    seedPath: path.join(process.cwd(), ".content", "default-content.json"),
  });
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("FileContentRepository", () => {
  it("khởi tạo published và draft từ seed", async () => {
    const repository = await createRepository();
    const published = await repository.getPublishedContent();
    const draft = await repository.getDraftContent();

    assert.equal(published.publishedRevision, seedRevision);
    assert.equal(draft.basePublishedRevision, seedRevision);
    assert.equal(draft.content.site.brandName, "HƯNG PHÁT");
  });

  it("lưu draft tăng revision và từ chối revision cũ", async () => {
    const repository = await createRepository();
    const draft = await repository.getDraftContent();
    draft.content.pages.home.hero.title = "NỘI DUNG MỚI";

    const saved = await repository.saveDraft(draft.content, draft.draftRevision);
    assert.equal(saved.draftRevision, 1);

    await assert.rejects(
      repository.saveDraft(draft.content, draft.draftRevision),
      RevisionConflictError,
    );
  });

  it("publish tăng published revision và làm mới draft", async () => {
    const repository = await createRepository();
    const draft = await repository.getDraftContent();
    draft.content.pages.home.hero.title = "BANNER ĐÃ XUẤT BẢN";
    const saved = await repository.saveDraft(draft.content, draft.draftRevision);

    const result = await repository.publishDraft(
      saved.draftRevision,
      saved.basePublishedRevision,
    );

    assert.equal(result.published.publishedRevision, seedRevision + 1);
    assert.equal(result.draft.basePublishedRevision, seedRevision + 1);
    assert.equal(result.draft.content.pages.home.hero.title, "BANNER ĐÃ XUẤT BẢN");
    assert.ok(result.draft.draftRevision > saved.draftRevision);
  });

  it("reset yêu cầu đúng cả hai revision", async () => {
    const repository = await createRepository();
    const draft = await repository.getDraftContent();
    const saved = await repository.saveDraft(draft.content, draft.draftRevision);

    await assert.rejects(
      repository.resetDraftFromPublished(saved.draftRevision - 1, saved.basePublishedRevision),
      RevisionConflictError,
    );

    const reset = await repository.resetDraftFromPublished(
      saved.draftRevision,
      saved.basePublishedRevision,
    );
    assert.equal(reset.basePublishedRevision, seedRevision);
    assert.equal(reset.draftRevision, saved.draftRevision + 1);
  });

  it("publish tạo bản sao lịch sử hợp lệ", async () => {
    const repository = await createRepository();
    const draft = await repository.getDraftContent();
    const result = await repository.publishDraft(
      draft.draftRevision,
      draft.basePublishedRevision,
    );
    const history = await repository.listHistory();
    const backup = JSON.parse(await readFile(history[0], "utf8"));

    assert.equal(result.published.publishedRevision, seedRevision + 1);
    assert.equal(backup.publishedRevision, seedRevision);
  });
});
