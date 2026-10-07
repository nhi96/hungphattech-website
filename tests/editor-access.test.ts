import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EditorAccessError,
  assertEditorReadAccess,
  assertEditorWriteAccess,
} from "../src/lib/content/editor-access.ts";

function request(url: string, init?: RequestInit) {
  return new Request(url, init);
}

describe("editor access", () => {
  it("cho phép đọc trên loopback trong development", () => {
    assert.doesNotThrow(() =>
      assertEditorReadAccess(request("http://127.0.0.1:3000/quan-tri"), {
        nodeEnv: "development",
        enabled: false,
      }),
    );
  });

  it("từ chối host ngoài loopback", () => {
    assert.throws(
      () =>
        assertEditorReadAccess(request("http://192.168.1.75:3000/quan-tri"), {
          nodeEnv: "development",
          enabled: true,
        }),
      EditorAccessError,
    );
  });

  it("từ chối production khi chưa bật cờ", () => {
    assert.throws(
      () =>
        assertEditorReadAccess(request("http://localhost:3000/quan-tri"), {
          nodeEnv: "production",
          enabled: false,
        }),
      EditorAccessError,
    );
  });

  it("yêu cầu Origin trùng khớp cho thao tác ghi", () => {
    const missingOrigin = request("http://localhost:3000/api/admin/content/draft", {
      method: "PUT",
      headers: { "content-type": "application/json" },
    });
    assert.throws(
      () =>
        assertEditorWriteAccess(missingOrigin, {
          nodeEnv: "development",
          enabled: false,
        }),
      EditorAccessError,
    );

    const valid = request("http://localhost:3000/api/admin/content/draft", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
    });
    assert.doesNotThrow(() =>
      assertEditorWriteAccess(valid, { nodeEnv: "development", enabled: false }),
    );
  });

  it("accepts loopback when Next.js normalizes the URL differently from Host", () => {
    const valid = request("http://localhost:3000/api/admin/content/draft", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:3000",
        origin: "http://127.0.0.1:3000",
      },
    });

    assert.doesNotThrow(() =>
      assertEditorWriteAccess(valid, { nodeEnv: "development", enabled: false }),
    );
  });
});
