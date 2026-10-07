import {
  ArrowRight,
  Building2,
  Check,
  Home,
  ImagePlus,
  Phone,
  Store,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { HomeHero } from "@/components/home/home-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { articles } from "@/data/articles.demo";
import { categories } from "@/data/categories";
import type { SiteContent } from "@/lib/content/content-schema";

const audienceIcons = {
  family: Home,
  shop: Store,
  office: Building2,
  business: Warehouse,
} as const;

export function HomePageContent({ content }: { content: SiteContent }) {
  const home = content.pages.home;
  const sections = home.sections;

  const renderers = {
    categories: () => {
      const section = sections.categories;
      return (
        <section id="danh-muc-chinh" className="section-space bg-[#f4f5f3]">
          <div className="container-shell">
            <SectionHeading {...section} />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {categories
                .filter((category) => home.categoryImages[category.slug])
                .map((category, index) => {
                const imageRef = home.categoryImages[category.slug];
                const asset = content.assets[imageRef.assetId];
                return (
                  <Link
                    key={category.slug}
                    href={`/danh-muc/${category.slug}`}
                    className="group relative min-h-[360px] overflow-hidden bg-[#171c21]"
                  >
                    <Image
                      src={asset.path}
                      alt={asset.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{ objectPosition: `${imageRef.focalX} ${imageRef.focalY}` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <p className="font-mono text-sm font-bold text-[#ffc400]">0{index + 1}</p>
                      <h2 className="mt-2 text-3xl font-black text-white">{category.name}</h2>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-[#d8dce1]">{category.description}</p>
                      <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#ffc400]">
                        Xem danh mục <ArrowRight size={18} aria-hidden />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
    audiences: () => {
      const section = sections.audiences;
      return (
        <section className="section-space bg-[#171c21]">
          <div className="container-shell">
            <SectionHeading {...section} dark />
            <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {section.items.map((item) => {
                const Icon = audienceIcons[item.id as keyof typeof audienceIcons] ?? Home;
                return (
                  <article key={item.id} className="bg-[#171c21] p-7">
                    <Icon className="text-[#ffc400]" size={30} aria-hidden />
                    <h3 className="mt-8 text-xl font-extrabold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#b8bec7]">{item.description}</p>
                  </article>
                );
              })}
            </div>
            <Link href="/giai-phap" className="button-primary mt-8">
              {section.buttonLabel} <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </section>
      );
    },
    featured: () => {
      const section = sections.featured;
      return (
        <section data-testid="experience-section" className="section-space bg-[#f4f5f3]">
          <div className="container-shell">
            <SectionHeading {...section} />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {section.images.map((item) => {
                const asset = item.image.assetId
                  ? content.assets[item.image.assetId]
                  : null;
                return (
                  <figure key={item.id} className="overflow-hidden bg-[#171c21]">
                    <div className="relative aspect-[3/4] bg-black">
                      {asset ? (
                        <Image
                          src={asset.path}
                          alt={item.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain"
                          style={{
                            objectPosition: `${item.image.focalX} ${item.image.focalY}`,
                          }}
                        />
                      ) : (
                        <div className="grid size-full place-items-center border border-dashed border-white/25 bg-[#111518] text-center">
                          <div>
                            <ImagePlus className="mx-auto text-[#ffc400]" size={34} aria-hidden />
                            <p className="mt-3 text-sm font-bold text-[#b8bec7]">Chưa thêm ảnh</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <figcaption className="border-t-4 border-[#ffc400] px-5 py-4 text-lg font-extrabold text-white">
                      {item.label}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
    about: () => {
      const section = sections.about;
      return (
        <section className="section-space bg-[#0b0f12]">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">{section.eyebrow}</p>
              <h2 className="section-title mt-4 text-white">{section.title}</h2>
            </div>
            <div className="border-l border-white/15 pl-6 md:pl-10">
              {section.paragraphs.map((paragraph, index) => (
                <p key={paragraph} className={`${index ? "mt-5 text-[#b8bec7]" : "text-lg text-[#d7dbe0]"} leading-8`}>
                  {paragraph}
                </p>
              ))}
              <Link href="/gioi-thieu" className="button-secondary mt-8">
                {section.buttonLabel} <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      );
    },
    projects: () => {
      const section = sections.projects;
      return (
        <section data-testid="projects-section" className="section-space bg-[#f4f5f3]">
          <div className="container-shell">
            <SectionHeading {...section} />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {section.items.map((item, index) => {
                const asset = item.image.assetId
                  ? content.assets[item.image.assetId]
                  : null;
                return (
                  <article
                    key={item.id}
                    data-testid="project-card"
                    className="overflow-hidden border border-[#d9dde0] bg-white"
                  >
                    <div
                      data-testid="project-image"
                      className="relative aspect-[4/3] bg-[#171c21]"
                    >
                      {asset ? (
                        <Image
                          src={asset.path}
                          alt={item.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          style={{
                            objectPosition: `${item.image.focalX} ${item.image.focalY}`,
                          }}
                        />
                      ) : (
                        <div className="grid size-full place-items-center border border-dashed border-white/25 text-center">
                          <div>
                            <ImagePlus className="mx-auto text-[#ffc400]" size={34} aria-hidden />
                            <p className="mt-3 text-sm font-bold text-[#b8bec7]">Chưa thêm ảnh</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      data-testid="project-text"
                      className="min-h-36 border-t-4 border-[#ffc400] p-6"
                    >
                      <p className="text-xs font-black uppercase text-[#8b6b00]">
                        Công trình {index + 1}
                      </p>
                      <h3 className="mt-3 text-xl font-extrabold text-[#0b0f12]">
                        {item.title || "Tên công trình"}
                      </h3>
                      <p className="mt-3 leading-7 text-[#59616a]">
                        {item.description || "Thông tin công trình"}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
    process: () => {
      const section = sections.process;
      return (
        <section className="section-space bg-[#171c21]">
          <div className="container-shell">
            <SectionHeading {...section} dark />
            <ol className="mt-12 grid gap-px bg-white/10 md:grid-cols-4">
              {section.items.map((item, index) => (
                <li key={item.id} className="bg-[#171c21] p-7">
                  <span className="grid size-10 place-items-center bg-[#ffc400] font-black text-[#0b0f12]">{index + 1}</span>
                  <p className="mt-6 font-bold leading-6 text-white">{item.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ffc400]">
              <Check size={17} aria-hidden /> {section.note}
            </p>
          </div>
        </section>
      );
    },
    knowledge: () => {
      const section = sections.knowledge;
      return (
        <section className="section-space bg-[#f4f5f3]">
          <div className="container-shell">
            <SectionHeading {...section} />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {articles.map((article) => (
                <article key={article.slug} className="border-t-4 border-[#ffc400] bg-white p-6">
                  <p className="text-xs font-bold uppercase text-[#8b6b00]">{article.category}</p>
                  <h3 className="mt-4 text-xl font-extrabold leading-tight text-[#0b0f12]">{article.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#59616a]">{article.excerpt}</p>
                  <Link href="/kien-thuc" className="mt-6 inline-flex items-center gap-2 font-bold text-[#0b0f12]">
                    {section.buttonLabel} <ArrowRight size={17} aria-hidden />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    },
    contact: () => {
      const section = sections.contact;
      return (
        <section id="lien-he" className="section-space bg-[#ffc400] text-[#0b0f12]">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-black uppercase">{section.eyebrow}</p>
              <h2 className="section-title mt-4">{section.title}</h2>
              <p className="mt-5 leading-7 text-[#3e3a2b]">{section.description}</p>
              <div className="mt-7 grid gap-3">
                {content.site.phones.map((phone) => (
                  <a key={phone.id} href={`tel:${phone.value}`} className="flex items-center gap-3 border-t border-black/20 py-4 text-lg font-extrabold">
                    <Phone size={20} aria-hidden /> {phone.display}
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-[#f4f5f3] p-5 md:p-8"><ContactForm /></div>
          </div>
        </section>
      );
    },
  };

  return (
    <>
      <HomeHero home={home} assets={content.assets} />
      {home.sectionOrder.map((sectionId) => (
        <div key={sectionId}>{renderers[sectionId]()}</div>
      ))}
    </>
  );
}
