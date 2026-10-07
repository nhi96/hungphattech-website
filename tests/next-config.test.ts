import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../next.config.ts";

test("production build emits a standalone deployment", () => {
  assert.equal(nextConfig.output, "standalone");
});
