import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });

const captures = [
  {
    name: "home-desktop.png",
    path: "/",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "home-mobile.png",
    path: "/",
    viewport: { width: 390, height: 844 },
  },
  {
    name: "products-desktop.png",
    path: "/san-pham",
    viewport: { width: 1440, height: 900 },
  },
];

for (const capture of captures) {
  const page = await browser.newPage({ viewport: capture.viewport });
  await page.goto(`http://127.0.0.1:3000${capture.path}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: `artifacts/screenshots/${capture.name}`,
    fullPage: true,
  });
  await page.close();
}

await browser.close();
