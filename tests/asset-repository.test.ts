import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import sharp from "sharp";
import {
  FileAssetRepository,
  InvalidImageError,
} from "../src/lib/content/asset-repository.ts";

const roots: string[] = [];

async function repository() {
  const root = await mkdtemp(path.join(os.tmpdir(), "hungphat-assets-"));
  roots.push(root);
  return new FileAssetRepository(root);
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("FileAssetRepository", () => {
  it("giải mã PNG và lưu lại thành WebP", async () => {
    const repo = await repository();
    const input = await sharp({
      create: { width: 64, height: 48, channels: 3, background: "#ffc400" },
    })
      .png()
      .toBuffer();

    const asset = await repo.saveImage(input, "banner.png");
    const saved = await readFile(path.join(repo.uploadRoot, path.basename(asset.path)));
    const metadata = await sharp(saved).metadata();

    assert.equal(asset.mime, "image/webp");
    assert.equal(metadata.format, "webp");
    assert.equal(asset.width, 64);
    assert.equal(asset.height, 48);
  });

  it("từ chối SVG và dữ liệu không phải ảnh", async () => {
    const repo = await repository();
    await assert.rejects(
      repo.saveImage(Buffer.from("<svg></svg>"), "image.svg"),
      InvalidImageError,
    );
    await assert.rejects(
      repo.saveImage(Buffer.from("not an image"), "photo.jpg"),
      InvalidImageError,
    );
  });

  it("từ chối ảnh vượt giới hạn điểm ảnh", async () => {
    const repo = await repository();
    const input = await sharp({
      create: { width: 7000, height: 6000, channels: 3, background: "#ffffff" },
    })
      .jpeg()
      .toBuffer();

    await assert.rejects(repo.saveImage(input, "too-large.jpg"), InvalidImageError);
  });
});
