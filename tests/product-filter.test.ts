import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { products } from "../src/data/products.demo.ts";
import { filterProducts } from "../src/lib/product-filter.ts";

describe("filterProducts", () => {
  it("tìm sản phẩm theo tên không phân biệt hoa thường", () => {
    const result = filterProducts(products, {
      query: "camera",
      category: "all",
      brand: "all",
      solarGroup: "all",
      computingGroup: "all",
      sort: "name-asc",
    });

    assert.equal(result.length, 28);
    assert.equal(result.every((product) => product.name.toLowerCase().includes("camera")), true);
  });

  it("lọc đủ tám sản phẩm trong danh mục điện mặt trời", () => {
    const result = filterProducts(products, {
      query: "",
      category: "dien-mat-troi",
      brand: "all",
      solarGroup: "all",
      computingGroup: "all",
      sort: "name-asc",
    });

    assert.equal(result.length, 20);
  });

  it("lọc sản phẩm điện mặt trời theo nhóm thiết bị", () => {
    const inverters = filterProducts(products, {
      query: "",
      category: "dien-mat-troi",
      brand: "all",
      solarGroup: "inverter",
      computingGroup: "all",
      sort: "name-asc",
    });
    const deyeBatteries = filterProducts(products, {
      query: "",
      category: "dien-mat-troi",
      brand: "Deye",
      solarGroup: "battery",
      computingGroup: "all",
      sort: "name-asc",
    });

    assert.equal(inverters.length, 8);
    assert.equal(deyeBatteries.length, 2);
  });

  it("lọc đồng thời theo danh mục và thương hiệu", () => {
    const result = filterProducts(products, {
      query: "",
      category: "camera-giam-sat",
      brand: "Hikvision",
      solarGroup: "all",
      computingGroup: "all",
      sort: "name-asc",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].categorySlug, "camera-giam-sat");
  });

  it("sắp xếp theo tên giảm dần mà không thay đổi mảng gốc", () => {
    const originalFirst = products[0].name;
    const result = filterProducts(products, {
      query: "",
      category: "all",
      brand: "all",
      solarGroup: "all",
      computingGroup: "all",
      sort: "name-desc",
    });

    assert.ok(result[0].name.localeCompare(result.at(-1)?.name ?? "", "vi") >= 0);
    assert.equal(products[0].name, originalFirst);
  });
});
