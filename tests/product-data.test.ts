import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import sharp from "sharp";
import { products } from "../src/data/products.demo.ts";

type RebrandManifestEntry = {
  source: string;
  output: string;
  productBounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

const obsoleteSolarSlugs = [
  "bo-dien-mat-troi-hoa-luoi-mau",
  "bo-dien-mat-troi-hybrid-mau",
  "bo-luu-tru-dien-mau",
];

const inverterModels = [
  "GW6000-ES-20",
  "GW20K-ET-L-G10",
  "TriP2-LB-3P 6K",
  "TriP2-LB-3P 20K",
  "SUN-6K-SG06LP1-EU-BM2",
  "SUN-20K-SG01HP3-EU-AM2",
  "SH6.0RS",
  "SH20T",
];

const batteryModels = [
  "LV-BAT-W5.12Da",
  "W15-5A",
  "W16-5A",
  "SE-G5.1 Pro-B",
  "RW-F16",
  "ARKVOLT F8S",
  "HeroEE 16",
];

const inverterBrands = ["GoodWe", "LuxPower", "Deye", "Sungrow"];
const batteryBrands = ["Lithium Valley", "Deye", "HiTHIUM"];
const cameraModels = [
  "IPC-C22EP",
  "IPC-C22SP",
  "IPC-S2VP-5M0WR",
  "IPC-S2XEP-6M0S",
  "IPC-S2XEP-10M0S",
  "IPC-A32P-PRO",
  "IPC-A52P-PRO",
  "IPC-K2MP-3H1WE",
  "IPC-K2MP-5H1WE",
  "IPC-S2VBP-5M0WR",
  "IPC-S2XP-6M0WED",
  "IPC-S2XP-10M0WED",
  "IPC-S6DP-3M0WEB",
  "IPC-S6DP-5M0WEB",
  "DS-2CV2121G2-IDW",
  "F22FEP",
  "F32FP",
  "F52FP",
  "S3EP-3M0WEB",
  "S3EP-5M0WEB",
  "GS7EP-3M0WE",
  "GS7EP-5M0WE",
  "IPC-S7XP-6M0WED",
  "IPC-S7XP-10M0WED",
  "S21FEP",
  "S41FEP",
  "S51FEP",
  "IPC-S7UP-11M0WED",
];
const obsoleteCameraSlugs = [
  "camera-trong-nha-mau",
  "camera-ngoai-troi-mau",
  "bo-camera-cua-hang-mau",
];

describe("solar panel product data", () => {
  it("contains five panels, eight inverters, and seven batteries", () => {
    const solar = products.filter((product) => product.categorySlug === "dien-mat-troi");

    assert.equal(solar.length, 20);
    assert.equal(solar.filter((product) => product.solarDetails?.group === "panel").length, 5);
    assert.equal(solar.filter((product) => product.solarDetails?.group === "inverter").length, 8);
    assert.equal(solar.filter((product) => product.solarDetails?.group === "battery").length, 7);
    assert.deepEqual(
      solar
        .filter((product) => product.solarDetails?.group === "inverter")
        .map((product) => product.model)
        .toSorted(),
      inverterModels.toSorted(),
    );
    assert.deepEqual(
      solar
        .filter((product) => product.solarDetails?.group === "battery")
        .map((product) => product.model)
        .toSorted(),
      batteryModels.toSorted(),
    );
  });

  it("removes obsolete solar demos and keeps all solar records as references", () => {
    const solar = products.filter((product) => product.categorySlug === "dien-mat-troi");

    assert.equal(obsoleteSolarSlugs.some((slug) => products.some((product) => product.slug === slug)), false);
    for (const product of solar) {
      assert.equal(product.price, null);
      assert.equal(product.imageFit, "contain");
      assert.equal(product.images.length, 1);
      assert.equal(product.images[0].startsWith("/images/"), true);
      assert.equal(product.isDemo, false);
      assert.ok(product.solarDetails);
      assert.ok(product.model);
    }
  });

  it("uses typed inverter power and battery energy values", () => {
    const solar = products.filter((product) => product.categorySlug === "dien-mat-troi");

    for (const product of solar) {
      if (product.solarDetails?.group === "inverter") {
        assert.ok(product.solarDetails.ratedOutputKw >= 6);
        assert.ok(product.solarDetails.ratedOutputKw <= 20);
        assert.match(product.solarDetails.phase, /^(single-phase|three-phase)$/);
        assert.match(product.solarDetails.inverterType, /^(hybrid|off-grid|grid-tied)$/);
      }
      if (product.solarDetails?.group === "battery") {
        assert.ok(product.solarDetails.energyKwh > 0);
        assert.match(product.solarDetails.energyBasis, /^(nominal|usable)$/);
        assert.match(`${product.name} ${product.summary}`, /kWh/);
      }
    }
  });

  it("contains exactly two products for every approved solar equipment brand", () => {
    const inverters = products.filter((product) => product.solarDetails?.group === "inverter");
    const batteries = products.filter((product) => product.solarDetails?.group === "battery");

    for (const brand of inverterBrands) {
      assert.equal(inverters.filter((product) => product.brand === brand).length, 2, brand);
    }
    assert.equal(
      batteries.filter((product) => product.brand === "Lithium Valley").length,
      3,
    );
    for (const brand of batteryBrands.filter((brand) => brand !== "Lithium Valley")) {
      assert.equal(batteries.filter((product) => product.brand === brand).length, 2, brand);
    }
  });

  it("keeps every product slug unique", () => {
    assert.equal(new Set(products.map((product) => product.slug)).size, products.length);
  });

  it("stores every new equipment image as a sourced opaque 1200x900 WebP", async () => {
    const equipment = products.filter(
      (product) =>
        product.solarDetails?.group === "inverter" ||
        product.solarDetails?.group === "battery",
    );
    const manifest = await readFile(
      path.join(process.cwd(), "docs/sources/solar-energy-products.md"),
      "utf8",
    );

    for (const product of equipment) {
      const imagePath = product.images[0];
      const absolutePath = path.join(process.cwd(), "public", imagePath);
      await access(absolutePath);
      const metadata = await sharp(absolutePath).metadata();
      assert.equal(metadata.format, "webp", product.slug);
      assert.equal(metadata.width, 1200, product.slug);
      assert.equal(metadata.height, 900, product.slug);
      assert.equal(metadata.hasAlpha, false, product.slug);
      assert.ok(
        manifest.includes(imagePath.replace("-hung-phat.webp", ".webp")),
        product.slug,
      );

      const { data, info } = await sharp(absolutePath).raw().toBuffer({ resolveWithObject: true });
      const corners = [
        0,
        (info.width - 1) * info.channels,
        (info.height - 1) * info.width * info.channels,
        ((info.height - 1) * info.width + info.width - 1) * info.channels,
      ];
      for (const offset of corners) {
        assert.ok(data[offset] >= 250, `${product.slug} red corner`);
        assert.ok(data[offset + 1] >= 250, `${product.slug} green corner`);
        assert.ok(data[offset + 2] >= 250, `${product.slug} blue corner`);
      }
    }
  });
});

describe("camera product data", () => {
  it("contains exactly the 28 approved camera variants without demos", () => {
    const cameras = products.filter(
      (product) => product.categorySlug === "camera-giam-sat",
    );

    assert.equal(cameras.length, 28);
    assert.deepEqual(
      cameras.map((product) => product.model).toSorted(),
      cameraModels.toSorted(),
    );
    assert.equal(
      obsoleteCameraSlugs.some((slug) =>
        products.some((product) => product.slug === slug),
      ),
      false,
    );
  });

  it("uses typed camera details, contact pricing, and one local image", () => {
    const cameras = products.filter(
      (product) => product.categorySlug === "camera-giam-sat",
    );

    for (const product of cameras) {
      assert.ok(product.cameraDetails, product.slug);
      assert.match(
        product.cameraDetails.environment,
        /^(indoor|outdoor|indoor-outdoor)$/,
      );
      assert.match(
        product.cameraDetails.connectivity,
        /^(wifi|poe|wired|wifi-wired)$/,
      );
      assert.match(
        product.cameraDetails.formFactor,
        /^(dome|bullet|ptz|cube|doorbell|other)$/,
      );
      assert.equal(typeof product.cameraDetails.dualLens, "boolean");
      assert.equal(product.price, null);
      assert.equal(product.isDemo, false);
      assert.equal(product.imageFit, "contain");
      assert.equal(product.images.length, 1);
      assert.match(
        product.images[0],
        /^\/images\/products\/cameras\/.+\.webp\?v=20261007-camera-refresh-1$/,
      );
    }

    for (const product of products.filter(
      (item) => item.categorySlug !== "camera-giam-sat",
    )) {
      assert.equal(product.cameraDetails, undefined, product.slug);
    }
  });

  it("keeps camera manufacturer and model pairs unique", () => {
    const cameras = products.filter(
      (product) => product.categorySlug === "camera-giam-sat",
    );
    const pairs = cameras.map(
      (product) => `${product.brand.toLowerCase()}::${product.model?.toLowerCase()}`,
    );

    assert.equal(new Set(pairs).size, pairs.length);
  });

  it("stores every camera image as a sourced opaque 1200x1200 WebP", async () => {
    const cameras = products.filter(
      (product) => product.categorySlug === "camera-giam-sat",
    );
    const manifest = await readFile(
      path.join(process.cwd(), "docs/assets/camera-image-sources.json"),
      "utf8",
    );

    for (const product of cameras) {
      const imagePath = product.images[0];
      const pathname = imagePath.split("?")[0];
      const absolutePath = path.join(process.cwd(), "public", pathname);
      await access(absolutePath);
      const metadata = await sharp(absolutePath).metadata();
      assert.equal(metadata.format, "webp", product.slug);
      assert.equal(metadata.width, 1200, product.slug);
      assert.equal(metadata.height, 1200, product.slug);
      assert.equal(metadata.hasAlpha, false, product.slug);
      assert.ok(
        manifest.includes(path.basename(pathname)),
        product.slug,
      );

      const { data, info } = await sharp(absolutePath)
        .raw()
        .toBuffer({ resolveWithObject: true });
      const corners = [
        0,
        (info.width - 1) * info.channels,
        (info.height - 1) * info.width * info.channels,
        ((info.height - 1) * info.width + info.width - 1) * info.channels,
      ];
      for (const offset of corners) {
        assert.ok(data[offset] >= 250, `${product.slug} red corner`);
        assert.ok(data[offset + 1] >= 250, `${product.slug} green corner`);
        assert.ok(data[offset + 2] >= 250, `${product.slug} blue corner`);
      }
    }
  });

  it("replaces office and smart-home category demos with sourced products", () => {
    const computing = products.filter(
      (product) => product.categorySlug === "laptop-pc",
    );
    const locks = products.filter(
      (product) => product.categorySlug === "khoa-cua-thong-minh",
    );

    assert.equal(computing.length, 31);
    assert.equal(
      computing.filter((product) => product.computingDetails?.group === "laptop")
        .length,
      15,
    );
    assert.equal(
      computing.filter((product) => product.computingDetails?.group === "desktop")
        .length,
      4,
    );
    assert.equal(
      computing.filter((product) => product.computingDetails?.group === "printer")
        .length,
      12,
    );
    assert.equal(
      products
        .filter((product) => product.categorySlug !== "laptop-pc")
        .every((product) => product.computingDetails === undefined),
      true,
    );
    assert.ok(locks.length >= 8);
    assert.equal(products.some((product) => product.isDemo), false);
    assert.equal(
      computing.some((product) => product.price !== null),
      true,
    );
    assert.equal(
      computing.some((product) =>
        product.images[0].includes("/products/laptops/"),
      ),
      true,
    );
    assert.equal(locks.every((product) => product.price === null), true);
    assert.equal(locks.every((product) => product.images[0].startsWith("/images/")), true);
  });

  it("uses 59 Hưng Phát-branded camera and computing images with clean canvases", async () => {
    const brandedProducts = products.filter(
      (product) =>
        product.categorySlug === "camera-giam-sat" ||
        product.categorySlug === "laptop-pc",
    );
    const manifest = JSON.parse(
      await readFile(
        path.join(process.cwd(), "artifacts/rebrand-product-assets.json"),
        "utf8",
      ),
    ) as RebrandManifestEntry[];
    const entriesByOutput = new Map(
      manifest.map((entry) => [entry.output, entry]),
    );

    assert.equal(brandedProducts.length, 59);
    assert.equal(manifest.length, 59);

    for (const product of brandedProducts) {
      const imagePath = product.images[0];
      const pathname = imagePath.split("?")[0];
      assert.match(
        pathname,
        /^\/images\/products\/(cameras|laptops|desktops|printers)\/.+-hung-phat\.webp$/,
        product.slug,
      );

      const entry = entriesByOutput.get(pathname);
      if (product.categorySlug !== "camera-giam-sat") {
        assert.ok(entry, `${product.slug} manifest entry`);
        assert.ok(entry.source.length > 0, `${product.slug} source`);
        assert.ok(entry.productBounds.width > 0, `${product.slug} bounds width`);
        assert.ok(entry.productBounds.height > 0, `${product.slug} bounds height`);
      }

      const absolutePath = path.join(process.cwd(), "public", pathname);
      await access(absolutePath);
      const metadata = await sharp(absolutePath).metadata();
      assert.equal(metadata.format, "webp", product.slug);
      assert.equal(metadata.width, 1200, product.slug);
      assert.equal(
        metadata.height,
        product.categorySlug === "camera-giam-sat" ? 1200 : 900,
        product.slug,
      );
      assert.equal(metadata.hasAlpha, false, product.slug);

      const { data, info } = await sharp(absolutePath)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const pixel = (x: number, y: number) => {
        const offset = (y * info.width + x) * info.channels;
        return [data[offset], data[offset + 1], data[offset + 2]];
      };
      let redLogoPixels = 0;
      const cameraImage = product.categorySlug === "camera-giam-sat";
      const logoRight = cameraImage ? 216 : 135;
      const logoBottom = cameraImage ? 160 : 101;
      for (let y = 32; y <= logoBottom; y += 2) {
        for (let x = 36; x <= logoRight; x += 2) {
          const [red, green, blue] = pixel(x, y);
          const redRatio = cameraImage ? 1.08 : 1.35;
          if (red > 145 && red > green * redRatio && red > blue * redRatio) {
            redLogoPixels += 1;
          }
        }
      }
      assert.ok(redLogoPixels >= 20, `${product.slug} HP logo red pixels`);

      if (product.categorySlug === "camera-giam-sat") continue;
      if (!entry) {
        throw new Error(`${product.slug} manifest entry`);
      }
      const { left, top, width, height } = entry.productBounds;
      const right = left + width - 1;
      const bottom = top + height - 1;
      const samples = [
        [0, 0],
        [1199, 0],
        [0, 899],
        [1199, 899],
        [Math.max(0, left - 8), Math.min(899, top + Math.floor(height / 2))],
        [Math.min(1199, right + 8), Math.min(899, top + Math.floor(height / 2))],
        [Math.min(1199, left + Math.floor(width / 2)), Math.max(0, top - 8)],
        [Math.min(1199, left + Math.floor(width / 2)), Math.min(899, bottom + 8)],
      ];
      for (const [x, y] of samples) {
        if (x >= 40 && x <= 135 && y >= 32 && y <= 101) continue;
        const [red, green, blue] = pixel(x, y);
        assert.ok(red >= 250, `${product.slug} white sample red at ${x},${y}`);
        assert.ok(green >= 250, `${product.slug} white sample green at ${x},${y}`);
        assert.ok(blue >= 250, `${product.slug} white sample blue at ${x},${y}`);
      }
    }
  });
});
