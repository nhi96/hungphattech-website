import type { Product } from "@/types/content";

type ComputingProductGroup = "laptop" | "desktop" | "printer";

type OfficeSeed = {
  slug: string;
  name: string;
  brand: string;
  image: string;
  price?: number;
  summary?: string;
};

const base = (
  item: OfficeSeed,
  group: ComputingProductGroup,
): Product => ({
  slug: item.slug,
  name: item.name,
  categorySlug: "laptop-pc",
  brand: item.brand,
  summary:
    item.summary ??
    `${item.name} cho nhu cầu làm việc, học tập hoặc vận hành văn phòng.`,
  description:
    "Thiết bị chính hãng trong danh mục tham khảo của Hưng Phát; liên hệ để kiểm tra tồn kho, cấu hình và chính sách bảo hành.",
  features: ["TÆ° váº¥n theo nhu cáº§u sá»­ dá»¥ng", "Há»— trá»£ lá»±a chá»n cáº¥u hÃ¬nh", "CÃ³ thá»ƒ kiá»ƒm tra hÃ ng vÃ  báº£o hÃ nh"],
  specifications: [
    { label: "ThÆ°Æ¡ng hiá»‡u", value: item.brand },
    { label: "Model", value: item.name },
    { label: "Đơn vị tư vấn", value: "Hưng Phát" },
  ],
  images: [
    item.image.replace(/\.[^.]+$/, "-hung-phat.webp"),
  ],
  price: item.price ?? null,
  isDemo: false,
  imageFit: "contain",
  computingDetails: { group },
});

export const laptopProducts: Product[] = [
  base({ slug: "laptop-acer-swift-3-sf315-52-38yq", name: "Laptop Acer Swift 3 SF315-52 38YQ", brand: "Acer", image: "/images/products/laptops/laptop-acer-swift-3-sf315-52-38yq-i3-8130u-4gb-1tb-win10-nx-gzbsv-003.jpg", price: 13190000 }, "laptop"),
  base({ slug: "laptop-apple-macbook-air-2017-mqd32sa", name: "Apple MacBook Air 2017 MQD32SA/A", brand: "Apple", image: "/images/products/laptops/laptop-apple-macbook-air-2017-i5-1-8ghz-8gb-128gb-mqd32sa-a.jpg", price: 20990000 }, "laptop"),
  base({ slug: "laptop-apple-macbook-air-2020-mwtj2sa", name: "Apple MacBook Air 2020 MWTJ2SA/A", brand: "Apple", image: "/images/products/laptops/laptop-apple-macbook-air-2020-i3-1-1ghz-8gb-256gb-mwtj2sa-a.jpg", price: 28990000 }, "laptop"),
  base({ slug: "laptop-apple-macbook-air-2020-mwtl2sa", name: "Apple MacBook Air 2020 MWTL2SA/A", brand: "Apple", image: "/images/products/laptops/laptop-apple-macbook-air-2020-i3-1-1ghz-8gb-256gb-mwtl2sa-a.jpg", price: 28990000 }, "laptop"),
  base({ slug: "laptop-asus-vivobook-f1504vap", name: "Laptop Asus Vivobook F1504VAP-SB54", brand: "Asus", image: "/images/products/laptops/laptop-asus-vivoboo-f1504vap-sb54.png" }, "laptop"),
  base({ slug: "laptop-asus-vivobook-x409ja", name: "Laptop Asus VivoBook X409JA EK052T", brand: "Asus", image: "/images/products/laptops/laptop-asus-vivobook-x409ja-i5-1035g1-8gb-512gb-win10-ek052t.jpg", price: 15490000 }, "laptop"),
  base({ slug: "laptop-asus-zenbook-ux425ea", name: "Laptop Asus ZenBook UX425EA BM069T", brand: "Asus", image: "/images/products/laptops/laptop-asus-zenbook-ux425ea-i5-1135g7-8gb-512gb-c-p-t-i-win10-bm069t.jpg", price: 22990000 }, "laptop"),
  base({ slug: "laptop-dell-latitude-3450", name: "Laptop Dell Latitude 3450 L3450", brand: "Dell", image: "/images/products/laptops/laptop-dell-laditude-3450-l3450.png" }, "laptop"),
  base({ slug: "laptop-dell-xps-13-9300", name: "Laptop Dell XPS 13 9300 0N90H1", brand: "Dell", image: "/images/products/laptops/laptop-dell-xps-13-9300-i7-1065g7-16gb-512gb-office365-win10-0n90h1.jpg", price: 57990000 }, "laptop"),
  base({ slug: "laptop-hp-15s-du1056tu", name: "Laptop HP 15s du1056TU 1W7R5PA", brand: "HP", image: "/images/products/laptops/laptop-hp-15s-du1056tu-6405u-4gb-512gb-win10-1w7r5pa.jpg", price: 9090000 }, "laptop"),
  base({ slug: "laptop-hp-omnibook-5-flip", name: "Laptop HP OmniBook 5 Flip 2-in-1", brand: "HP", image: "/images/products/laptops/laptop-hp-omnibook-5-flip-2in1.png" }, "laptop"),
  base({ slug: "laptop-lenovo-loq-15iax9e", name: "Laptop Lenovo LOQ 15IAX9E 83LK0001US", brand: "Lenovo", image: "/images/products/laptops/laptop-lenovo-loq-15iax9e-83lk0001us.png" }, "laptop"),
  base({ slug: "laptop-lenovo-yoga-c940", name: "Laptop Lenovo Yoga C940 81Q9007KVN", brand: "Lenovo", image: "/images/products/laptops/laptop-lenovo-yoga-c940-14iil-i7-1065g7-16gb-1tb-ssd-pen-touch-win10-81q9007kvn.jpg", price: 49990000 }, "laptop"),
  base({ slug: "laptop-lg-gram-17", name: "Laptop LG Gram 17 17Z90N-V.AH75A5", brand: "LG", image: "/images/products/laptops/laptop-lg-gram-17-i7-1065g7-8gb-512gb-win10-17z90n-v-ah75a5.jpg", price: 41400000 }, "laptop"),
  base({ slug: "laptop-msi-gaming-leopard-gl65", name: "Laptop MSI Gaming Leopard GL65 242VN", brand: "MSI", image: "/images/products/laptops/laptop-msi-gaming-leopard-10sdk-gl65-i7-10750h-16gb-512gb-144hz-6gb-gtx1660ti-win10-242vn.jpg", price: 33490000 }, "laptop"),
];

export const desktopProducts: Product[] = [
  base({ slug: "desktop-asus-nuc-15-pro-tall", name: "ASUS NUC 15 PRO TALL RNUC15CRHU5", brand: "Asus", image: "/images/products/desktops/asus-nuc-15-pro-tall-rnuc15crhu5.png" }, "desktop"),
  base({ slug: "desktop-dell-pro-slim-plus", name: "DELL PRO SLIM PLUS QBS1250", brand: "Dell", image: "/images/products/desktops/dell-pro-slim-plus-qbs1250.png" }, "desktop"),
  base({ slug: "desktop-hp-omnidesk-s03", name: "HP OmniDesk S03-0042D C16DVPA", brand: "HP", image: "/images/products/desktops/hp-omnidesk-s03-0042d-c16dvpa.png" }, "desktop"),
  base({ slug: "desktop-lenovo-thinkcentre-neo-50t", name: "Lenovo ThinkCentre Neo 50t Gen 5", brand: "Lenovo", image: "/images/products/desktops/lenovo-thinkcentre-neo-50t-gen5-12ub0004va.png" }, "desktop"),
];

export const printerProducts: Product[] = [
  ["brother-mfc-l2701dw", "MÃ¡y fax Laser Ä‘a chá»©c nÄƒng Brother MFC-L2701DW", "Brother", "m-y-fax-laser-a-ch-c-n-ng-brother-mfc-l2701dw-fax-in-scan-copy-duplex-wifi.png"],
  ["canon-pixma-g1010", "MÃ¡y in áº£nh mÃ u Canon PIXMA G1010", "Canon", "m-y-in-nh-m-u-canon-pixma-g1010-in.png"],
  ["brother-hl-b2100d", "MÃ¡y in Brother HL-B2100D", "Brother", "m-y-in-brother-hl-b2100d-in-tr-ng-en-n-n-ng-duplex-34-trang-ph-t-a4-128mb.png"],
  ["brother-hl-b2180dw", "MÃ¡y in Brother HL-B2180DW", "Brother", "m-y-in-brother-hl-b2180dw-in-tr-ng-en-n-n-ng-duplex-wifi-34-trang-ph-t-a4-128mb.png"],
  ["brother-dcp-l2520d", "MÃ¡y in Brother Laser DCP-L2520D", "Brother", "m-y-in-brother-laser-dcp-l2520d-in-scan-copy-duplex.png"],
  ["hp-laserjet-pro-mfp-4103fdn", "MÃ¡y in Ä‘a nÄƒng HP LaserJet Pro MFP 4103fdn", "HP", "ma-y-in-a-n-ng-hp-laserjet-pro-mfp-4103fdn-2z628a-in-copy-scan-fax-duplex-network.png"],
  ["hp-laserjet-pro-mfp-4103fdw", "MÃ¡y in Ä‘a nÄƒng HP LaserJet Pro MFP 4103fdw", "HP", "ma-y-in-a-n-ng-hp-laserjet-pro-mfp-4103fdw-2z629a-print-copy-scan-fax-wifi.png"],
  ["hp-laserjet-pro-4003dn", "MÃ¡y in Ä‘en tráº¯ng HP LaserJet Pro 4003dn", "HP", "m-y-in-en-tr-ng-hp-laserjet-pro-4003dn-2z609a-in-duplex-network.png"],
  ["hp-laserjet-pro-m501dn", "MÃ¡y in Ä‘en tráº¯ng HP LaserJet Pro M501DN", "HP", "m-y-in-en-tr-ng-hp-laserjet-pro-m501dn-j8h61a-in-duplex-network.png"],
  ["epson-ecotank-l15150", "MÃ¡y in Epson EcoTank L15150", "Epson", "m-y-in-epson-ecotank-l15150-a3-in-scan-copy-fax-2-m-t-dadf-lan-wifi.png"],
  ["hp-color-laser-150nw", "MÃ¡y in HP Color Laser 150nw", "HP", "m-y-in-hp-color-laser-150nw-4zb95a-in-wifi-lan.png"],
  ["hp-color-laser-mfp-178nw", "MÃ¡y in HP Color Laser MFP 178nw", "HP", "m-y-in-hp-color-laser-mfp-178nw-4zb96a-in-scan-copy-wifi-network.png"],
].map(([slug, name, brand, image]) =>
  base({ slug: `may-in-${slug}`, name, brand, image: `/images/products/printers/${image}` }, "printer"),
);



