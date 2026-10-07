import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PreviewBridge } from "@/components/admin/preview-bridge";
import { HomePageContent } from "@/components/home/home-page-content";
import { CategoryPageContent } from "@/components/products/category-page-content";
import { SolarCategoryPageContent } from "@/components/products/solar-category-page-content";
import { products } from "@/data/products.demo";
import { assertEditorReadAccess } from "@/lib/content/editor-access";
import { getDraftSiteContent } from "@/lib/content/content-loader";
import type { SolarProductGroup } from "@/types/content";

export default async function EditorPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ group?: string | string[] }>;
}) {
  const { page } = await params;
  if (page !== "home" && page !== "solar" && page !== "camera") notFound();

  const headerList = await headers();
  const host = headerList.get("host") ?? "127.0.0.1:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  try {
    assertEditorReadAccess(new Request(`${protocol}://${host}/quan-tri/xem-truoc/${page}`));
  } catch {
    notFound();
  }

  const content = await getDraftSiteContent();
  const rawGroup = (await searchParams).group;
  const groupValue = Array.isArray(rawGroup) ? rawGroup[0] : rawGroup;
  const initialGroup: SolarProductGroup =
    groupValue === "inverter" || groupValue === "battery" ? groupValue : "panel";
  const solarProducts = products.filter(
    (product) => product.categorySlug === "dien-mat-troi",
  );
  const cameraProducts = products.filter(
    (product) => product.categorySlug === "camera-giam-sat",
  );

  return (
    <>
      <PreviewBridge />
      {page === "home" ? (
        <HomePageContent content={content} />
      ) : page === "solar" ? (
        <SolarCategoryPageContent
          content={content}
          products={solarProducts}
          initialGroup={initialGroup}
        />
      ) : (
        <CategoryPageContent
          page={content.pages.camera}
          assets={content.assets}
          products={cameraProducts}
          categorySlug="camera-giam-sat"
        />
      )}
    </>
  );
}
