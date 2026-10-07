import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const productRoot = path.join(root, "public", "images", "products");
const artifactRoot = path.join(root, "artifacts");
const logoPath = path.join(
  root,
  "public",
  "images",
  "hung-phat-logo-transparent.png",
);
const directories = ["cameras", "laptops", "desktops", "printers"];
const canvas = { width: 1200, height: 900 };
const productBox = { width: 920, height: 700 };

function isForeground(red, green, blue, alpha = 255) {
  if (alpha < 20) return false;
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance < 220 || (luminance < 242 && high - low > 11);
}

function findComponents(data, width, height, channels) {
  const foreground = new Uint8Array(width * height);
  for (let index = 0; index < foreground.length; index += 1) {
    const offset = index * channels;
    foreground[index] = isForeground(
      data[offset],
      data[offset + 1],
      data[offset + 2],
      channels === 4 ? data[offset + 3] : 255,
    )
      ? 1
      : 0;
  }

  const visited = new Uint8Array(foreground.length);
  const components = [];
  const queue = new Int32Array(foreground.length);
  for (let start = 0; start < foreground.length; start += 1) {
    if (!foreground[start] || visited[start]) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    visited[start] = 1;
    let area = 0;
    let left = width;
    let top = height;
    let right = 0;
    let bottom = 0;

    while (head < tail) {
      const current = queue[head++];
      const x = current % width;
      const y = Math.floor(current / width);
      area += 1;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);

      for (let nextY = Math.max(0, y - 1); nextY <= Math.min(height - 1, y + 1); nextY += 1) {
        for (let nextX = Math.max(0, x - 1); nextX <= Math.min(width - 1, x + 1); nextX += 1) {
          const next = nextY * width + nextX;
          if (foreground[next] && !visited[next]) {
            visited[next] = 1;
            queue[tail++] = next;
          }
        }
      }
    }

    components.push({ area, left, top, right, bottom });
  }
  return components;
}

function boxDistance(left, right) {
  const horizontal = Math.max(0, left.left - right.right, right.left - left.right);
  const vertical = Math.max(0, left.top - right.bottom, right.top - left.bottom);
  return Math.hypot(horizontal, vertical);
}

async function detectProductBounds(sourcePath) {
  const metadata = await sharp(sourcePath).metadata();
  const analysisScale = Math.min(1, 600 / Math.max(metadata.width, metadata.height));
  const analysisWidth = Math.max(1, Math.round(metadata.width * analysisScale));
  const analysisHeight = Math.max(1, Math.round(metadata.height * analysisScale));
  const { data, info } = await sharp(sourcePath)
    .resize(analysisWidth, analysisHeight, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const components = findComponents(data, info.width, info.height, info.channels)
    .filter((component) => component.area >= Math.max(12, info.width * info.height * 0.00004))
    .filter((component) => {
      const entirelyInLegacyLogo =
        component.bottom < info.height * 0.24 ||
        (component.right < info.width * 0.4 && component.bottom < info.height * 0.3);
      const intersectsContent =
        component.right >= info.width * 0.07 &&
        component.left <= info.width * 0.93 &&
        component.bottom >= info.height * 0.1 &&
        component.top <= info.height * 0.92;
      return !entirelyInLegacyLogo && intersectsContent;
    })
    .sort((left, right) => right.area - left.area);

  if (!components.length) {
    throw new Error(`Could not locate product foreground in ${sourcePath}`);
  }

  const largest = components[0];
  const selected = components.filter(
    (component) => {
      const detachedLabelBelow =
        component.top > largest.bottom + info.height * 0.01 &&
        component.bottom - component.top < info.height * 0.18;
      return (
        !detachedLabelBelow &&
        component.area >= largest.area * 0.1 &&
        (component.area >= largest.area * 0.25 ||
          boxDistance(largest, component) <= Math.max(info.width, info.height) * 0.04)
      );
    },
  );

  const regionPadding = Math.round(Math.max(info.width, info.height) * 0.01);
  const keepRegions = selected.map((component) => {
    const left = Math.max(
      0,
      Math.floor((component.left - regionPadding) / analysisScale),
    );
    const top = Math.max(
      0,
      Math.floor((component.top - regionPadding) / analysisScale),
    );
    const right = Math.min(
      metadata.width - 1,
      Math.ceil((component.right + regionPadding) / analysisScale),
    );
    const bottom = Math.min(
      metadata.height - 1,
      Math.ceil((component.bottom + regionPadding) / analysisScale),
    );
    return { left, top, right, bottom };
  });
  const sourceBounds = keepRegions.reduce(
    (bounds, region) => ({
      left: Math.min(bounds.left, region.left),
      top: Math.min(bounds.top, region.top),
      right: Math.max(bounds.right, region.right),
      bottom: Math.max(bounds.bottom, region.bottom),
    }),
    { ...keepRegions[0] },
  );

  return {
    sourceBounds: {
      left: sourceBounds.left,
      top: sourceBounds.top,
      width: sourceBounds.right - sourceBounds.left + 1,
      height: sourceBounds.bottom - sourceBounds.top + 1,
    },
    keepRegions: keepRegions.map((region) => ({
      left: region.left - sourceBounds.left,
      top: region.top - sourceBounds.top,
      right: region.right - sourceBounds.left,
      bottom: region.bottom - sourceBounds.top,
    })),
  };
}

async function createCleanProduct(detection, sourcePath) {
  const { sourceBounds, keepRegions } = detection;
  const { data, info } = await sharp(sourcePath)
    .extract(sourceBounds)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cleaned = Buffer.alloc(data.length);

  for (let index = 0; index < info.width * info.height; index += 1) {
    const x = index % info.width;
    const y = Math.floor(index / info.width);
    const insideKeptRegion = keepRegions.some(
      (region) =>
        x >= region.left &&
        x <= region.right &&
        y >= region.top &&
        y <= region.bottom,
    );
    const offset = index * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];
    const foreground =
      insideKeptRegion && isForeground(red, green, blue, alpha);
    cleaned[offset] = red;
    cleaned[offset + 1] = green;
    cleaned[offset + 2] = blue;
    cleaned[offset + 3] = foreground ? alpha : 0;
  }

  return sharp(cleaned, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .resize(productBox.width, productBox.height, {
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer({ resolveWithObject: true });
}

function manifestSourceBounds(detection) {
  return {
    left: detection.sourceBounds.left,
    top: detection.sourceBounds.top,
    width: detection.sourceBounds.width,
    height: detection.sourceBounds.height,
  };
}

async function createContactSheets(entries) {
  const columns = 5;
  const rows = 6;
  const tileWidth = 240;
  const tileHeight = 210;
  const pageSize = columns * rows;

  for (let page = 0; page * pageSize < entries.length; page += 1) {
    const pageEntries = entries.slice(page * pageSize, (page + 1) * pageSize);
    const composites = [];
    for (let index = 0; index < pageEntries.length; index += 1) {
      const entry = pageEntries[index];
      const image = await sharp(path.join(root, "public", entry.output))
        .resize(tileWidth, 180, { fit: "contain", background: "#ffffff" })
        .png()
        .toBuffer();
      const label = path.basename(entry.output).replace("-hung-phat.webp", "");
      const svg = Buffer.from(
        `<svg width="${tileWidth}" height="30"><rect width="100%" height="100%" fill="white"/><text x="8" y="19" font-size="11" font-family="Arial" fill="#111">${label.slice(0, 34)}</text></svg>`,
      );
      composites.push({
        input: image,
        left: (index % columns) * tileWidth,
        top: Math.floor(index / columns) * tileHeight,
      });
      composites.push({
        input: svg,
        left: (index % columns) * tileWidth,
        top: Math.floor(index / columns) * tileHeight + 180,
      });
    }
    await sharp({
      create: {
        width: columns * tileWidth,
        height: rows * tileHeight,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite(composites)
      .png()
      .toFile(path.join(artifactRoot, `rebrand-contact-sheet-${page + 1}.png`));
  }
}

await mkdir(artifactRoot, { recursive: true });
const logo = await sharp(logoPath)
  .resize(96, 70, { fit: "contain" })
  .png()
  .toBuffer();
const entries = [];

for (const directory of directories) {
  const directoryPath = path.join(productRoot, directory);
  const files = (await readdir(directoryPath))
    .filter((file) => !file.endsWith("-hung-phat.webp"))
    .sort();

  for (const file of files) {
    const sourcePath = path.join(directoryPath, file);
    const detection = await detectProductBounds(sourcePath);
    const cleaned = await createCleanProduct(detection, sourcePath);
    const productLeft = Math.round((canvas.width - cleaned.info.width) / 2);
    const productTop = Math.round((canvas.height - cleaned.info.height) / 2) + 20;
    const outputFile = `${path.parse(file).name}-hung-phat.webp`;
    const outputPath = path.join(directoryPath, outputFile);

    await sharp({
      create: {
        width: canvas.width,
        height: canvas.height,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite([
        { input: cleaned.data, left: productLeft, top: productTop },
        { input: logo, left: 40, top: 32 },
      ])
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(outputPath);

    entries.push({
      source: `/images/products/${directory}/${file}`,
      output: `/images/products/${directory}/${outputFile}`,
      sourceBounds: manifestSourceBounds(detection),
      productBounds: {
        left: productLeft,
        top: productTop,
        width: cleaned.info.width,
        height: cleaned.info.height,
      },
    });
  }
}

if (entries.length !== 59) {
  throw new Error(`Expected 59 source images, found ${entries.length}`);
}

await writeFile(
  path.join(artifactRoot, "rebrand-product-assets.json"),
  `${JSON.stringify(entries, null, 2)}\n`,
  "utf8",
);
await createContactSheets(entries);
console.log(`Generated ${entries.length} branded product images.`);
