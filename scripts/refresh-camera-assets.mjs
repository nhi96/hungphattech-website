import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const manifestPath = path.join(
  root,
  "docs",
  "assets",
  "camera-image-sources.json",
);
const outputDirectory = path.join(
  root,
  "public",
  "images",
  "products",
  "cameras",
);
const artifactDirectory = path.join(root, ".artifacts", "camera-refresh");
const stagingDirectory = path.join(artifactDirectory, "staging");
const logoPath = path.join(
  root,
  "public",
  "images",
  "hung-phat-logo-transparent.png",
);

const allowedImageHosts = new Set([
  "static-website.imou.com",
  "assets.hikvision.com",
]);
const canvasSize = 1200;
const productBoxSize = 900;
const maximumBytes = 20 * 1024 * 1024;
const maximumPixels = 40_000_000;

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function assertAllowedUrl(value, model) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !allowedImageHosts.has(url.hostname)) {
    throw new Error(`${model}: unapproved image host ${url.hostname}`);
  }
}

async function downloadImage(entry) {
  assertAllowedUrl(entry.sourceImageUrl, entry.model);
  const response = await fetch(entry.sourceImageUrl, {
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
    headers: {
      "user-agent": "HungPhatTech camera catalog refresh/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${entry.model}: download failed with ${response.status}`);
  }
  assertAllowedUrl(response.url, entry.model);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`${entry.model}: invalid content type ${contentType}`);
  }
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > maximumBytes) {
    throw new Error(`${entry.model}: source exceeds 20 MB`);
  }
  const source = Buffer.from(await response.arrayBuffer());
  if (source.length > maximumBytes) {
    throw new Error(`${entry.model}: source exceeds 20 MB`);
  }
  const metadata = await sharp(source, {
    limitInputPixels: maximumPixels,
    failOn: "warning",
  }).metadata();
  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new Error(`${entry.model}: source is not a decodable image`);
  }
  if (metadata.width * metadata.height > maximumPixels) {
    throw new Error(`${entry.model}: decoded image exceeds 40 megapixels`);
  }
  return { source, metadata, contentType };
}

async function normalizedProduct(source) {
  const trimmed = await sharp(source, {
    limitInputPixels: maximumPixels,
    failOn: "warning",
  })
    .rotate()
    .toColourspace("srgb")
    .ensureAlpha()
    .trim({ background: "#ffffff", threshold: 10 })
    .png()
    .toBuffer({ resolveWithObject: true });
  const longestEdge = Math.max(trimmed.info.width, trimmed.info.height);
  const lowResolutionException = longestEdge < 800;
  const resized = await sharp(trimmed.data)
    .resize({
      width: productBoxSize,
      height: productBoxSize,
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer({ resolveWithObject: true });
  const left = Math.round((canvasSize - resized.info.width) / 2);
  const top = Math.round((canvasSize - resized.info.height) / 2);
  const normalized = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite([{ input: resized.data, left, top }])
    .webp({ quality: 88, smartSubsample: true })
    .toBuffer();
  return {
    normalized,
    lowResolutionException,
    productBounds: {
      left,
      top,
      width: resized.info.width,
      height: resized.info.height,
    },
  };
}

async function watermark(normalized, productBounds) {
  const logoSource = await sharp(logoPath)
    .rotate()
    .toColourspace("srgb")
    .ensureAlpha()
    .png()
    .toBuffer();
  let logoWidth = 180;
  const logoTop = 36;
  const logoLeft = 36;
  let logo;
  let logoMetadata;

  while (logoWidth >= 120) {
    logo = await sharp(logoSource)
      .resize({ width: logoWidth, withoutEnlargement: true })
      .linear([1, 1, 1, 0.2], [0, 0, 0, 0])
      .png()
      .toBuffer({ resolveWithObject: true });
    logoMetadata = logo.info;
    const overlapWidth = Math.max(
      0,
      Math.min(logoLeft + logo.info.width, productBounds.left + productBounds.width) -
        Math.max(logoLeft, productBounds.left),
    );
    const overlapHeight = Math.max(
      0,
      Math.min(logoTop + logo.info.height, productBounds.top + productBounds.height) -
        Math.max(logoTop, productBounds.top),
    );
    const overlapRatio =
      (overlapWidth * overlapHeight) / (logo.info.width * logo.info.height);
    if (overlapRatio <= 0.05) break;
    logoWidth -= 12;
  }
  if (!logo || !logoMetadata || logoWidth < 120) {
    throw new Error("HP logo overlaps the product by more than 5%");
  }
  return {
    buffer: await sharp(normalized)
      .composite([{ input: logo.data, left: logoLeft, top: logoTop }])
      .webp({ quality: 88, smartSubsample: true })
      .toBuffer(),
    logoWidth,
  };
}

async function dHash(buffer) {
  const { data } = await sharp(buffer)
    .greyscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let hash = 0n;
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      hash <<= 1n;
      if (data[y * 9 + x] > data[y * 9 + x + 1]) hash |= 1n;
    }
  }
  return hash.toString(16).padStart(16, "0");
}

async function createContactSheet(entries) {
  const columns = 4;
  const tileWidth = 300;
  const tileHeight = 330;
  const composites = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const image = await sharp(path.join(stagingDirectory, entry.outputFilename))
      .resize(280, 280, { fit: "contain", background: "#ffffff" })
      .png()
      .toBuffer();
    const label = entry.model
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const caption = Buffer.from(
      `<svg width="300" height="50" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="50" fill="white"/><text x="10" y="28" font-size="15" font-family="Arial" fill="#111">${label}</text></svg>`,
    );
    const left = (index % columns) * tileWidth;
    const top = Math.floor(index / columns) * tileHeight;
    composites.push({ input: image, left: left + 10, top });
    composites.push({ input: caption, left, top: top + 280 });
  }
  await sharp({
    create: {
      width: columns * tileWidth,
      height: Math.ceil(entries.length / columns) * tileHeight,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(artifactDirectory, "contact-sheet.png"));
}

await mkdir(stagingDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });
await rm(stagingDirectory, { recursive: true, force: true });
await mkdir(stagingDirectory, { recursive: true });

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.length !== 28) {
  throw new Error(`Expected 28 camera entries, found ${manifest.length}`);
}

for (const entry of manifest) {
  const downloaded = await downloadImage(entry);
  const processed = await normalizedProduct(downloaded.source);
  const branded = await watermark(processed.normalized, processed.productBounds);
  const normalizedPath = path.join(stagingDirectory, entry.sourceFilename);
  const watermarkedPath = path.join(stagingDirectory, entry.outputFilename);
  await writeFile(normalizedPath, processed.normalized);
  await writeFile(watermarkedPath, branded.buffer);
  Object.assign(entry, {
    retrievedAt: new Date().toISOString(),
    rightsReference: entry.productPageUrl,
    contentType: downloaded.contentType,
    originalWidth: downloaded.metadata.width,
    originalHeight: downloaded.metadata.height,
    selectedImageRole: "official-product-card",
    sourceSha256: sha256(downloaded.source),
    normalizedSha256: sha256(processed.normalized),
    watermarkedSha256: sha256(branded.buffer),
    normalizedDHash: await dHash(processed.normalized),
    watermarkedDHash: await dHash(branded.buffer),
    lowResolutionException: processed.lowResolutionException,
    logoWidth: branded.logoWidth,
  });
  console.log(`${entry.model} -> ${entry.outputFilename}`);
}

await createContactSheet(manifest);

for (const entry of manifest) {
  for (const filename of [entry.sourceFilename, entry.outputFilename]) {
    const staged = path.join(stagingDirectory, filename);
    const temporary = path.join(outputDirectory, `${filename}.camera-refresh.tmp`);
    const destination = path.join(outputDirectory, filename);
    await rm(temporary, { force: true });
    await rename(staged, temporary);
    await rm(destination, { force: true });
    await rename(temporary, destination);
  }
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Refreshed ${manifest.length} camera products.`);
