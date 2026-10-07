import type { Metadata } from "next";
import { ImagePlus } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Dự án - Cần bổ sung",
  description: "Trang dự án đang chờ ảnh và thông tin công trình thực tế đã được xác minh.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Dự án"
        title="DỰ ÁN THỰC TẾ (CẦN BỔ SUNG)"
        description="Bản local chưa có ảnh, số liệu hoặc thông tin công trình đã được Hưng Phát xác nhận."
        action={{ href: "/lien-he", label: "Liên hệ Hưng Phát" }}
      />
      <section className="section-space bg-[#f4f5f3] text-[#0b0f12]">
        <div className="container-shell grid min-h-[420px] place-items-center border border-dashed border-[#959ca3] bg-white p-8 text-center">
          <div>
            <ImagePlus className="mx-auto text-[#a87f00]" size={52} aria-hidden />
            <h2 className="mt-6 text-3xl font-black">Chưa có dữ liệu dự án để xuất bản</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#59616a]">
              Cần doanh nghiệp cung cấp ảnh có quyền sử dụng, địa điểm được phép công bố, mô tả
              nhu cầu và phạm vi công việc trước khi thêm dự án vào website.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
