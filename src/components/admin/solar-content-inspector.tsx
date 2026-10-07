"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content/content-schema";
import type { SolarProductGroup } from "@/types/content";
import { SelectField, TextArea, TextField } from "./editor-fields";

export type SolarSelection = "hero" | "notice" | SolarProductGroup;

type Commit = (mutator: (draft: SiteContent) => void) => void;
type UploadImage = (
  file: File,
  apply: (draft: SiteContent, assetId: string) => void,
) => Promise<void>;

const focalXOptions = [
  { value: "left", label: "Trái" },
  { value: "center", label: "Giữa" },
  { value: "right", label: "Phải" },
];

const focalYOptions = [
  { value: "top", label: "Trên" },
  { value: "center", label: "Giữa" },
  { value: "bottom", label: "Dưới" },
];

export function SolarContentInspector({
  content,
  selection,
  uploading,
  commit,
  uploadImage,
}: {
  content: SiteContent;
  selection: SolarSelection;
  uploading: boolean;
  commit: Commit;
  uploadImage: UploadImage;
}) {
  const solar = content.pages.solar;

  if (selection === "notice") {
    return (
      <TextArea
        label="Thông báo sản phẩm"
        value={solar.notice}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.solar.notice = value;
          })
        }
      />
    );
  }

  if (selection === "hero") {
    const placement = solar.hero;
    return (
      <div className="grid gap-4">
        <TextField
          label="Dòng giới thiệu"
          value={placement.eyebrow}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.solar.hero.eyebrow = value;
            })
          }
        />
        <TextField
          label="Tiêu đề chính"
          value={placement.title}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.solar.hero.title = value;
            })
          }
        />
        <TextArea
          label="Mô tả banner"
          value={placement.description}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.solar.hero.description = value;
            })
          }
        />
        <TextField
          label="Nút tư vấn"
          value={placement.buttonLabel}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.solar.hero.buttonLabel = value;
            })
          }
        />
        <ImagePlacementEditor
          content={content}
          label="Banner điện mặt trời"
          alt={placement.alt}
          image={placement.image}
          uploading={uploading}
          onAltChange={(value) =>
            commit((draft) => {
              draft.pages.solar.hero.alt = value;
            })
          }
          onFocalXChange={(value) =>
            commit((draft) => {
              draft.pages.solar.hero.image.focalX = value;
            })
          }
          onFocalYChange={(value) =>
            commit((draft) => {
              draft.pages.solar.hero.image.focalY = value;
            })
          }
          onUpload={(file) =>
            uploadImage(file, (draft, assetId) => {
              draft.pages.solar.hero.image.assetId = assetId;
            })
          }
        />
      </div>
    );
  }

  const group = solar.groups[selection];
  return (
    <div className="grid gap-4">
      <TextField
        label="Tên tab"
        value={group.label}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.solar.groups[selection].label = value;
          })
        }
      />
      <TextField
        label="Tiêu đề nhóm"
        value={group.title}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.solar.groups[selection].title = value;
          })
        }
      />
      <TextArea
        label="Mô tả nhóm"
        value={group.description}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.solar.groups[selection].description = value;
          })
        }
      />
      <ImagePlacementEditor
        content={content}
        label={group.label}
        alt={group.alt}
        image={group.image}
        uploading={uploading}
        onAltChange={(value) =>
          commit((draft) => {
            draft.pages.solar.groups[selection].alt = value;
          })
        }
        onFocalXChange={(value) =>
          commit((draft) => {
            draft.pages.solar.groups[selection].image.focalX = value;
          })
        }
        onFocalYChange={(value) =>
          commit((draft) => {
            draft.pages.solar.groups[selection].image.focalY = value;
          })
        }
        onUpload={(file) =>
          uploadImage(file, (draft, assetId) => {
            draft.pages.solar.groups[selection].image.assetId = assetId;
          })
        }
      />
    </div>
  );
}

function ImagePlacementEditor({
  content,
  label,
  alt,
  image,
  uploading,
  onAltChange,
  onFocalXChange,
  onFocalYChange,
  onUpload,
}: {
  content: SiteContent;
  label: string;
  alt: string;
  image: SiteContent["pages"]["solar"]["hero"]["image"];
  uploading: boolean;
  onAltChange: (value: string) => void;
  onFocalXChange: (value: "left" | "center" | "right") => void;
  onFocalYChange: (value: "top" | "center" | "bottom") => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const asset = content.assets[image.assetId];

  return (
    <div className="grid gap-3 border border-white/15 bg-[#111518] p-4">
      <Image
        src={asset.path}
        alt=""
        width={asset.width}
        height={asset.height}
        className="aspect-[4/3] w-full bg-black object-cover"
        style={{ objectPosition: `${image.focalX} ${image.focalY}` }}
      />
      <TextField label={`Alt ảnh ${label}`} value={alt} onChange={onAltChange} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label={`Vị trí ngang ${label}`}
          value={image.focalX}
          options={focalXOptions}
          onChange={(value) =>
            onFocalXChange(value as "left" | "center" | "right")
          }
        />
        <SelectField
          label={`Vị trí dọc ${label}`}
          value={image.focalY}
          options={focalYOptions}
          onChange={(value) =>
            onFocalYChange(value as "top" | "center" | "bottom")
          }
        />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-[#ffc400] px-3 font-bold text-[#0b0f12]">
        <ImagePlus size={18} aria-hidden />
        Thay ảnh
        <input
          aria-label={`Tải ảnh ${label}`}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUpload(file);
          }}
        />
      </label>
    </div>
  );
}
