import type { Product } from "@/types/content";

const lock = (slug: string, name: string, brand: string): Product => ({
  slug,
  name,
  categorySlug: "khoa-cua-thong-minh",
  brand,
  summary: `${name} cho nhu cầu kiểm soát ra vào tại nhà ở, văn phòng và cửa hàng.`,
  description: "Sản phẩm khóa thông minh tham khảo từ danh mục GIHO; cần khảo sát loại cửa và phương án lắp đặt trước khi chốt.",
  features: ["Mở khóa tiện lợi", "Tư vấn theo loại cửa", "Hỗ trợ khảo sát lắp đặt"],
  specifications: [
    { label: "Thương hiệu", value: brand },
    { label: "Model", value: name },
    { label: "Giá", value: "Liên hệ báo giá" },
  ],
  images: ["/images/category-lock.png"],
  price: null,
  isDemo: false,
  imageFit: "contain",
});

export const lockProducts: Product[] = [
  lock("khoa-aqara-u100", "Khóa cửa thông minh Aqara U100 Smart Lock", "Aqara"),
  lock("khoa-kassler-kl-68bl", "Khóa cửa thông minh Kassler KL-68BL", "Kassler"),
  lock("khoa-philips-ddl608-5hws", "Khóa cửa thông minh Philips DDL608-5HWS", "Philips"),
  lock("khoa-aqara-a100", "Khóa thông minh Aqara A100 Zigbee Home Key", "Aqara"),
  lock("khoa-aqara-d100", "Khóa thông minh Aqara D100", "Aqara"),
  lock("khoa-aqara-d200i", "Khóa thông minh Aqara D200i Face ID", "Aqara"),
  lock("khoa-aqara-u50", "Khóa thông minh Aqara U50", "Aqara"),
  lock("khoa-metalock-azt-01", "Khóa thông minh Metalock AZT-01", "Metalock"),
  lock("khoa-aqara-u300", "Smart Lock Aqara U300", "Aqara"),
];
