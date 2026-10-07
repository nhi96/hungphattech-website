import Image from "next/image";
import Link from "next/link";
import type { CameraPageContent, SiteContent } from "@/lib/content/content-schema";
import type { CategorySlug, Product } from "@/types/content";
import { ProductExplorer } from "./product-explorer";

export function CategoryPageContent({
  page,
  assets,
  products,
  categorySlug,
}: {
  page: CameraPageContent;
  assets: SiteContent["assets"];
  products: Product[];
  categorySlug: CategorySlug;
}) {
  const heroAsset = assets[page.hero.image.assetId];
  const introductionAsset = assets[page.introduction.image.assetId];

  return (
    <>
      <section className="bg-[#0b0f12]">
        <div className="container-shell grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">{page.hero.eyebrow}</p>
            <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.4rem)] font-black leading-none text-white">
              {page.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#b8bec7]">
              {page.hero.description}
            </p>
            <Link href="/lien-he" className="button-primary mt-8">
              {page.hero.buttonLabel}
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#171c21]">
            <Image
              src={heroAsset.path}
              alt={page.hero.alt}
              fill
              priority
              className="object-cover"
              style={{
                objectPosition: `${page.hero.image.focalX} ${page.hero.image.focalY}`,
              }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
      <section className="section-space bg-[#f4f5f3]">
        <div className="container-shell">
          <div className="mb-8 border-l-4 border-[#ffc400] bg-white p-5 text-sm leading-6 text-[#59616a]">
            {page.notice}
          </div>
          <section
            data-testid="category-introduction"
            className="mb-8 grid overflow-hidden border border-[#d9dde0] bg-white lg:grid-cols-[0.8fr_1.2fr]"
          >
            <div className="relative aspect-[4/3] bg-[#171c21] lg:aspect-auto lg:min-h-72">
              <Image
                src={introductionAsset.path}
                alt={page.introduction.alt}
                fill
                className="object-cover"
                style={{
                  objectPosition: `${page.introduction.image.focalX} ${page.introduction.image.focalY}`,
                }}
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="p-6 md:p-8">
              <p className="eyebrow">{page.introduction.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-black text-[#0b0f12]">
                {page.introduction.title}
              </h2>
              <p className="mt-4 leading-7 text-[#59616a]">
                {page.introduction.description}
              </p>
            </div>
          </section>
          <ProductExplorer
            items={products}
            initialCategory={categorySlug}
            fixedCategory
          />
        </div>
      </section>
    </>
  );
}
