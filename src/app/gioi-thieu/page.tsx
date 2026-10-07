import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { getPublishedSiteContent } from "@/lib/content/content-loader";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublishedSiteContent();
  return {
    title: "Giới thiệu",
    description: `Giới thiệu ${site.legalName} và các nhóm thiết bị công nghệ.`,
  };
}

export default async function AboutPage() {
  const { site } = await getPublishedSiteContent();
  const focus = [
    "Điện mặt trời",
    "Camera giám sát",
    "Laptop và PC",
    "Khóa cửa thông minh",
  ];

  return (
    <>
      <PageHero
        eyebrow="Giới thiệu"
        title="HƯNG PHÁT"
        description="Thương hiệu thiết bị công nghệ hướng tới nhu cầu thực tế của gia đình, cửa hàng, văn phòng và doanh nghiệp."
        action={{ href: "/lien-he", label: "Liên hệ tư vấn" }}
      />
      <section className="section-space bg-[#f4f5f3] text-[#0b0f12]">
        <div className="container-shell grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Thông tin doanh nghiệp</p>
            <h2 className="section-title mt-4">{site.legalName}</h2>
            <p className="mt-6 text-lg leading-8 text-[#59616a]">
              Website được xây dựng để khách hàng tiếp cận bốn nhóm công nghệ trong một hệ thống
              điều hướng thống nhất, thay vì chỉ tập trung vào một lĩnh vực.
            </p>
          </div>
          <div className="border-l border-[#ccd0d4] pl-6 md:pl-10">
            <h2 className="text-xl font-extrabold">Nhóm sản phẩm trọng tâm</h2>
            <ul className="mt-6 grid gap-4">
              {focus.map((item) => (
                <li key={item} className="flex items-center gap-3 border-b border-[#d9dde0] pb-4 font-bold">
                  <CheckCircle2 className="text-[#a87f00]" size={21} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm leading-6 text-[#59616a]">
              Các nội dung về lịch sử, năng lực, chứng nhận và cam kết dịch vụ đang để trống cho
              tới khi doanh nghiệp cung cấp dữ liệu xác thực.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
