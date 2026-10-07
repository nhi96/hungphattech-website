import type { Category } from "@/types/content";

export const categories: Category[] = [
  {
    slug: "dien-mat-troi",
    name: "Điện mặt trời",
    shortName: "Solar",
    description:
      "Thiết bị và cấu hình điện mặt trời cho hộ gia đình, cửa hàng và doanh nghiệp.",
    image: "/images/category-solar.png",
  },
  {
    slug: "camera-giam-sat",
    name: "Camera giám sát",
    shortName: "Camera",
    description:
      "Giải pháp quan sát và quản lý an ninh phù hợp nhiều không gian sử dụng.",
    image: "/images/category-camera.png",
  },
  {
    slug: "laptop-pc",
    name: "Laptop và PC",
    shortName: "Máy tính",
    description:
      "Laptop, máy tính để bàn và máy in cho công việc, học tập và vận hành văn phòng.",
    image: "/images/category-computer.png",
  },
  {
    slug: "khoa-cua-thong-minh",
    name: "Khóa cửa thông minh",
    shortName: "Khóa cửa",
    description:
      "Các lựa chọn kiểm soát ra vào hiện đại cho nhà ở, cửa hàng và văn phòng.",
    image: "/images/category-lock.png",
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
