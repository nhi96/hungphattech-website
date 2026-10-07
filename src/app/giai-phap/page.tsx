import type { Metadata } from "next";
import { Building2, Home, Store, Warehouse } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Giải pháp và dịch vụ",
  description: "Các hướng tư vấn công nghệ theo bối cảnh sử dụng.",
};

const solutions = [
  { icon: Home, title: "Gia đình", needs: ["An ninh khu vực", "Thiết bị làm việc và học tập", "Tiện nghi ra vào", "Nhu cầu điện mặt trời"] },
  { icon: Store, title: "Cửa hàng", needs: ["Quan sát quầy và kho", "Máy tính vận hành", "Kiểm soát cửa", "Tối ưu thiết bị theo mặt bằng"] },
  { icon: Building2, title: "Văn phòng", needs: ["Máy tính cho nhân sự", "Quan sát khu vực chung", "Quản lý ra vào", "Cấu hình theo phòng ban"] },
  { icon: Warehouse, title: "Doanh nghiệp", needs: ["Khảo sát quy mô", "Cấu hình theo tải và tác vụ", "Phân vùng giám sát", "Kế hoạch triển khai"] },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Giải pháp và dịch vụ"
        title="BẮT ĐẦU TỪ NHU CẦU, KHÔNG TỪ CẤU HÌNH CÓ SẴN"
        description="Các nhóm giải pháp dưới đây là định hướng nội dung để duyệt. Phạm vi triển khai thực tế cần doanh nghiệp xác nhận."
        action={{ href: "/lien-he", label: "Yêu cầu tư vấn" }}
      />
      <section className="section-space bg-[#f4f5f3] text-[#0b0f12]">
        <div className="container-shell grid gap-5 md:grid-cols-2">
          {solutions.map((solution, index) => (
            <article key={solution.title} className="border border-[#d9dde0] bg-white p-7 md:p-9">
              <div className="flex items-center justify-between">
                <solution.icon className="text-[#a87f00]" size={34} aria-hidden />
                <span className="font-mono text-sm text-[#747b83]">0{index + 1}</span>
              </div>
              <h2 className="mt-8 text-3xl font-black">{solution.title}</h2>
              <ul className="mt-6 grid gap-3 text-[#59616a]">
                {solution.needs.map((need) => (
                  <li key={need} className="border-t border-[#e1e3e5] pt-3">
                    {need}
                  </li>
                ))}
              </ul>
              <Link href="/lien-he" className="button-dark mt-7">
                Trao đổi nhu cầu
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
