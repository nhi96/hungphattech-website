import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import sharp from "sharp";
import { products } from "../src/data/products.demo.ts";

type CameraSourceEntry = {
  model: string;
  brand: "Imou" | "Hikvision";
  productPageUrl: string;
  sourceImageUrl: string;
  sourceFilename: string;
  outputFilename: string;
  status: "verified";
  modelEvidence: string;
  sourceSha256: string;
  normalizedSha256: string;
  watermarkedSha256: string;
  sharedImageJustification?: string;
};

const manifestPath = path.join(
  process.cwd(),
  "docs",
  "assets",
  "camera-image-sources.json",
);

describe("camera image refresh pipeline", () => {
  it("records 28 unique verified manufacturer mappings", async () => {
    const manifest = JSON.parse(
      await readFile(manifestPath, "utf8"),
    ) as CameraSourceEntry[];
    const models = manifest.map((entry) => entry.model);

    assert.equal(manifest.length, 28);
    assert.equal(new Set(models).size, 28);

    for (const entry of manifest) {
      assert.equal(entry.status, "verified", entry.model);
      assert.ok(entry.modelEvidence.includes(entry.model), entry.model);
      assert.match(
        entry.productPageUrl,
        /^https:\/\/(www\.imou\.com|pro-av\.hikvision\.com)\//,
        entry.model,
      );
      assert.match(
        entry.sourceImageUrl,
        /^https:\/\/(static-website\.imou\.com|assets\.hikvision\.com)\//,
        entry.model,
      );
      assert.match(entry.sourceSha256, /^[a-f0-9]{64}$/);
      assert.match(entry.normalizedSha256, /^[a-f0-9]{64}$/);
      assert.match(entry.watermarkedSha256, /^[a-f0-9]{64}$/);
    }
  });

  it("stores square normalized and watermarked camera images", async () => {
    const manifest = JSON.parse(
      await readFile(manifestPath, "utf8"),
    ) as CameraSourceEntry[];

    for (const entry of manifest) {
      for (const filename of [entry.sourceFilename, entry.outputFilename]) {
        const imagePath = path.join(
          process.cwd(),
          "public",
          "images",
          "products",
          "cameras",
          filename,
        );
        await access(imagePath);
        const metadata = await sharp(imagePath).metadata();
        assert.equal(metadata.format, "webp", `${entry.model}: ${filename}`);
        assert.equal(metadata.width, 1200, `${entry.model}: ${filename}`);
        assert.equal(metadata.height, 1200, `${entry.model}: ${filename}`);
        assert.equal(metadata.hasAlpha, false, `${entry.model}: ${filename}`);
      }
    }
  });

  it("uses the camera refresh cache token for every catalog image", () => {
    const cameras = products.filter(
      (product) => product.categorySlug === "camera-giam-sat",
    );

    for (const product of cameras) {
      assert.match(
        product.images[0],
        /^\/images\/products\/cameras\/.+-hung-phat\.webp\?v=20261007-camera-refresh-1$/,
        product.model,
      );
    }
  });
});
