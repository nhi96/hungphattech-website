import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductExplorer } from "@/components/products/product-explorer";
import { CategoryPageContent } from "@/components/products/category-page-content";
import { SolarCategoryPageContent } from "@/components/products/solar-category-page-content";
import { categories, getCategory } from "@/data/categories";
import { products } from "@/data/products.demo";
import { getPublishedSiteContent } from "@/lib/content/content-loader";
import type { CategorySlug } from "@/types/content";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

const legacyComputingSlugs = ["laptop", "may-tinh-de-ban", "may-in"];

export function generateStaticParams() {
  return [
    ...categories.map((category) => ({ slug: category.slug })),
    ...legacyComputingSlugs.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  return category
    ? { title: category.name, description: category.description }
    : { title: "Không tìm thấy danh mục" };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  if (legacyComputingSlugs.includes(slug)) {
    redirect("/danh-muc/laptop-pc");
  }
  const category = getCategory(slug);
  if (!category) notFound();
  const categoryProducts = products.filter(
    (product) => product.categorySlug === category.slug,
  );

  if (category.slug === "dien-mat-troi") {
    const content = await getPublishedSiteContent();
    return (
      <SolarCategoryPageContent
        content={content}
        products={categoryProducts}
      />
    );
  }

  if (category.slug === "camera-giam-sat") {
    const content = await getPublishedSiteContent();
    return (
      <CategoryPageContent
        page={content.pages.camera}
        assets={content.assets}
        products={categoryProducts}
        categorySlug={category.slug}
      />
    );
  }

  return (
    <>
      <section className="bg-[#0b0f12]">
        <div className="container-shell grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">Danh mục thiết bị</p>
            <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.4rem)] font-black leading-none text-white">
              {category.name}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#b8bec7]">{category.description}</p>
            <Link href="/lien-he" className="button-primary mt-8">
              Yêu cầu tư vấn
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#171c21]">
            <Image
              src={category.image}
              alt={`Ảnh minh họa danh mục ${category.name}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
      <section className="section-space bg-[#f4f5f3]">
        <div className="container-shell">
          <div className="mb-8 border-l-4 border-[#ffc400] bg-white p-5 text-sm leading-6 text-[#59616a]">
            Thông tin sản phẩm tham khảo. Khả năng cung ứng, cấu hình và tình trạng phân phối
            cần được Hưng Phát xác nhận khi tư vấn.
          </div>
          <ProductExplorer
            items={categoryProducts}
            initialCategory={category.slug as CategorySlug}
            fixedCategory
            showComputingGroups={category.slug === "laptop-pc"}
          />
        </div>
      </section>
    </>
  );
}
