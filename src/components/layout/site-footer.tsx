import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { categories } from "@/data/categories";
import type { SiteSettings } from "@/lib/content/content-schema";
import { BrandMark } from "./site-header";

export function SiteFooter({ site }: { site: SiteSettings }) {
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
  return (
    <footer className="border-t border-white/10 bg-[#080b0d] pb-24 pt-14 md:pb-10">
      <div className="container-shell grid gap-10 md:grid-cols-[1.3fr_0.8fr_1fr]">
        <div>
          <BrandMark brandName={site.brandName} />
          <p className="mt-5 max-w-md text-sm leading-7 text-[#b8bec7]">{site.legalName}</p>
          <p className="mt-2 text-xs text-[#7f8791]">
            {site.footerNote}
          </p>
        </div>
        <div>
          <h2 className="font-bold text-white">Danh mục</h2>
          <ul className="mt-4 grid gap-3 text-sm text-[#b8bec7]">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/danh-muc/${category.slug}`} className="hover:text-[#ffc400]">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-white">Liên hệ</h2>
          <div className="mt-4 grid gap-4 text-sm text-[#b8bec7]">
            {site.phones.map((phone) => (
              <a key={phone.id} href={`tel:${phone.value}`} className="flex gap-3 hover:text-[#ffc400]">
                <Phone className="mt-0.5 shrink-0" size={17} aria-hidden />
                {phone.display}
              </a>
            ))}
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="flex gap-3 leading-6 hover:text-[#ffc400]"
            >
              <MapPin className="mt-0.5 shrink-0" size={17} aria-hidden />
              {site.address}
            </a>
          </div>
        </div>
      </div>
      <div className="container-shell mt-10 border-t border-white/10 pt-5 text-xs text-[#7f8791]">
        © 2026 {site.brandName}. Bản thử nghiệm local, chưa xuất bản.
      </div>
    </footer>
  );
}
