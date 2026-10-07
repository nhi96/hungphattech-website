import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

type SeedContent = {
  publishedRevision: number;
  content: {
    assets: Record<string, { path: string }>;
  };
};

describe("production deployment readiness", () => {
  it("allows search engines to index the production website", async () => {
    const layout = await readFile(path.join(process.cwd(), "src", "app", "layout.tsx"), "utf8");

    assert.match(layout, /robots:\s*\{\s*index:\s*true,\s*follow:\s*true/);
  });

  it("ships the current published seed and every referenced upload", async () => {
    const seedPath = path.join(process.cwd(), ".content", "default-content.json");
    const seed = JSON.parse(await readFile(seedPath, "utf8")) as SeedContent;
    const gitignore = await readFile(path.join(process.cwd(), ".gitignore"), "utf8");
    const referencedUploads = Object.values(seed.content.assets)
      .map((asset) => asset.path)
      .filter((assetPath) => assetPath.startsWith("/uploads/"));

    assert.equal(seed.publishedRevision, 9);
    assert.equal(referencedUploads.length, 11);

    for (const assetPath of referencedUploads) {
      const relativePath = assetPath.slice(1);
      await assert.doesNotReject(readFile(path.join(process.cwd(), "public", relativePath)));
      const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(gitignore, new RegExp(`!/public/${escapedPath}`));
    }
  });
});
