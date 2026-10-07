import type { CameraDetails, Product } from "@/types/content";

type CameraSeed = {
  slug: string;
  model: string;
  name: string;
  brand: "Imou" | "Hikvision";
  resolutionMp: number;
  environment: CameraDetails["environment"];
  formFactor: CameraDetails["formFactor"];
  dualLens?: boolean;
  image: string;
  highlights: string[];
};

const seeds: CameraSeed[] = [
  { slug: "camera-imou-ipc-c22ep-cue-2", model: "IPC-C22EP", name: "Camera Imou Cue 2 IPC-C22EP 2MP", brand: "Imou", resolutionMp: 2, environment: "indoor", formFactor: "cube", image: "imou-ipc-c22ep.webp", highlights: ["Quan sát Full HD", "Thiết kế nhỏ gọn"] },
  { slug: "camera-imou-ipc-c22sp-cue-2e", model: "IPC-C22SP", name: "Camera Imou Cue 2E IPC-C22SP 2MP", brand: "Imou", resolutionMp: 2, environment: "indoor", formFactor: "cube", image: "imou-ipc-c22sp.webp", highlights: ["Đàm thoại hai chiều", "Video Full HD"] },
  { slug: "camera-imou-ipc-s2vp-5m0wr-rex-vt", model: "IPC-S2VP-5M0WR", name: "Camera Imou Rex VT IPC-S2VP-5M0WR 5MP", brand: "Imou", resolutionMp: 5, environment: "indoor", formFactor: "ptz", image: "imou-ipc-s2vp-5m0wr.webp", highlights: ["Gọi video", "Quay quét linh hoạt"] },
  { slug: "camera-imou-ipc-s2xep-6m0s-6mp", model: "IPC-S2XEP-6M0S", name: "Camera Imou IPC-S2XEP-6M0S 6MP", brand: "Imou", resolutionMp: 6, environment: "indoor", formFactor: "ptz", dualLens: true, image: "imou-ipc-s2xep-6m0s.webp", highlights: ["Hai ống kính", "Quan sát trong nhà"] },
  { slug: "camera-imou-ipc-s2xep-10m0s-10mp", model: "IPC-S2XEP-10M0S", name: "Camera Imou IPC-S2XEP-10M0S 10MP", brand: "Imou", resolutionMp: 10, environment: "indoor", formFactor: "ptz", dualLens: true, image: "imou-ipc-s2xep-10m0s.webp", highlights: ["Hai ống kính", "Độ phân giải tổng 10MP"] },
  { slug: "camera-imou-ipc-a32p-pro-ranger-2-pro", model: "IPC-A32P-PRO", name: "Camera Imou Ranger 2 Pro IPC-A32P-PRO 3MP", brand: "Imou", resolutionMp: 3, environment: "indoor", formFactor: "ptz", image: "imou-ipc-a32p-pro.webp", highlights: ["Quay quét", "Quan sát trong nhà"] },
  { slug: "camera-imou-ipc-a52p-pro-ranger-2-pro", model: "IPC-A52P-PRO", name: "Camera Imou Ranger 2 Pro IPC-A52P-PRO 5MP", brand: "Imou", resolutionMp: 5, environment: "indoor", formFactor: "ptz", image: "imou-ipc-a52p-pro.webp", highlights: ["Quay quét", "Độ phân giải 5MP"] },
  { slug: "camera-imou-ipc-k2mp-3h1we-ranger-mini", model: "IPC-K2MP-3H1WE", name: "Camera Imou Ranger Mini IPC-K2MP-3H1WE 3MP", brand: "Imou", resolutionMp: 3, environment: "indoor", formFactor: "ptz", image: "imou-ipc-k2mp-3h1we.webp", highlights: ["Thiết kế gọn", "Quay quét"] },
  { slug: "camera-imou-ipc-k2mp-5h1we-ranger-mini", model: "IPC-K2MP-5H1WE", name: "Camera Imou Ranger Mini IPC-K2MP-5H1WE 5MP", brand: "Imou", resolutionMp: 5, environment: "indoor", formFactor: "ptz", image: "imou-ipc-k2mp-5h1we.webp", highlights: ["Thiết kế gọn", "Độ phân giải 5MP"] },
  { slug: "camera-imou-ipc-s2vbp-5m0wr-rex-vt-pro", model: "IPC-S2VBP-5M0WR", name: "Camera Imou Rex VT Pro IPC-S2VBP-5M0WR 5MP", brand: "Imou", resolutionMp: 5, environment: "indoor", formFactor: "ptz", image: "imou-ipc-s2vbp-5m0wr.webp", highlights: ["Gọi video", "Hình ảnh 3K"] },
  { slug: "camera-imou-ipc-s2xp-6m0wed-ranger-dual", model: "IPC-S2XP-6M0WED", name: "Camera Imou Ranger Dual IPC-S2XP-6M0WED 6MP", brand: "Imou", resolutionMp: 6, environment: "indoor", formFactor: "ptz", dualLens: true, image: "imou-ipc-s2xp-6m0wed.webp", highlights: ["Hai ống kính 3MP + 3MP", "Đàm thoại hai chiều"] },
  { slug: "camera-imou-ipc-s2xp-10m0wed-ranger-dual", model: "IPC-S2XP-10M0WED", name: "Camera Imou Ranger Dual IPC-S2XP-10M0WED 10MP", brand: "Imou", resolutionMp: 10, environment: "indoor", formFactor: "ptz", dualLens: true, image: "imou-ipc-s2xp-10m0wed.webp", highlights: ["Hai ống kính 5MP + 5MP", "Quay quét"] },
  { slug: "camera-imou-ipc-s6dp-3m0web-bulb", model: "IPC-S6DP-3M0WEB", name: "Camera bóng đèn Imou IPC-S6DP-3M0WEB 3MP", brand: "Imou", resolutionMp: 3, environment: "indoor", formFactor: "other", image: "imou-ipc-s6dp-3m0web.webp", highlights: ["Thiết kế bóng đèn", "Quan sát 3MP"] },
  { slug: "camera-imou-ipc-s6dp-5m0web-bulb", model: "IPC-S6DP-5M0WEB", name: "Camera bóng đèn Imou IPC-S6DP-5M0WEB 5MP", brand: "Imou", resolutionMp: 5, environment: "indoor", formFactor: "other", image: "imou-ipc-s6dp-5m0web.webp", highlights: ["Thiết kế bóng đèn", "Quan sát 5MP"] },
  { slug: "camera-hikvision-ds-2cv2121g2-idw-2mp", model: "DS-2CV2121G2-IDW", name: "Camera Wi-Fi Hikvision DS-2CV2121G2-IDW 2MP", brand: "Hikvision", resolutionMp: 2, environment: "indoor-outdoor", formFactor: "dome", image: "hikvision-ds-2cv2121g2-idw.webp", highlights: ["Kết nối Wi-Fi", "Kiểu dáng dome"] },
  { slug: "camera-imou-bullet2-f22fep-2mp", model: "F22FEP", name: "Camera ngoài trời Imou Bullet2 F22FEP 2MP", brand: "Imou", resolutionMp: 2, environment: "outdoor", formFactor: "bullet", image: "imou-f22fep.webp", highlights: ["Đàm thoại", "Quan sát ban đêm có màu"] },
  { slug: "camera-imou-bullet-2e-f32fp-3mp", model: "F32FP", name: "Camera ngoài trời Imou Bullet 2E F32FP 3MP", brand: "Imou", resolutionMp: 3, environment: "outdoor", formFactor: "bullet", image: "imou-f32fp.webp", highlights: ["Thân trụ ngoài trời", "Quan sát ban đêm có màu"] },
  { slug: "camera-imou-bullet-2e-f52fp-5mp", model: "F52FP", name: "Camera ngoài trời Imou Bullet 2E F52FP 5MP", brand: "Imou", resolutionMp: 5, environment: "outdoor", formFactor: "bullet", image: "imou-f52fp.webp", highlights: ["Thân trụ ngoài trời", "Độ phân giải 5MP"] },
  { slug: "camera-imou-bullet-3-s3ep-3m0web", model: "S3EP-3M0WEB", name: "Camera ngoài trời Imou Bullet 3 S3EP-3M0WEB 3MP", brand: "Imou", resolutionMp: 3, environment: "outdoor", formFactor: "bullet", image: "imou-s3ep-3m0web.webp", highlights: ["AI nhận diện", "Chuẩn bảo vệ IP67"] },
  { slug: "camera-imou-bullet-3-s3ep-5m0web", model: "S3EP-5M0WEB", name: "Camera ngoài trời Imou Bullet 3 S3EP-5M0WEB 5MP", brand: "Imou", resolutionMp: 5, environment: "outdoor", formFactor: "bullet", image: "imou-s3ep-5m0web.webp", highlights: ["AI nhận diện", "Chuẩn bảo vệ IP67"] },
  { slug: "camera-imou-cruiser-2-gs7ep-3m0we", model: "GS7EP-3M0WE", name: "Camera ngoài trời Imou Cruiser 2 GS7EP-3M0WE 3MP", brand: "Imou", resolutionMp: 3, environment: "outdoor", formFactor: "ptz", image: "imou-gs7ep-3m0we.webp", highlights: ["Quay quét", "Chuẩn bảo vệ IP66"] },
  { slug: "camera-imou-cruiser-2-gs7ep-5m0we", model: "GS7EP-5M0WE", name: "Camera ngoài trời Imou Cruiser 2 GS7EP-5M0WE 5MP", brand: "Imou", resolutionMp: 5, environment: "outdoor", formFactor: "ptz", image: "imou-gs7ep-5m0we.webp", highlights: ["Quay quét", "Quan sát ban đêm có màu"] },
  { slug: "camera-imou-cruiser-dual-ipc-s7xp-6m0wed", model: "IPC-S7XP-6M0WED", name: "Camera ngoài trời Imou Cruiser Dual IPC-S7XP-6M0WED 6MP", brand: "Imou", resolutionMp: 6, environment: "outdoor", formFactor: "ptz", dualLens: true, image: "imou-ipc-s7xp-6m0wed.webp", highlights: ["Hai ống kính 3MP + 3MP", "Chuẩn bảo vệ IP66"] },
  { slug: "camera-imou-cruiser-dual-ipc-s7xp-10m0wed", model: "IPC-S7XP-10M0WED", name: "Camera ngoài trời Imou Cruiser Dual IPC-S7XP-10M0WED 10MP", brand: "Imou", resolutionMp: 10, environment: "outdoor", formFactor: "ptz", dualLens: true, image: "imou-ipc-s7xp-10m0wed.webp", highlights: ["Hai ống kính 5MP + 5MP", "Chuẩn bảo vệ IP66"] },
  { slug: "camera-imou-cruiser-se-s21fep-2mp", model: "S21FEP", name: "Camera ngoài trời Imou Cruiser SE+ S21FEP 2MP", brand: "Imou", resolutionMp: 2, environment: "outdoor", formFactor: "ptz", image: "imou-s21fep.webp", highlights: ["Quay quét", "Đàm thoại hai chiều"] },
  { slug: "camera-imou-cruiser-se-s41fep-4mp", model: "S41FEP", name: "Camera ngoài trời Imou Cruiser SE+ S41FEP 4MP", brand: "Imou", resolutionMp: 4, environment: "outdoor", formFactor: "ptz", image: "imou-s41fep.webp", highlights: ["Quay quét", "Quan sát ban đêm có màu"] },
  { slug: "camera-imou-cruiser-se-s51fep-5mp", model: "S51FEP", name: "Camera ngoài trời Imou Cruiser SE+ S51FEP 5MP", brand: "Imou", resolutionMp: 5, environment: "outdoor", formFactor: "ptz", image: "imou-s51fep.webp", highlights: ["Quay quét", "Độ phân giải 5MP"] },
  { slug: "camera-imou-cruiser-triple-ipc-s7up-11m0wed", model: "IPC-S7UP-11M0WED", name: "Camera ngoài trời Imou Cruiser Triple IPC-S7UP-11M0WED 11MP", brand: "Imou", resolutionMp: 11, environment: "outdoor", formFactor: "ptz", image: "imou-ipc-s7up-11m0wed.webp", highlights: ["Ba ống kính", "Chuẩn bảo vệ IP66"] },
];

function environmentLabel(environment: CameraDetails["environment"]) {
  if (environment === "outdoor") return "Ngoài trời";
  if (environment === "indoor-outdoor") return "Trong nhà và ngoài trời";
  return "Trong nhà";
}

function formFactorLabel(formFactor: CameraDetails["formFactor"]) {
  const labels: Record<CameraDetails["formFactor"], string> = {
    dome: "Dome",
    bullet: "Thân trụ",
    ptz: "Quay quét",
    cube: "Dạng hộp nhỏ gọn",
    doorbell: "Chuông cửa",
    other: "Chuyên dụng",
  };
  return labels[formFactor];
}

export const cameraProducts: Product[] = seeds.map((seed, index) => ({
  slug: seed.slug,
  model: seed.model,
  name: seed.name,
  categorySlug: "camera-giam-sat",
  brand: seed.brand,
  summary: `${environmentLabel(seed.environment)}, độ phân giải ${seed.resolutionMp}MP, kết nối Wi-Fi.`,
  description:
    `Camera ${seed.brand} model ${seed.model} phù hợp cho nhu cầu quan sát ${environmentLabel(seed.environment).toLowerCase()}. ` +
    "Cấu hình lưu trữ, vùng quan sát và phương án lắp đặt cần được xác nhận theo công trình thực tế.",
  features: [...seed.highlights, "Kết nối và quản lý qua mạng Wi-Fi"],
  specifications: [
    { label: "Model", value: seed.model },
    { label: "Độ phân giải", value: `${seed.resolutionMp}MP` },
    { label: "Môi trường", value: environmentLabel(seed.environment) },
    { label: "Kiểu camera", value: formFactorLabel(seed.formFactor) },
    { label: "Kết nối", value: "Wi-Fi" },
    { label: "Số ống kính", value: seed.dualLens ? "Hai ống kính" : seed.highlights.includes("Ba ống kính") ? "Ba ống kính" : "Một ống kính" },
  ],
  images: [
    `/images/products/cameras/${seed.image.replace(/\.webp$/, "-hung-phat.webp")}`,
  ],
  price: null,
  isDemo: false,
  imageFit: "contain",
  cameraDetails: {
    resolutionMp: seed.resolutionMp,
    environment: seed.environment,
    connectivity: "wifi",
    formFactor: seed.formFactor,
    dualLens: seed.dualLens ?? false,
  },
  featured: index < 3,
}));
