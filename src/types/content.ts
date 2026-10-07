export type CategorySlug =
  | "dien-mat-troi"
  | "camera-giam-sat"
  | "laptop-pc"
  | "khoa-cua-thong-minh";

export type ProductSort = "name-asc" | "name-desc";

export type SolarProductGroup = "panel" | "inverter" | "battery";

export type SolarProductDetails =
  | {
      group: "panel";
      ratedPowerKw: number;
    }
  | {
      group: "inverter";
      ratedOutputKw: number;
      phase: "single-phase" | "three-phase";
      inverterType: "hybrid" | "off-grid" | "grid-tied";
    }
  | {
      group: "battery";
      energyKwh: number;
      energyBasis: "nominal" | "usable";
    };

export type CameraDetails = {
  resolutionMp?: number;
  environment: "indoor" | "outdoor" | "indoor-outdoor";
  connectivity: "wifi" | "poe" | "wired" | "wifi-wired";
  formFactor: "dome" | "bullet" | "ptz" | "cube" | "doorbell" | "other";
  dualLens: boolean;
};

export type ComputingProductGroup = "laptop" | "desktop" | "printer";

export type ComputingDetails = {
  group: ComputingProductGroup;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  image: string;
};

export type Product = {
  slug: string;
  model?: string;
  name: string;
  categorySlug: CategorySlug;
  brand: string;
  summary: string;
  description: string;
  features: string[];
  specifications: Array<{ label: string; value: string }>;
  images: string[];
  price: number | null;
  isDemo: boolean;
  imageFit?: "cover" | "contain";
  solarDetails?: SolarProductDetails;
  cameraDetails?: CameraDetails;
  computingDetails?: ComputingDetails;
  featured?: boolean;
};

export type ProductFilters = {
  query: string;
  category: CategorySlug | "all";
  brand: string | "all";
  solarGroup: SolarProductGroup | "all";
  computingGroup: ComputingProductGroup | "all";
  sort: ProductSort;
};
