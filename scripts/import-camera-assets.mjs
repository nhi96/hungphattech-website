import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const base = "https://mayvanphongthienloc.com/sanpham";
const entries = [
  ["IPC-C22EP", "camea-ipc-c22ep-cue-2", "imou-ipc-c22ep.webp"],
  ["IPC-C22SP", "camera-imou-cue-2e-c22sp-2mp-dam-thoai-2-chieu-video-full-hd", "imou-ipc-c22sp.webp"],
  ["IPC-S2VP-5M0WR", "camera-imou-ipc-s2vp-5m0wr-goi-video-5mp-rex-vt", "imou-ipc-s2vp-5m0wr.webp"],
  ["IPC-S2XEP-6M0S", "camera-imou-ipc-s2xep-6m0s-6mp-trong-nha", "imou-ipc-s2xep-6m0s.webp"],
  ["IPC-S2XEP-10M0S", "camera-imou-ipc-s2xep-10m0s-10mp", "imou-ipc-s2xep-10m0s.webp"],
  ["IPC-A32P-PRO", "camera-ipc-a32p-pro-ranger-2-pro-3mp", "imou-ipc-a32p-pro.webp"],
  ["IPC-A52P-PRO", "camera-wifi-imou-ipc-a52p-pro-ranger-2-pro-5mp", "imou-ipc-a52p-pro.webp"],
  ["IPC-K2MP-3H1WE", "camera-ipc-k2mp-3h1we-ranger-mini-3mp", "imou-ipc-k2mp-3h1we.webp"],
  ["IPC-K2MP-5H1WE", "camera-ipc-k2mp-5h1we-ranger-mini-5mp", "imou-ipc-k2mp-5h1we.webp"],
  ["IPC-S2VBP-5M0WR", "camera-ipc-s2vbp-5m0wr-rex-vt-pro-3k", "imou-ipc-s2vbp-5m0wr.webp"],
  ["IPC-S2XP-6M0WED", "camera-wifi-imou-ranger-dual-s2xp-6m0wed-3mp-3mp-dam-thoai-quay-quet", "imou-ipc-s2xp-6m0wed.webp"],
  ["IPC-S2XP-10M0WED", "camera-ipc-s2xp-10m0wed-ranger-dual-10mp", "imou-ipc-s2xp-10m0wed.webp"],
  ["IPC-S6DP-3M0WEB", "camera-ipc-s6dp-3m0web", "imou-ipc-s6dp-3m0web.webp"],
  ["IPC-S6DP-5M0WEB", "camera-ipc-s6dp-5m0web-bulb-cam-5mp", "imou-ipc-s6dp-5m0web.webp"],
  ["DS-2CV2121G2-IDW", "camera-ip-wifi-2mp-hikvision-ds-2cv2121g2-idw", "hikvision-ds-2cv2121g2-idw.webp"],
  ["F22FEP", "camera-ngoai-troi-imou-bullet2-f22fep-2mp-dam-thoai-dem-full-mau", "imou-f22fep.webp"],
  ["F32FP", "camera-ngoai-troi-imou-bullet-2e-f32fp-3mp-dem-full-mau", "imou-f32fp.webp"],
  ["F52FP", "camera-ngoai-troi-imou-bullet-2e-f52fp-5mp-dem-full-mau", "imou-f52fp.webp"],
  ["S3EP-3M0WEB", "camera-ngoai-troi-imou-bullet-3-s3ep-3m0web-3mp-dam-thoai-dem-co-mau-ai-ip67", "imou-s3ep-3m0web.webp"],
  ["S3EP-5M0WEB", "camera-ngoai-troi-imou-bullet-3-s3ep-5m0web-5mp-dam-thoai-dem-co-mau-ai-ip67", "imou-s3ep-5m0web.webp"],
  ["GS7EP-3M0WE", "camera-ngoai-troi-imou-cruiser-2-gs7ep-3m0we-3mp-dam-thoai-quay-quet-dem-co-mau-ai-ip66", "imou-gs7ep-3m0we.webp"],
  ["GS7EP-5M0WE", "camera-ngoai-troi-imou-cruiser-2-gs7ep-5m0we-5mp-dam-thoai-quay-quet-dem-co-mau-ai-ip66", "imou-gs7ep-5m0we.webp"],
  ["IPC-S7XP-6M0WED", "camera-ngoai-troi-imou-cruiser-dual-s7xp-3mp-3mp-ip66-dam-thoai-dem-full-mau", "imou-ipc-s7xp-6m0wed.webp"],
  ["IPC-S7XP-10M0WED", "camera-ngoai-troi-imou-cruiser-dual-s7xp-5mp-5mp-ip66-dam-thoai-dem-full-mau", "imou-ipc-s7xp-10m0wed.webp"],
  ["S21FEP", "camera-ngoai-troi-imou-cruiser-se-s21fep-2mp-dam-thoai-quay-quet-dem-full-mau", "imou-s21fep.webp"],
  ["S41FEP", "camera-ngoai-troi-imou-cruiser-se-s41fep-4mp-dam-thoai-quay-quet-dem-full-mau", "imou-s41fep.webp"],
  ["S51FEP", "camera-ngoai-troi-imou-cruiser-se-s51fep-5mp-dam-thoai-quay-quet-dem-full-mau", "imou-s51fep.webp"],
  ["IPC-S7UP-11M0WED", "camera-wifi-ngoai-troi-imou-cruiser-triple-ipc-s7up-11m0wed-11mp-3-ong-kinh-quay-quet-ip66", "imou-ipc-s7up-11m0wed.webp"],
];

const outputDirectory = path.join(process.cwd(), "public", "images", "products", "cameras");
await mkdir(outputDirectory, { recursive: true });

const manifest = [
  "# Camera Product Sources",
  "",
  "Retrieved: 2026-10-02",
  "",
  "| Model | Product page | Image source | Local image |",
  "| --- | --- | --- | --- |",
];

for (const [model, sourceSlug, filename] of entries) {
  const productUrl = `${base}/${sourceSlug}/`;
  const response = await fetch(productUrl);
  if (!response.ok) throw new Error(`${model}: ${response.status} ${productUrl}`);
  const html = await response.text();
  const imageUrl =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
  if (!imageUrl) throw new Error(`${model}: missing og:image`);

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error(`${model}: image ${imageResponse.status}`);
  const input = Buffer.from(await imageResponse.arrayBuffer());
  const normalized = await sharp(input)
    .flatten({ background: "#ffffff" })
    .resize(1200, 900, {
      fit: "contain",
      background: "#ffffff",
      withoutEnlargement: false,
    })
    .webp({ quality: 88 })
    .toFile(path.join(outputDirectory, filename));

  if (!normalized.width || !normalized.height) {
    throw new Error(`${model}: failed to normalize`);
  }

  manifest.push(
    `| ${model} | ${productUrl} | ${imageUrl} | /images/products/cameras/${filename} |`,
  );
  console.log(`${model} -> ${filename}`);
}

await writeFile(
  path.join(process.cwd(), "docs", "sources", "camera-products.md"),
  `${manifest.join("\n")}\n`,
  "utf8",
);
