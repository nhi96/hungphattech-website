import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/content/content-schema";
import type { Product, SolarProductGroup } from "@/types/content";
import { ProductExplorer } from "./product-explorer";

export function SolarCategoryPageContent({
  content,
  products,
  initialGroup = "panel",
}: {
  content: SiteContent;
  products: Product[];
  initialGroup?: SolarProductGroup;
}) {
  const solar = content.pages.solar;
  const heroAsset = content.assets[solar.hero.image.assetId];

  return (
    <>
      <section className="bg-[#0b0f12]">
        <div className="container-shell grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">{solar.hero.eyebrow}</p>
            <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.4rem)] font-black leading-none text-white">
              {solar.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#b8bec7]">
              {solar.hero.description}
            </p>
            <Link href="/lien-he" className="button-primary mt-8">
              {solar.hero.buttonLabel}
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#171c21]">
            <Image
              src={heroAsset.path}
              alt={solar.hero.alt}
              fill
              priority
              className="object-cover"
              style={{
                objectPosition: `${solar.hero.image.focalX} ${solar.hero.image.focalY}`,
              }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
      <section className="section-space bg-[#f4f5f3]">
        <div className="container-shell">
          <div className="mb-8 border-l-4 border-[#ffc400] bg-white p-5 text-sm leading-6 text-[#59616a]">
            {solar.notice}
          </div>
          <ProductExplorer
            items={products}
            initialCategory="dien-mat-troi"
            fixedCategory
            showSolarGroups
            solarContent={solar}
            assets={content.assets}
            initialSolarGroup={initialGroup}
          />
        </div>
      </section>
    </>
  );
}
