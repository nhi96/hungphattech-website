import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateContact } from "../src/lib/contact-validation.ts";

describe("validateContact", () => {
  it("báo lỗi khi họ tên và số điện thoại để trống", () => {
    const errors = validateContact({
      name: "",
      phone: "",
      category: "",
      message: "",
    });

    assert.ok(errors.name);
    assert.ok(errors.phone);
  });

  it("từ chối số điện thoại không hợp lệ", () => {
    const errors = validateContact({
      name: "Nguyễn Văn An",
      phone: "abc123",
      category: "",
      message: "",
    });

    assert.ok(errors.phone);
  });

  it("chấp nhận số điện thoại Việt Nam hợp lệ sau khi chuẩn hóa", () => {
    const errors = validateContact({
      name: " Nguyễn Văn An ",
      phone: "0937 100 368",
      category: "camera-giam-sat",
      message: "Tư vấn giúp tôi.",
    });

    assert.deepEqual(errors, {});
  });
});
