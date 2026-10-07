import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { MobileCallBar } from "@/components/layout/mobile-call-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublishedSiteContent } from "@/lib/content/content-loader";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublishedSiteContent();
  return {
    title: {
      default: `${site.brandName} | Thiết bị và giải pháp công nghệ`,
      template: `%s | ${site.brandName}`,
    },
    description:
      "Điện mặt trời, camera giám sát, laptop, PC và khóa cửa thông minh cho gia đình và doanh nghiệp.",
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: site.brandName,
      title: site.brandName,
      description:
        "Giải pháp thiết bị công nghệ cho gia đình, cửa hàng, văn phòng và doanh nghiệp.",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const content = await getPublishedSiteContent();
  const { site, navigation } = content;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.legalName,
    telephone: site.phones.map((phone) => phone.value),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressCountry: "VN",
    },
  };

  return (
    <html lang="vi" className={beVietnam.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen overflow-x-hidden">
        <a
          href="#noi-dung-chinh"
          className="fixed left-3 top-3 z-[100] -translate-y-24 bg-[#ffc400] px-4 py-3 font-bold text-[#0b0f12] focus:translate-y-0"
        >
          Bỏ qua điều hướng
        </a>
        <SiteHeader site={site} navigation={navigation} />
        <main id="noi-dung-chinh">{children}</main>
        <SiteFooter site={site} />
        <MobileCallBar phones={site.phones} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
