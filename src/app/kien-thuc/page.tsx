import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { articles } from "@/data/articles.demo";

export const metadata: Metadata = {
  title: "Kiến thức công nghệ",
  description: "Các chủ đề nội dung mẫu giúp khách hàng chuẩn bị nhu cầu tư vấn.",
};

export default function KnowledgePage() {
  return (
    <>
      <PageHero
        eyebrow="Kiến thức công nghệ"
        title="CHUẨN BỊ THÔNG TIN TRƯỚC KHI CHỌN THIẾT BỊ"
        description="Các bài dưới đây là đề cương minh họa, chưa phải nội dung tư vấn kỹ thuật hoàn chỉnh."
      />
      <section className="section-space bg-[#f4f5f3] text-[#0b0f12]">
        <div className="container-shell grid gap-5 md:grid-cols-3">
          {articles.map((article, index) => (
            <article key={article.slug} className="flex min-h-72 flex-col border border-[#d9dde0] bg-white p-7">
              <div className="flex items-center justify-between">
                <BookOpen className="text-[#a87f00]" aria-hidden />
                <span className="font-mono text-sm text-[#777e85]">0{index + 1}</span>
              </div>
              <p className="mt-8 text-xs font-bold uppercase text-[#8b6b00]">{article.category}</p>
              <h2 className="mt-3 text-2xl font-black leading-tight">{article.title}</h2>
              <p className="mt-4 text-sm leading-6 text-[#59616a]">{article.excerpt}</p>
              <p className="mt-auto pt-6 text-xs font-bold uppercase text-[#777e85]">Nội dung mẫu - cần biên tập</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
