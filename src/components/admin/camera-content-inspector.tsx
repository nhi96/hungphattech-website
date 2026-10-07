"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content/content-schema";
import { SelectField, TextArea, TextField } from "./editor-fields";

export type CameraSelection = "hero" | "notice" | "introduction";

type Commit = (mutator: (draft: SiteContent) => void) => void;
type UploadImage = (
  file: File,
  apply: (draft: SiteContent, assetId: string) => void,
) => Promise<void>;

export function CameraContentInspector({
  content,
  selection,
  uploading,
  commit,
  uploadImage,
}: {
  content: SiteContent;
  selection: CameraSelection;
  uploading: boolean;
  commit: Commit;
  uploadImage: UploadImage;
}) {
  const camera = content.pages.camera;

  if (selection === "notice") {
    return (
      <TextArea
        label="Thông báo sản phẩm"
        value={camera.notice}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.camera.notice = value;
          })
        }
      />
    );
  }

  if (selection === "hero") {
    return (
      <div className="grid gap-4">
        <TextField
          label="Dòng giới thiệu"
          value={camera.hero.eyebrow}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.camera.hero.eyebrow = value;
            })
          }
        />
        <TextField
          label="Tiêu đề chính"
          value={camera.hero.title}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.camera.hero.title = value;
            })
          }
        />
        <TextArea
          label="Mô tả banner"
          value={camera.hero.description}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.camera.hero.description = value;
            })
          }
        />
        <TextField
          label="Nút tư vấn"
          value={camera.hero.buttonLabel}
          onChange={(value) =>
            commit((draft) => {
              draft.pages.camera.hero.buttonLabel = value;
            })
          }
        />
        <ImageEditor
          content={content}
          label="Banner camera"
          alt={camera.hero.alt}
          image={camera.hero.image}
          uploading={uploading}
          onAltChange={(value) =>
            commit((draft) => {
              draft.pages.camera.hero.alt = value;
            })
          }
          onImageChange={(key, value) =>
            commit((draft) => {
              draft.pages.camera.hero.image[key] = value as never;
            })
          }
          onUpload={(file) =>
            uploadImage(file, (draft, assetId) => {
              draft.pages.camera.hero.image.assetId = assetId;
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <TextField
        label="Nhãn nhỏ"
        value={camera.introduction.eyebrow}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.camera.introduction.eyebrow = value;
          })
        }
      />
      <TextField
        label="Tiêu đề giới thiệu"
        value={camera.introduction.title}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.camera.introduction.title = value;
          })
        }
      />
      <TextArea
        label="Mô tả giới thiệu"
        value={camera.introduction.description}
        onChange={(value) =>
          commit((draft) => {
            draft.pages.camera.introduction.description = value;
          })
        }
      />
      <ImageEditor
        content={content}
        label="Giới thiệu camera"
        alt={camera.introduction.alt}
        image={camera.introduction.image}
        uploading={uploading}
        onAltChange={(value) =>
          commit((draft) => {
            draft.pages.camera.introduction.alt = value;
          })
        }
        onImageChange={(key, value) =>
          commit((draft) => {
            draft.pages.camera.introduction.image[key] = value as never;
          })
        }
        onUpload={(file) =>
          uploadImage(file, (draft, assetId) => {
            draft.pages.camera.introduction.image.assetId = assetId;
          })
        }
      />
    </div>
  );
}

function ImageEditor({
  content,
  label,
  alt,
  image,
  uploading,
  onAltChange,
  onImageChange,
  onUpload,
}: {
  content: SiteContent;
  label: string;
  alt: string;
  image: SiteContent["pages"]["camera"]["hero"]["image"];
  uploading: boolean;
  onAltChange: (value: string) => void;
  onImageChange: (
    key: "focalX" | "focalY",
    value: "left" | "center" | "right" | "top" | "bottom",
  ) => void;
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
          options={[
            { value: "left", label: "Trái" },
            { value: "center", label: "Giữa" },
            { value: "right", label: "Phải" },
          ]}
          onChange={(value) =>
            onImageChange("focalX", value as "left" | "center" | "right")
          }
        />
        <SelectField
          label={`Vị trí dọc ${label}`}
          value={image.focalY}
          options={[
            { value: "top", label: "Trên" },
            { value: "center", label: "Giữa" },
            { value: "bottom", label: "Dưới" },
          ]}
          onChange={(value) =>
            onImageChange("focalY", value as "top" | "center" | "bottom")
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
