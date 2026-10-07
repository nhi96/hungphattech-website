import { z } from "zod";

const idSchema = z.string().regex(/^[a-z0-9-]{1,64}$/);
const requiredText = z.string().trim().min(1).max(2000);
const optionalText = z.string().trim().max(5000);
const alignmentSchema = z.enum(["left", "center", "right"]);
const sizeSchema = z.enum(["small", "medium", "large"]);
const focalXSchema = z.enum(["left", "center", "right"]);
const focalYSchema = z.enum(["top", "center", "bottom"]);

const textStyleSchema = z.object({
  titleSize: sizeSchema,
  alignment: alignmentSchema,
});

const imageRefSchema = z.object({
  assetId: idSchema,
  focalX: focalXSchema,
  focalY: focalYSchema,
});

const optionalImageRefSchema = imageRefSchema.extend({
  assetId: idSchema.nullable(),
});

const assetSchema = z.object({
  id: idSchema,
  path: z.string().startsWith("/").max(500),
  alt: optionalText,
  mime: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
});

const phoneSchema = z.object({
  id: idSchema,
  display: requiredText,
  value: z.string().regex(/^0\d{9}$/),
});

const navigationDestinations = {
  home: "/",
  about: "/gioi-thieu",
  solutions: "/giai-phap",
  products: "/san-pham",
  projects: "/du-an",
  knowledge: "/kien-thuc",
  contact: "/lien-he",
} as const;

const navigationSchema = z
  .array(
    z.object({
      id: z.enum(Object.keys(navigationDestinations) as [keyof typeof navigationDestinations]),
      label: requiredText,
      href: z.string(),
    }),
  )
  .length(7)
  .superRefine((items, context) => {
    for (const item of items) {
      if (item.href !== navigationDestinations[item.id]) {
        context.addIssue({
          code: "custom",
          message: `Navigation destination for ${item.id} is immutable`,
        });
      }
    }
  });

const sectionHeadingSchema = z.object({
  id: idSchema,
  index: requiredText,
  eyebrow: requiredText,
  title: requiredText,
  description: optionalText,
  style: textStyleSchema,
});

const experienceImageSchema = z.object({
  id: z.enum(["store", "team"]),
  label: requiredText,
  alt: optionalText,
  image: optionalImageRefSchema,
});

const featuredSectionSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const section = value as Record<string, unknown>;
    if (Array.isArray(section.images)) return section;

    return {
      ...section,
      eyebrow: "Kinh nghiệm Hưng Phát",
      images: [
        {
          id: "store",
          label: "Cửa hàng Hưng Phát",
          alt: "Cửa hàng Hưng Phát",
          image: {
            assetId: null,
            focalX: "center",
            focalY: "center",
          },
        },
        {
          id: "team",
          label: "Đội ngũ công ty",
          alt: "Đội ngũ công ty Hưng Phát",
          image: {
            assetId: null,
            focalX: "center",
            focalY: "center",
          },
        },
      ],
    };
  },
  sectionHeadingSchema.extend({
    images: z
      .array(experienceImageSchema)
      .length(2)
      .superRefine((images, context) => {
        if (images[0]?.id !== "store" || images[1]?.id !== "team") {
          context.addIssue({
            code: "custom",
            message: "Experience images must keep store and team roles",
          });
        }
      }),
  }),
);

const projectItemSchema = z.object({
  id: z.enum(["project-1", "project-2", "project-3", "project-4"]),
  title: optionalText,
  description: optionalText,
  alt: optionalText,
  image: optionalImageRefSchema,
});

const legacyProjectsTitle =
  "Một số công trình nổi bật của Công ty TNHH Thiết bị Công nghệ Hưng Phát";

const projectsSectionSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const section = value as Record<string, unknown>;
    const title =
      section.title === legacyProjectsTitle ? "Một số công trình nổi bật" : section.title;

    if (Array.isArray(section.items)) {
      return { ...section, title };
    }

    return {
      ...section,
      title,
      items: ["project-1", "project-2", "project-3", "project-4"].map((id) => ({
        id,
        title: "",
        description: "",
        alt: "",
        image: {
          assetId: null,
          focalX: "center",
          focalY: "center",
        },
      })),
    };
  },
  sectionHeadingSchema.extend({
    items: z
      .array(projectItemSchema)
      .length(4)
      .superRefine((items, context) => {
        const expectedIds = ["project-1", "project-2", "project-3", "project-4"];
        if (items.some((item, index) => item.id !== expectedIds[index])) {
          context.addIssue({
            code: "custom",
            message: "Project items must keep their fixed roles",
          });
        }
      }),
  }),
);

const sectionsSchema = z.object({
  categories: sectionHeadingSchema,
  audiences: sectionHeadingSchema.extend({
    buttonLabel: requiredText,
    items: z
      .array(z.object({ id: idSchema, title: requiredText, description: requiredText }))
      .max(50),
  }),
  featured: featuredSectionSchema,
  about: z.object({
    id: z.literal("about"),
    eyebrow: requiredText,
    title: requiredText,
    paragraphs: z.array(requiredText).min(1).max(10),
    buttonLabel: requiredText,
    style: textStyleSchema,
  }),
  projects: projectsSectionSchema,
  process: sectionHeadingSchema.extend({
    note: requiredText,
    items: z.array(z.object({ id: idSchema, text: requiredText })).min(1).max(50),
  }),
  knowledge: sectionHeadingSchema.omit({ description: true }).extend({
    buttonLabel: requiredText,
  }),
  contact: z.object({
    id: z.literal("contact"),
    eyebrow: requiredText,
    title: requiredText,
    description: requiredText,
    style: textStyleSchema,
  }),
});

const sectionIds = [
  "categories",
  "audiences",
  "featured",
  "about",
  "projects",
  "process",
  "knowledge",
  "contact",
] as const;

const homeSchema = z.object({
  sectionOrder: z
    .array(z.enum(sectionIds))
    .length(sectionIds.length)
    .refine((items) => new Set(items).size === items.length, "Section IDs must be unique"),
  hero: z.object({
    eyebrow: requiredText,
    title: requiredText,
    highlight: requiredText,
    description: requiredText,
    primaryLabel: requiredText,
    secondaryLabel: requiredText,
    image: imageRefSchema,
    style: textStyleSchema,
    metrics: z
      .array(z.object({ id: idSchema, value: requiredText, label: requiredText }))
      .min(1)
      .max(10),
  }),
  categoryImages: z.record(z.string(), imageRefSchema),
  sections: sectionsSchema,
});

const solarGroupSchema = <T extends "panel" | "inverter" | "battery">(id: T) =>
  z.object({
    id: z.literal(id),
    label: requiredText,
    title: requiredText,
    description: optionalText,
    alt: optionalText,
    image: imageRefSchema,
  });

const solarPageSchema = z.object({
  hero: z.object({
    eyebrow: requiredText,
    title: requiredText,
    description: requiredText,
    buttonLabel: requiredText,
    alt: optionalText,
    image: imageRefSchema,
  }),
  notice: optionalText,
  groups: z.object({
    panel: solarGroupSchema("panel"),
    inverter: solarGroupSchema("inverter"),
    battery: solarGroupSchema("battery"),
  }),
});

const cameraPageSchema = z.object({
  hero: z.object({
    eyebrow: requiredText,
    title: requiredText,
    description: requiredText,
    buttonLabel: requiredText,
    alt: optionalText,
    image: imageRefSchema,
  }),
  notice: optionalText,
  introduction: z.object({
    eyebrow: requiredText,
    title: requiredText,
    description: optionalText,
    alt: optionalText,
    image: imageRefSchema,
  }),
});

function createDefaultSolarPage(image: {
  assetId: string;
  focalX: "left" | "center" | "right";
  focalY: "top" | "center" | "bottom";
}) {
  const imageRef = () => ({ ...image });

  return {
    hero: {
      eyebrow: "Giải pháp năng lượng",
      title: "Điện mặt trời",
      description:
        "Thiết bị điện mặt trời cho gia đình, cửa hàng và doanh nghiệp.",
      buttonLabel: "Yêu cầu tư vấn",
      alt: "Thiết bị và giải pháp điện mặt trời",
      image: imageRef(),
    },
    notice:
      "Thông tin sản phẩm tham khảo. Khả năng cung ứng, cấu hình và tình trạng phân phối cần được Hưng Phát xác nhận khi tư vấn.",
    groups: {
      panel: {
        id: "panel",
        label: "Tấm pin",
        title: "Tấm pin năng lượng mặt trời",
        description:
          "Các lựa chọn tấm pin hiệu suất cao cho nhiều quy mô hệ thống.",
        alt: "Tấm pin năng lượng mặt trời",
        image: imageRef(),
      },
      inverter: {
        id: "inverter",
        label: "Biến tần",
        title: "Biến tần điện mặt trời",
        description: "Biến tần hybrid và hòa lưới từ 6 kW đến 20 kW.",
        alt: "Biến tần điện mặt trời",
        image: imageRef(),
      },
      battery: {
        id: "battery",
        label: "Pin lưu trữ",
        title: "Pin lưu trữ năng lượng",
        description:
          "Giải pháp lưu trữ điện cho hệ thống dân dụng và thương mại.",
        alt: "Pin lưu trữ năng lượng",
        image: imageRef(),
      },
    },
  };
}

function createDefaultCameraPage(image: {
  assetId: string;
  focalX: "left" | "center" | "right";
  focalY: "top" | "center" | "bottom";
}) {
  const imageRef = () => ({ ...image });

  return {
    hero: {
      eyebrow: "Giải pháp an ninh",
      title: "Camera giám sát",
      description:
        "Thiết bị quan sát cho gia đình, cửa hàng, văn phòng và doanh nghiệp.",
      buttonLabel: "Yêu cầu tư vấn",
      alt: "Giải pháp camera giám sát",
      image: imageRef(),
    },
    notice:
      "Thông tin sản phẩm tham khảo. Khả năng cung ứng, cấu hình lưu trữ và tình trạng phân phối cần được Hưng Phát xác nhận khi tư vấn.",
    introduction: {
      eyebrow: "Danh mục camera",
      title: "Giải pháp camera theo không gian sử dụng",
      description:
        "Lựa chọn camera trong nhà, ngoài trời, quay quét và nhiều ống kính theo nhu cầu quan sát thực tế.",
      alt: "Các dòng camera giám sát",
      image: imageRef(),
    },
  };
}

const pagesSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const pages = value as Record<string, unknown>;

    const home =
      pages.home && typeof pages.home === "object" && !Array.isArray(pages.home)
        ? (pages.home as Record<string, unknown>)
        : null;
    const categoryImages =
      home?.categoryImages &&
      typeof home.categoryImages === "object" &&
      !Array.isArray(home.categoryImages)
        ? (home.categoryImages as Record<string, unknown>)
        : null;
    const resolveCategoryImage = (slug: string, fallbackAssetId: string) => {
      const parsedImage = imageRefSchema.safeParse(categoryImages?.[slug]);
      return parsedImage.success
        ? parsedImage.data
        : {
            assetId: fallbackAssetId,
            focalX: "center" as const,
            focalY: "center" as const,
          };
    };

    return {
      ...pages,
      solar:
        pages.solar ??
        createDefaultSolarPage(
          resolveCategoryImage("dien-mat-troi", "category-solar"),
        ),
      camera:
        pages.camera ??
        createDefaultCameraPage(
          resolveCategoryImage("camera-giam-sat", "category-camera"),
        ),
    };
  },
  z.object({
    home: homeSchema,
    solar: solarPageSchema,
    camera: cameraPageSchema,
  }),
);

const contentSchema = z
  .object({
    site: z.object({
      brandName: requiredText,
      legalName: requiredText,
      address: requiredText,
      phones: z.array(phoneSchema).min(1).max(5),
      footerNote: optionalText,
    }),
    navigation: navigationSchema,
    assets: z.record(idSchema, assetSchema),
    pages: pagesSchema,
  })
  .superRefine((content, context) => {
    const references = [
      content.pages.home.hero.image.assetId,
      ...Object.values(content.pages.home.categoryImages).map((image) => image.assetId),
      ...content.pages.home.sections.featured.images.flatMap((item) =>
        item.image.assetId ? [item.image.assetId] : [],
      ),
      ...content.pages.home.sections.projects.items.flatMap((item) =>
        item.image.assetId ? [item.image.assetId] : [],
      ),
      content.pages.solar.hero.image.assetId,
      ...Object.values(content.pages.solar.groups).map((group) => group.image.assetId),
      content.pages.camera.hero.image.assetId,
      content.pages.camera.introduction.image.assetId,
    ];
    for (const assetId of references) {
      if (!content.assets[assetId]) {
        context.addIssue({
          code: "custom",
          message: `Unknown asset reference: ${assetId}`,
        });
      }
    }
  });

export const publishedEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  publishedRevision: z.number().int().nonnegative(),
  content: contentSchema,
});

export const draftEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  draftRevision: z.number().int().nonnegative(),
  basePublishedRevision: z.number().int().nonnegative(),
  content: contentSchema,
});

export type SiteContent = z.infer<typeof contentSchema>;
export type PublishedEnvelope = z.infer<typeof publishedEnvelopeSchema>;
export type DraftEnvelope = z.infer<typeof draftEnvelopeSchema>;
export type HomeContent = SiteContent["pages"]["home"];
export type SolarPageContent = SiteContent["pages"]["solar"];
export type SolarGroupContent =
  SolarPageContent["groups"][keyof SolarPageContent["groups"]];
export type CameraPageContent = SiteContent["pages"]["camera"];
export type SiteSettings = SiteContent["site"];

export function parsePublishedEnvelope(value: unknown): PublishedEnvelope {
  return publishedEnvelopeSchema.parse(value);
}

export function parseDraftEnvelope(value: unknown): DraftEnvelope {
  return draftEnvelopeSchema.parse(value);
}

export function createDraftFromPublished(published: PublishedEnvelope): DraftEnvelope {
  return {
    schemaVersion: 1,
    draftRevision: 0,
    basePublishedRevision: published.publishedRevision,
    content: structuredClone(published.content),
  };
}
