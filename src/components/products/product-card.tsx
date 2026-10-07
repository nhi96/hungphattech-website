import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/data/categories";
import { solarProductGroupLabels } from "@/data/solar-product-groups";
import type { Product } from "@/types/content";
import { DemoBadge } from "@/components/ui/demo-badge";

export function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.categorySlug);
  const isContainedImage = product.imageFit === "contain";
  const productGroupLabel = product.solarDetails
    ? solarProductGroupLabels[product.solarDetails.group]
    : category?.name;

  return (
    <article className="group flex min-h-full flex-col border border-[#d9dde0] bg-white">
      <Link
        href={`/san-pham/${product.slug}`}
        className={`relative block aspect-[4/3] overflow-hidden ${isContainedImage ? "bg-white" : "bg-[#171c21]"}`}
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <Image
          src={product.images[0]}
          alt={product.isDemo ? `Ảnh minh họa ${product.name}` : product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`${isContainedImage ? "object-contain p-5" : "object-cover"} transition-transform duration-300 group-hover:scale-[1.03]`}
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {product.isDemo ? <DemoBadge /> : null}
        <p className="mt-5 text-xs font-bold uppercase text-[#6a7179]">{productGroupLabel}</p>
        <h3 className="mt-2 break-words text-xl font-extrabold leading-tight text-[#0b0f12] [overflow-wrap:anywhere]">
          {product.name}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#59616a]">{product.summary}</p>
        <div className="mt-5 border-t border-[#e2e4e6] pt-4">
          <p className="text-xs font-bold text-[#6a7179]">
            {product.isDemo
              ? "Thương hiệu minh họa, chưa xác nhận phân phối"
              : "Thương hiệu tham khảo"}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0b0f12]">{product.brand}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="font-extrabold text-[#0b0f12]">
            {product.price === null
              ? "Liên hệ báo giá"
              : `${new Intl.NumberFormat("vi-VN").format(product.price)} ₫`}
          </span>
          <Link
            href={`/san-pham/${product.slug}`}
            className="grid size-11 shrink-0 place-items-center bg-[#ffc400] text-[#0b0f12]"
            aria-label={`Xem chi tiết ${product.name}`}
          >
            <ArrowUpRight aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
