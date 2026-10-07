import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { getPublishedSiteContent } from "@/lib/content/content-loader";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublishedSiteContent();
  return {
    title: "Liên hệ",
    description: `Liên hệ ${site.brandName} qua hai số điện thoại hoặc tìm đường tới địa chỉ doanh nghiệp.`,
  };
}

export default async function ContactPage() {
  const { site } = await getPublishedSiteContent();
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
  return (
    <>
      <PageHero
        eyebrow="Liên hệ"
        title="TRAO ĐỔI NHU CẦU CÔNG NGHỆ"
        description="Gọi trực tiếp để liên hệ ngay. Biểu mẫu bên dưới chỉ dùng để kiểm tra trải nghiệm local."
      />
      <section className="section-space bg-[#f4f5f3] text-[#0b0f12]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="text-3xl font-black">Thông tin liên hệ</h2>
            <div className="mt-8 grid gap-4">
              {site.phones.map((phone) => (
                <a
                  key={phone.value}
                  href={`tel:${phone.value}`}
                  className="flex items-center gap-4 border border-[#d9dde0] bg-white p-5 text-lg font-extrabold hover:border-[#a87f00]"
                >
                  <Phone className="text-[#a87f00]" aria-hidden />
                  {phone.display}
                </a>
              ))}
              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 border border-[#d9dde0] bg-white p-5 font-semibold leading-7 hover:border-[#a87f00]"
              >
                <MapPin className="mt-1 shrink-0 text-[#a87f00]" aria-hidden />
                <span>
                  {site.address}
                  <span className="mt-2 block text-sm text-[#59616a]">
                    Mở trang tìm kiếm địa chỉ trên bản đồ, không sử dụng tọa độ tự đặt.
                  </span>
                </span>
              </a>
            </div>
          </div>
          <div id="form-lien-he" className="border border-[#d9dde0] bg-white p-6 md:p-9">
            <h2 className="text-3xl font-black">Yêu cầu tư vấn</h2>
            <p className="mt-3 text-sm leading-6 text-[#59616a]">
              Không có dữ liệu nào được gửi hoặc lưu trong bản local.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
