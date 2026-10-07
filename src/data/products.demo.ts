import type { Product } from "@/types/content";
import { cameraProducts } from "./products/cameras.ts";
import { lockProducts } from "./products/locks.ts";
import { desktopProducts, laptopProducts, printerProducts } from "./products/office.ts";
import { solarBatteries } from "./products/solar-batteries.ts";
import { solarInverters } from "./products/solar-inverters.ts";
import { solarPanels } from "./products/solar-panels.ts";

export const products: Product[] = [
  ...solarPanels,
  ...solarInverters,
  ...solarBatteries,
  ...cameraProducts,
  ...laptopProducts,
  ...desktopProducts,
  ...printerProducts,
  ...lockProducts,
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3) {
  return products
    .filter(
      (candidate) =>
        candidate.categorySlug === product.categorySlug &&
        candidate.slug !== product.slug &&
        (!product.solarDetails ||
          candidate.solarDetails?.group === product.solarDetails.group) &&
        (!product.computingDetails ||
          candidate.computingDetails?.group === product.computingDetails.group),
    )
    .slice(0, limit);
}
