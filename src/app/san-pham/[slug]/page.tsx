import type { Metadata } from "next";
import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import { DemoBadge } from "@/components/ui/demo-badge";
import { getCategory } from "@/data/categories";
import { getProduct, getRelatedProducts, products } from "@/data/products.demo";
import { solarProductGroupLabels } from "@/data/solar-product-groups";
import { getPublishedSiteContent } from "@/lib/content/content-loader";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return product
    ? {
        title: product.name,
        description: product.isDemo
          ? `${product.summary} Nội dung minh họa trong bản local.`
          : product.summary,
      }
    : { title: "Không tìm thấy sản phẩm" };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const { site } = await getPublishedSiteContent();
  const category = getCategory(product.categorySlug);
  const related = getRelatedProducts(product);
  const isContainedImage = product.imageFit === "contain";
  const productGroupLabel = product.solarDetails
    ? solarProductGroupLabels[product.solarDetails.group]
    : category?.name;

  return (
    <>
      <section className="bg-[#f4f5f3] py-12 text-[#0b0f12] md:py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {product.images.map((image, index) => (
              <div
                key={image}
                className={`relative overflow-hidden ${isContainedImage ? "bg-white" : "bg-[#171c21]"} ${index === 0 ? "aspect-[4/3] sm:col-span-2" : "aspect-square"}`}
              >
                <Image
                  src={image}
                  alt={
                    product.isDemo
                      ? `Ảnh minh họa ${product.name} ${index + 1}`
                      : `${product.name}${product.images.length > 1 ? ` ${index + 1}` : ""}`
                  }
                  fill
                  priority={index === 0}
                  className={isContainedImage ? "object-contain p-5 md:p-8" : "object-cover"}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            {product.isDemo ? <DemoBadge /> : null}
            <p
              className={`${product.isDemo ? "mt-6" : ""} text-sm font-bold uppercase text-[#8b6b00]`}
            >
              {productGroupLabel}
            </p>
            <h1 className="mt-3 break-words text-[clamp(2rem,5vw,4.4rem)] font-black leading-[1.02] [overflow-wrap:anywhere]">
              {product.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#59616a]">{product.description}</p>
            <div className="mt-7 border-y border-[#cfd3d6] py-5">
              <p className="text-sm font-bold text-[#59616a]">Giá</p>
              <p className="mt-1 text-2xl font-black">
                {product.price === null
                  ? "Liên hệ báo giá"
                  : `${new Intl.NumberFormat("vi-VN").format(product.price)} ₫`}
              </p>
            </div>
            <p className="mt-5 text-sm font-bold text-[#6a7179]">
              {product.isDemo
                ? `Thương hiệu minh họa, chưa xác nhận phân phối: ${product.brand}`
                : `Thương hiệu tham khảo: ${product.brand}`}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={`tel:${site.phones[0].value}`} className="button-dark">
                <Phone size={18} aria-hidden /> Gọi {site.phones[0].display}
              </a>
              <Link href="/lien-he" className="button-primary">
                Yêu cầu tư vấn
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section-space bg-white text-[#0b0f12]">
        <div className="container-shell grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">
              {product.isDemo ? "Đặc điểm minh họa" : "Đặc điểm"}
            </h2>
            <ul className="mt-6 grid gap-3">
              {product.features.map((feature) => (
                <li key={feature} className="border-t border-[#d9dde0] py-4 font-semibold">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-black">
              {product.isDemo ? "Thông số cần xác nhận" : "Thông số kỹ thuật"}
            </h2>
            <dl className="mt-6 border-t border-[#d9dde0]">
              {product.specifications.map((specification) => (
                <div
                  key={specification.label}
                  className="grid grid-cols-2 gap-4 border-b border-[#d9dde0] py-4"
                >
                  <dt className="text-[#59616a]">{specification.label}</dt>
                  <dd className="font-bold">{specification.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      {related.length ? (
        <section className="section-space bg-[#f4f5f3] text-[#0b0f12]">
          <div className="container-shell">
            <h2 className="section-title">Sản phẩm liên quan</h2>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
