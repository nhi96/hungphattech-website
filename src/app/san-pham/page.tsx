import type { Metadata } from "next";
import { ProductExplorer } from "@/components/products/product-explorer";
import { PageHero } from "@/components/ui/page-hero";
import { products } from "@/data/products.demo";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description:
    "Danh mục thiết bị và sản phẩm tham khảo thuộc bốn nhóm công nghệ của Hưng Phát Tech.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Danh sách sản phẩm"
        title="TÌM THIẾT BỊ THEO NHU CẦU"
        description="Thông tin sản phẩm tham khảo. Khả năng cung ứng, cấu hình và tình trạng phân phối sẽ được Hưng Phát xác nhận khi tư vấn."
        action={{ href: "/lien-he", label: "Yêu cầu tư vấn" }}
      />
      <section className="section-space bg-[#f4f5f3]">
        <div className="container-shell">
          <ProductExplorer items={products} />
        </div>
      </section>
    </>
  );
}
