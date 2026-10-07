import { ArrowRight, Camera, Laptop, LockKeyhole, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import type { HomeContent, SiteContent } from "@/lib/content/content-schema";

const categoryIcons = {
  "dien-mat-troi": Sun,
  "camera-giam-sat": Camera,
  "laptop-pc": Laptop,
  "khoa-cua-thong-minh": LockKeyhole,
} as const;

export function HomeHero({
  home,
  assets,
}: {
  home: HomeContent;
  assets: SiteContent["assets"];
}) {
  const hero = home.hero;
  const asset = assets[hero.image.assetId];
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[hero.style.alignment];
  const titleSizeClass = {
    small: "text-3xl sm:text-4xl",
    medium: "text-4xl sm:text-5xl",
    large: "text-4xl sm:text-5xl lg:text-[3.25rem]",
  }[hero.style.titleSize];

  return (
    <section
      data-testid="home-hero"
      className="relative overflow-hidden border-b border-white/10 bg-[#080b0d]"
    >
      <Image
        src={asset.path}
        alt={asset.alt}
        fill
        preload
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: `${hero.image.focalX} ${hero.image.focalY}` }}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,#080b0d_0%,rgba(8,11,13,0.96)_38%,rgba(8,11,13,0.58)_70%,rgba(8,11,13,0.2)_100%)]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#080b0d]/35 md:bg-transparent" aria-hidden />

      <div className="container-shell relative z-10 min-h-[550px] py-6 sm:min-h-[600px] sm:py-8 xl:min-h-[640px] xl:py-10">
        <div className={`max-w-[620px] ${alignmentClass}`}>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#ffc400]/40 bg-[#ffc400]/10 px-4 py-2 text-[0.68rem] font-black uppercase text-[#ffc400]">
            <span className="size-2 rounded-full bg-[#ffc400] shadow-[0_0_10px_#ffc400]" aria-hidden />
            {hero.eyebrow}
          </p>
          <h1 className={`mt-4 font-black leading-[1.04] text-white ${titleSizeClass}`}>
            {hero.title}
            <span data-testid="hero-highlight" className="mt-1 block text-[#ffc400]">
              {hero.highlight}
            </span>
          </h1>
          <p className="mt-4 max-w-[570px] text-sm leading-6 text-[#b8c4d2] sm:text-base sm:leading-7">
            {hero.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:flex">
            <Link href="/lien-he#form-lien-he" className="button-primary px-3 sm:px-5">
              {hero.primaryLabel} <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/san-pham" className="button-secondary px-3 sm:px-5">
              {hero.secondaryLabel}
            </Link>
          </div>

          <dl className="mt-6 grid max-w-[560px] grid-cols-3 border-t border-white/15 pt-4">
            {hero.metrics.map((metric) => (
              <div key={metric.label} className="pr-2 sm:pr-4">
                <dd
                  data-testid="hero-metric"
                  className="text-xl font-black text-[#ffc400] sm:text-2xl"
                >
                  {metric.value}
                </dd>
                <dt className="mt-1 text-[0.62rem] font-bold uppercase leading-4 text-[#91a0b2] sm:text-xs">
                  {metric.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        <nav
          aria-label="Danh mục sản phẩm nổi bật"
          className="mt-6 flex w-full max-w-full snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:absolute xl:bottom-8 xl:right-0 xl:mt-0 xl:w-[620px] xl:grid-cols-4"
        >
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug];

            return (
              <Link
                key={category.slug}
                href={`/danh-muc/${category.slug}`}
                className="group min-h-[126px] min-w-[168px] snap-start rounded-md border border-[#ffc400]/25 bg-[#111518]/85 p-4 text-white shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-[#ffc400]/70 hover:bg-[#171c21]/95 md:min-w-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.62rem] font-black uppercase text-[#ffc400]">
                    {category.shortName}
                  </span>
                  <Icon size={20} className="text-white" aria-hidden />
                </div>
                <span className="mt-5 block text-sm font-extrabold leading-5">{category.name}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-[0.68rem] font-bold text-[#91a0b2] group-hover:text-white">
                  Xem danh mục <ArrowRight size={13} aria-hidden />
                </span>
              </Link>
            );
          })}
        </nav>

        <p className="mt-2 border-l-4 border-[#ffc400] pl-3 text-[0.68rem] text-[#b8bec7] xl:absolute xl:bottom-2 xl:left-0">
          Hình ảnh minh họa trong bản local
        </p>
      </div>
    </section>
  );
}
