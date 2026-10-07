"use client";

import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Monitor,
  Redo2,
  RefreshCcw,
  Save,
  Smartphone,
  Undo2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DraftEnvelope,
  SiteContent,
} from "@/lib/content/content-schema";
import {
  CameraContentInspector,
  type CameraSelection,
} from "./camera-content-inspector";
import { SelectField, TextArea, TextField } from "./editor-fields";
import {
  SolarContentInspector,
  type SolarSelection,
} from "./solar-content-inspector";

type Selection =
  | "site"
  | "hero"
  | "images"
  | keyof SiteContent["pages"]["home"]["sections"];

type EditorStatus = "saved" | "unsaved" | "saving" | "publishing" | "conflict" | "error";
type EditorPage = "home" | "solar" | "camera";

const sectionLabels: Record<keyof SiteContent["pages"]["home"]["sections"], string> = {
  categories: "Danh mục chính",
  audiences: "Theo nhu cầu",
  featured: "Kinh nghiệm Hưng Phát",
  about: "Về Hưng Phát",
  projects: "Dự án",
  process: "Quy trình",
  knowledge: "Kiến thức",
  contact: "Liên hệ",
};

const statusLabels: Record<EditorStatus, string> = {
  saved: "Đã lưu bản nháp",
  unsaved: "Chưa lưu",
  saving: "Đang lưu...",
  publishing: "Đang áp dụng...",
  conflict: "Xung đột phiên bản",
  error: "Không thể lưu",
};

export function ContentEditor({
  initialDraft,
  initialPublishedRevision,
}: {
  initialDraft: DraftEnvelope;
  initialPublishedRevision: number;
}) {
  const [content, setContent] = useState(initialDraft.content);
  const [draftRevision, setDraftRevision] = useState(initialDraft.draftRevision);
  const [publishedRevision, setPublishedRevision] = useState(initialPublishedRevision);
  const [selection, setSelection] = useState<Selection>("hero");
  const [activePage, setActivePage] = useState<EditorPage>("home");
  const [solarSelection, setSolarSelection] = useState<SolarSelection>("panel");
  const [cameraSelection, setCameraSelection] =
    useState<CameraSelection>("introduction");
  const [status, setStatus] = useState<EditorStatus>("saved");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [mobilePane, setMobilePane] = useState<"navigator" | "preview" | "inspector">("preview");
  const [previewKey, setPreviewKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const history = useRef<SiteContent[]>([]);
  const future = useRef<SiteContent[]>([]);
  const contentRef = useRef(content);
  const revisionRef = useRef(draftRevision);
  const savePromiseRef = useRef<Promise<DraftEnvelope | null> | null>(null);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  useEffect(() => {
    revisionRef.current = draftRevision;
  }, [draftRevision]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (status !== "unsaved") return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[title="Xem trước website"]',
      );
      if (
        event.origin !== window.location.origin ||
        event.source !== iframe?.contentWindow ||
        typeof event.data !== "object" ||
        event.data?.type !== "preview:navigate" ||
        typeof event.data?.path !== "string"
      ) {
        return;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const commit = useCallback((mutator: (draft: SiteContent) => void) => {
    setContent((current) => {
      history.current = [...history.current.slice(-49), structuredClone(current)];
      future.current = [];
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
    setStatus("unsaved");
  }, []);

  const saveDraft = useCallback(() => {
    if (savePromiseRef.current) return savePromiseRef.current;

    const request = (async () => {
      setStatus("saving");
      try {
        const response = await fetch("/api/admin/content/draft", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            content: contentRef.current,
            expectedDraftRevision: revisionRef.current,
          }),
        });
        const result = await response.json();
        if (response.status === 409) {
          setStatus("conflict");
          return null;
        }
        if (!response.ok) throw new Error(result.message);
        const draft = result.data.draft as DraftEnvelope;
        revisionRef.current = draft.draftRevision;
        setDraftRevision(draft.draftRevision);
        setStatus("saved");
        setPreviewKey((value) => value + 1);
        return draft;
      } catch {
        setStatus("error");
        return null;
      } finally {
        savePromiseRef.current = null;
      }
    })();

    savePromiseRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    if (status !== "unsaved") return;
    const timer = window.setTimeout(() => void saveDraft(), 900);
    return () => window.clearTimeout(timer);
  }, [content, saveDraft, status]);

  const publish = async () => {
    let revision = revisionRef.current;
    if (status === "unsaved" || status === "saving") {
      const savedDraft = await saveDraft();
      if (!savedDraft) return;
      revision = savedDraft.draftRevision;
    }
    setStatus("publishing");
    try {
      const response = await fetch("/api/admin/content/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expectedDraftRevision: revision,
          expectedPublishedRevision: publishedRevision,
        }),
      });
      const result = await response.json();
      if (response.status === 409) {
        setStatus("conflict");
        return;
      }
      if (!response.ok) throw new Error(result.message);
      setDraftRevision(result.data.draft.draftRevision);
      setPublishedRevision(result.data.published.publishedRevision);
      setContent(result.data.draft.content);
      setStatus("saved");
      setPreviewKey((value) => value + 1);
    } catch {
      setStatus("error");
    }
  };

  const reset = async () => {
    setStatus("saving");
    try {
      const response = await fetch("/api/admin/content/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expectedDraftRevision: revisionRef.current,
          expectedPublishedRevision: publishedRevision,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setContent(result.data.draft.content);
      setDraftRevision(result.data.draft.draftRevision);
      setStatus("saved");
      setPreviewKey((value) => value + 1);
    } catch {
      setStatus("error");
    }
  };

  const undo = () => {
    const previous = history.current.pop();
    if (!previous) return;
    future.current.push(structuredClone(content));
    setContent(previous);
    setStatus("unsaved");
  };

  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    history.current.push(structuredClone(content));
    setContent(next);
    setStatus("unsaved");
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    commit((draft) => {
      const order = draft.pages.home.sectionOrder;
      const index = order.indexOf(id as never);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= order.length) return;
      [order[index], order[target]] = [order[target], order[index]];
    });
  };

  const uploadImage = useCallback(async (
    file: File,
    apply: (draft: SiteContent, assetId: string) => void,
  ) => {
    setUploading(true);
    const form = new FormData();
    form.set("file", file);
    try {
      const response = await fetch("/api/admin/assets", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      commit((draft) => {
        const asset = result.data.asset;
        draft.assets[asset.id] = {
          id: asset.id,
          path: asset.path,
          alt: asset.alt,
          mime: asset.mime,
          width: asset.width,
          height: asset.height,
        };
        apply(draft, asset.id);
      });
    } finally {
      setUploading(false);
    }
  }, [commit]);

  const homeInspector = useMemo(() => {
    if (selection === "site") {
      return (
        <div className="grid gap-4">
          <TextField label="Tên thương hiệu" value={content.site.brandName} onChange={(value) => commit((draft) => { draft.site.brandName = value; })} />
          <TextField label="Tên pháp lý" value={content.site.legalName} onChange={(value) => commit((draft) => { draft.site.legalName = value; })} />
          <TextArea label="Địa chỉ" value={content.site.address} onChange={(value) => commit((draft) => { draft.site.address = value; })} />
          {content.site.phones.map((phone, index) => (
            <div key={phone.id} className="grid grid-cols-2 gap-3">
              <TextField label={`Số hiển thị ${index + 1}`} value={phone.display} onChange={(value) => commit((draft) => { draft.site.phones[index].display = value; })} />
              <TextField label={`Số gọi ${index + 1}`} value={phone.value} onChange={(value) => commit((draft) => { draft.site.phones[index].value = value.replace(/\D/g, "").slice(0, 10); })} />
            </div>
          ))}
          <TextArea label="Ghi chú chân trang" value={content.site.footerNote} onChange={(value) => commit((draft) => { draft.site.footerNote = value; })} />
          <div className="border-t border-white/15 pt-4">
            <p className="mb-3 text-xs font-black uppercase text-[#ffc400]">Nhãn menu</p>
            <div className="grid gap-3">
              {content.navigation.map((item, index) => (
                <TextField
                  key={item.id}
                  label={`Nhãn menu ${item.label}`}
                  value={item.label}
                  onChange={(value) => commit((draft) => {
                    draft.navigation[index].label = value;
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selection === "hero") {
      const hero = content.pages.home.hero;
      return (
        <div className="grid gap-4">
          <TextField label="Dòng giới thiệu" value={hero.eyebrow} onChange={(value) => commit((draft) => { draft.pages.home.hero.eyebrow = value; })} />
          <TextField label="Tiêu đề chính" value={hero.title} onChange={(value) => commit((draft) => { draft.pages.home.hero.title = value; })} />
          <TextField label="Dòng nhấn màu vàng" value={hero.highlight} onChange={(value) => commit((draft) => { draft.pages.home.hero.highlight = value; })} />
          <TextArea label="Mô tả banner" value={hero.description} onChange={(value) => commit((draft) => { draft.pages.home.hero.description = value; })} />
          <TextField label="Nút chính" value={hero.primaryLabel} onChange={(value) => commit((draft) => { draft.pages.home.hero.primaryLabel = value; })} />
          <TextField label="Nút phụ" value={hero.secondaryLabel} onChange={(value) => commit((draft) => { draft.pages.home.hero.secondaryLabel = value; })} />
          <StyleFields style={hero.style} onChange={(key, value) => commit((draft) => { draft.pages.home.hero.style[key] = value as never; })} />
          <div className="border-t border-white/15 pt-4">
            <p className="mb-3 text-xs font-black uppercase text-[#ffc400]">Số liệu banner</p>
            <div className="grid gap-4">
              {hero.metrics.map((metric, index) => (
                <div key={metric.id} className="grid grid-cols-[90px_1fr] gap-3">
                  <TextField
                    label={`Giá trị số liệu ${index + 1}`}
                    value={metric.value}
                    onChange={(value) => commit((draft) => {
                      draft.pages.home.hero.metrics[index].value = value;
                    })}
                  />
                  <TextField
                    label={`Nhãn số liệu ${index + 1}`}
                    value={metric.label}
                    onChange={(value) => commit((draft) => {
                      draft.pages.home.hero.metrics[index].label = value;
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selection === "images") {
      const targets = [
        { id: "hero", label: "Ảnh banner", ref: content.pages.home.hero.image },
        ...Object.entries(content.pages.home.categoryImages).map(([id, ref]) => ({
          id,
          label: sectionLabels.categories + ` - ${id}`,
          ref,
        })),
      ];
      return (
        <div className="grid gap-5">
          {targets.map((target) => {
            const asset = content.assets[target.ref.assetId];
            return (
              <div key={target.id} className="border border-white/15 bg-[#111518] p-4">
                <p className="font-bold text-white">{target.label}</p>
                <Image
                  src={asset.path}
                  alt=""
                  width={asset.width}
                  height={asset.height}
                  className="mt-3 aspect-video w-full object-cover"
                />
                <TextField label="Alt text" value={asset.alt} onChange={(value) => commit((draft) => { draft.assets[target.ref.assetId].alt = value; })} />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <SelectField
                    label={`Vị trí ngang ${target.label}`}
                    value={target.ref.focalX}
                    options={[
                      { value: "left", label: "Trái" },
                      { value: "center", label: "Giữa" },
                      { value: "right", label: "Phải" },
                    ]}
                    onChange={(value) => commit((draft) => {
                      const image = target.id === "hero"
                        ? draft.pages.home.hero.image
                        : draft.pages.home.categoryImages[target.id];
                      image.focalX = value as typeof image.focalX;
                    })}
                  />
                  <SelectField
                    label={`Vị trí dọc ${target.label}`}
                    value={target.ref.focalY}
                    options={[
                      { value: "top", label: "Trên" },
                      { value: "center", label: "Giữa" },
                      { value: "bottom", label: "Dưới" },
                    ]}
                    onChange={(value) => commit((draft) => {
                      const image = target.id === "hero"
                        ? draft.pages.home.hero.image
                        : draft.pages.home.categoryImages[target.id];
                      image.focalY = value as typeof image.focalY;
                    })}
                  />
                </div>
                <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-[#ffc400] px-3 font-bold text-[#0b0f12]">
                  <ImagePlus size={18} aria-hidden /> Thay ảnh
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void uploadImage(file, (draft, assetId) => {
                        if (target.id === "hero") draft.pages.home.hero.image.assetId = assetId;
                        else draft.pages.home.categoryImages[target.id].assetId = assetId;
                      });
                    }}
                  />
                </label>
              </div>
            );
          })}
        </div>
      );
    }

    const section = content.pages.home.sections[selection];
    return (
      <div className="grid gap-4">
        {"index" in section ? <TextField label="Số thứ tự hiển thị" value={section.index} onChange={(value) => commit((draft) => { (draft.pages.home.sections[selection] as typeof section & { index: string }).index = value; })} /> : null}
        {"eyebrow" in section ? <TextField label="Nhãn nhỏ" value={section.eyebrow} onChange={(value) => commit((draft) => { (draft.pages.home.sections[selection] as typeof section).eyebrow = value; })} /> : null}
        {"title" in section ? <TextField label="Tiêu đề section" value={section.title} onChange={(value) => commit((draft) => { (draft.pages.home.sections[selection] as typeof section).title = value; })} /> : null}
        {"description" in section ? <TextArea label="Mô tả section" value={section.description} onChange={(value) => commit((draft) => { (draft.pages.home.sections[selection] as typeof section & { description: string }).description = value; })} /> : null}
        {"style" in section ? <StyleFields style={section.style} onChange={(key, value) => commit((draft) => { draft.pages.home.sections[selection].style[key] = value as never; })} /> : null}
        {selection === "audiences" ? (
          <>
            <TextField label="Nút liên kết" value={content.pages.home.sections.audiences.buttonLabel} onChange={(value) => commit((draft) => { draft.pages.home.sections.audiences.buttonLabel = value; })} />
            <RepeatedItemsHeading>Thẻ nhu cầu</RepeatedItemsHeading>
            {content.pages.home.sections.audiences.items.map((item, index) => (
              <div key={item.id} className="grid gap-3 border border-white/15 p-3">
                <TextField label={`Tiêu đề thẻ ${index + 1}`} value={item.title} onChange={(value) => commit((draft) => { draft.pages.home.sections.audiences.items[index].title = value; })} />
                <TextArea label={`Mô tả thẻ ${index + 1}`} value={item.description} onChange={(value) => commit((draft) => { draft.pages.home.sections.audiences.items[index].description = value; })} />
                <MoveButtons
                  label={`thẻ ${index + 1}`}
                  index={index}
                  count={content.pages.home.sections.audiences.items.length}
                  onMove={(direction) => commit((draft) => {
                    moveArrayItem(draft.pages.home.sections.audiences.items, index, direction);
                  })}
                />
              </div>
            ))}
          </>
        ) : null}
        {selection === "featured" ? (
          <>
            <RepeatedItemsHeading>Hình ảnh kinh nghiệm</RepeatedItemsHeading>
            {content.pages.home.sections.featured.images.map((item, index) => {
              const asset = item.image.assetId
                ? content.assets[item.image.assetId]
                : null;
              return (
                <div
                  key={item.id}
                  data-testid={`experience-editor-${item.id}`}
                  className="grid gap-3 border border-white/15 bg-[#111518] p-4"
                >
                  {asset ? (
                    <Image
                      src={asset.path}
                      alt=""
                      width={asset.width}
                      height={asset.height}
                      className="aspect-[3/4] w-full bg-black object-contain"
                      style={{
                        objectPosition: `${item.image.focalX} ${item.image.focalY}`,
                      }}
                    />
                  ) : (
                    <div className="grid aspect-[3/4] place-items-center border border-dashed border-white/25 bg-black text-sm font-bold text-[#8f969d]">
                      Chưa thêm ảnh
                    </div>
                  )}
                  <TextField
                    label={`Tên ảnh ${item.label}`}
                    value={item.label}
                    onChange={(value) => commit((draft) => {
                      draft.pages.home.sections.featured.images[index].label = value;
                    })}
                  />
                  <TextField
                    label={`Alt ảnh ${item.label}`}
                    value={item.alt}
                    onChange={(value) => commit((draft) => {
                      draft.pages.home.sections.featured.images[index].alt = value;
                    })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      label={`Vị trí ngang ${item.label}`}
                      value={item.image.focalX}
                      options={[
                        { value: "left", label: "Trái" },
                        { value: "center", label: "Giữa" },
                        { value: "right", label: "Phải" },
                      ]}
                      onChange={(value) => commit((draft) => {
                        draft.pages.home.sections.featured.images[index].image.focalX =
                          value as typeof item.image.focalX;
                      })}
                    />
                    <SelectField
                      label={`Vị trí dọc ${item.label}`}
                      value={item.image.focalY}
                      options={[
                        { value: "top", label: "Trên" },
                        { value: "center", label: "Giữa" },
                        { value: "bottom", label: "Dưới" },
                      ]}
                      onChange={(value) => commit((draft) => {
                        draft.pages.home.sections.featured.images[index].image.focalY =
                          value as typeof item.image.focalY;
                      })}
                    />
                  </div>
                  <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-[#ffc400] px-3 font-bold text-[#0b0f12]">
                    <ImagePlus size={18} aria-hidden />
                    {asset ? "Thay ảnh" : "Tải ảnh"}
                    <input
                      aria-label={`Tải ảnh ${item.label}`}
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void uploadImage(file, (draft, assetId) => {
                          draft.pages.home.sections.featured.images[index].image.assetId =
                            assetId;
                        });
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </>
        ) : null}
        {selection === "about" ? (
          <>
            {content.pages.home.sections.about.paragraphs.map((paragraph, index) => (
              <TextArea key={index} label={`Đoạn giới thiệu ${index + 1}`} value={paragraph} onChange={(value) => commit((draft) => { draft.pages.home.sections.about.paragraphs[index] = value; })} />
            ))}
            <TextField label="Nút liên kết" value={content.pages.home.sections.about.buttonLabel} onChange={(value) => commit((draft) => { draft.pages.home.sections.about.buttonLabel = value; })} />
          </>
        ) : null}
        {selection === "projects" ? (
          <>
            <RepeatedItemsHeading>Công trình nổi bật</RepeatedItemsHeading>
            {content.pages.home.sections.projects.items.map((item, index) => {
              const asset = item.image.assetId
                ? content.assets[item.image.assetId]
                : null;
              const number = index + 1;
              return (
                <div
                  key={item.id}
                  data-testid={`project-editor-${item.id}`}
                  className="grid gap-3 border border-white/15 bg-[#111518] p-4"
                >
                  {asset ? (
                    <Image
                      src={asset.path}
                      alt=""
                      width={asset.width}
                      height={asset.height}
                      className="aspect-[4/3] w-full bg-black object-cover"
                      style={{
                        objectPosition: `${item.image.focalX} ${item.image.focalY}`,
                      }}
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center border border-dashed border-white/25 bg-black text-sm font-bold text-[#8f969d]">
                      Chưa thêm ảnh
                    </div>
                  )}
                  <TextField
                    label={`Tiêu đề công trình ${number}`}
                    value={item.title}
                    onChange={(value) => commit((draft) => {
                      draft.pages.home.sections.projects.items[index].title = value;
                    })}
                  />
                  <TextArea
                    label={`Mô tả công trình ${number}`}
                    value={item.description}
                    onChange={(value) => commit((draft) => {
                      draft.pages.home.sections.projects.items[index].description = value;
                    })}
                  />
                  <TextField
                    label={`Alt ảnh công trình ${number}`}
                    value={item.alt}
                    onChange={(value) => commit((draft) => {
                      draft.pages.home.sections.projects.items[index].alt = value;
                    })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      label={`Vị trí ngang công trình ${number}`}
                      value={item.image.focalX}
                      options={[
                        { value: "left", label: "Trái" },
                        { value: "center", label: "Giữa" },
                        { value: "right", label: "Phải" },
                      ]}
                      onChange={(value) => commit((draft) => {
                        draft.pages.home.sections.projects.items[index].image.focalX =
                          value as typeof item.image.focalX;
                      })}
                    />
                    <SelectField
                      label={`Vị trí dọc công trình ${number}`}
                      value={item.image.focalY}
                      options={[
                        { value: "top", label: "Trên" },
                        { value: "center", label: "Giữa" },
                        { value: "bottom", label: "Dưới" },
                      ]}
                      onChange={(value) => commit((draft) => {
                        draft.pages.home.sections.projects.items[index].image.focalY =
                          value as typeof item.image.focalY;
                      })}
                    />
                  </div>
                  <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-[#ffc400] px-3 font-bold text-[#0b0f12]">
                    <ImagePlus size={18} aria-hidden />
                    {asset ? "Thay ảnh" : "Tải ảnh"}
                    <input
                      aria-label={`Tải ảnh công trình ${number}`}
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void uploadImage(file, (draft, assetId) => {
                          draft.pages.home.sections.projects.items[index].image.assetId =
                            assetId;
                        });
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </>
        ) : null}
        {selection === "process" ? (
          <>
            <TextField label="Ghi chú quy trình" value={content.pages.home.sections.process.note} onChange={(value) => commit((draft) => { draft.pages.home.sections.process.note = value; })} />
            <RepeatedItemsHeading>Các bước</RepeatedItemsHeading>
            {content.pages.home.sections.process.items.map((item, index) => (
              <div key={item.id} className="grid gap-3 border border-white/15 p-3">
                <TextField label={`Nội dung bước ${index + 1}`} value={item.text} onChange={(value) => commit((draft) => { draft.pages.home.sections.process.items[index].text = value; })} />
                <MoveButtons
                  label={`bước ${index + 1}`}
                  index={index}
                  count={content.pages.home.sections.process.items.length}
                  onMove={(direction) => commit((draft) => {
                    moveArrayItem(draft.pages.home.sections.process.items, index, direction);
                  })}
                />
              </div>
            ))}
          </>
        ) : null}
        {selection === "knowledge" ? (
          <TextField label="Nút liên kết" value={content.pages.home.sections.knowledge.buttonLabel} onChange={(value) => commit((draft) => { draft.pages.home.sections.knowledge.buttonLabel = value; })} />
        ) : null}
      </div>
    );
  }, [commit, content, selection, uploadImage, uploading]);
  const inspector =
    activePage === "solar" ? (
      <SolarContentInspector
        content={content}
        selection={solarSelection}
        uploading={uploading}
        commit={commit}
        uploadImage={uploadImage}
      />
    ) : activePage === "camera" ? (
      <CameraContentInspector
        content={content}
        selection={cameraSelection}
        uploading={uploading}
        commit={commit}
        uploadImage={uploadImage}
      />
    ) : (
      homeInspector
    );
  const previewSolarGroup =
    solarSelection === "inverter" || solarSelection === "battery"
      ? solarSelection
      : "panel";
  const previewSource =
    activePage === "solar"
      ? `/quan-tri/xem-truoc/solar?revision=${draftRevision}&group=${previewSolarGroup}`
      : activePage === "camera"
        ? `/quan-tri/xem-truoc/camera?revision=${draftRevision}`
      : `/quan-tri/xem-truoc/home?revision=${draftRevision}`;

  return (
    <div className="fixed inset-0 z-[200] flex min-h-screen flex-col overflow-hidden bg-[#080b0d] text-white">
      <header className="flex shrink-0 flex-col gap-2 border-b border-white/10 px-3 py-2 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-4 lg:py-0">
        <div className="flex items-baseline justify-between gap-3 lg:block">
          <h1 className="whitespace-nowrap text-base font-black lg:text-lg">Trình quản trị nội dung</h1>
          <p className={`text-xs ${status === "error" || status === "conflict" ? "text-red-400" : "text-[#ffc400]"}`}>
            {statusLabels[status]}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 lg:justify-end">
          <IconButton label="Hoàn tác" onClick={undo}><Undo2 /></IconButton>
          <IconButton label="Làm lại" onClick={redo}><Redo2 /></IconButton>
          <IconButton label="Xem desktop" onClick={() => setViewport("desktop")} active={viewport === "desktop"}><Monitor /></IconButton>
          <IconButton label="Xem mobile" onClick={() => setViewport("mobile")} active={viewport === "mobile"}><Smartphone /></IconButton>
          <button
            type="button"
            title="Khôi phục"
            aria-label="Khôi phục"
            onClick={() => void reset()}
            className="grid size-10 shrink-0 place-items-center border border-white/20 bg-transparent p-0 text-sm font-bold text-white hover:border-[#ffc400] xl:flex xl:w-auto xl:gap-2 xl:px-3"
          >
            <RefreshCcw size={17} aria-hidden /> <span className="hidden xl:inline">Khôi phục</span>
          </button>
          <button
            type="button"
            title="Lưu bản nháp"
            aria-label="Lưu bản nháp"
            onClick={() => void saveDraft()}
            className="grid size-10 shrink-0 place-items-center border border-white/20 bg-transparent p-0 text-sm font-bold text-white hover:border-[#ffc400] xl:flex xl:w-auto xl:gap-2 xl:px-3"
          >
            <Save size={17} aria-hidden /> <span className="hidden xl:inline">Lưu bản nháp</span>
          </button>
          <button
            type="button"
            title="Áp dụng thay đổi"
            aria-label="Áp dụng thay đổi"
            onClick={() => void publish()}
            className="grid size-10 shrink-0 place-items-center bg-[#ffc400] p-0 text-sm font-bold text-[#0b0f12] hover:bg-white xl:flex xl:w-auto xl:gap-2 xl:px-3"
            disabled={
              uploading ||
              status === "saving" ||
              status === "publishing" ||
              status === "conflict"
            }
          >
            <Upload size={17} aria-hidden /> <span className="hidden xl:inline">Áp dụng thay đổi</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 border-b border-white/10 lg:hidden">
        {(["navigator", "preview", "inspector"] as const).map((pane) => (
          <button key={pane} type="button" onClick={() => setMobilePane(pane)} className={`min-h-11 text-sm font-bold ${mobilePane === pane ? "bg-[#ffc400] text-black" : ""}`}>
            {pane === "navigator" ? "Nội dung" : pane === "preview" ? "Xem trước" : "Chỉnh sửa"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[230px_minmax(0,1fr)_360px]">
        <aside className={`${mobilePane === "navigator" ? "block" : "hidden"} overflow-y-auto border-r border-white/10 bg-[#0d1114] p-3 lg:block`}>
          <div className="mb-4 grid grid-cols-3 gap-1 border border-white/15 p-1">
            <NavButton label="Trang chủ" active={activePage === "home"} onClick={() => setActivePage("home")} />
            <NavButton label="Điện mặt trời" active={activePage === "solar"} onClick={() => setActivePage("solar")} />
            <NavButton label="Camera giám sát" active={activePage === "camera"} onClick={() => setActivePage("camera")} />
          </div>
          {activePage === "home" ? (
            <>
              <NavButton label="Cài đặt chung" active={selection === "site"} onClick={() => setSelection("site")} />
              <NavButton label="Banner trang chủ" active={selection === "hero"} onClick={() => setSelection("hero")} />
              <NavButton label="Hình ảnh" active={selection === "images"} onClick={() => setSelection("images")} />
              <p className="px-3 pb-2 pt-5 text-[0.65rem] font-black uppercase text-[#8f969d]">Thứ tự section</p>
              {content.pages.home.sectionOrder.map((id, index) => (
                <div key={id} className="flex items-center gap-1">
                  <NavButton label={sectionLabels[id]} active={selection === id} onClick={() => setSelection(id)} />
                  <IconButton label={`Đưa ${sectionLabels[id]} lên`} onClick={() => moveSection(id, -1)} disabled={index === 0}><ArrowUp /></IconButton>
                  <IconButton label={`Đưa ${sectionLabels[id]} xuống`} onClick={() => moveSection(id, 1)} disabled={index === content.pages.home.sectionOrder.length - 1}><ArrowDown /></IconButton>
                </div>
              ))}
            </>
          ) : activePage === "solar" ? (
            <>
              <NavButton label="Banner điện mặt trời" active={solarSelection === "hero"} onClick={() => setSolarSelection("hero")} />
              <NavButton label="Thông báo sản phẩm" active={solarSelection === "notice"} onClick={() => setSolarSelection("notice")} />
              <p className="px-3 pb-2 pt-5 text-[0.65rem] font-black uppercase text-[#8f969d]">Nhóm sản phẩm</p>
              <NavButton label={content.pages.solar.groups.panel.label} active={solarSelection === "panel"} onClick={() => setSolarSelection("panel")} />
              <NavButton label={content.pages.solar.groups.inverter.label} active={solarSelection === "inverter"} onClick={() => setSolarSelection("inverter")} />
              <NavButton label={content.pages.solar.groups.battery.label} active={solarSelection === "battery"} onClick={() => setSolarSelection("battery")} />
            </>
          ) : (
            <>
              <NavButton label="Banner camera" active={cameraSelection === "hero"} onClick={() => setCameraSelection("hero")} />
              <NavButton label="Thông báo sản phẩm" active={cameraSelection === "notice"} onClick={() => setCameraSelection("notice")} />
              <NavButton label="Giới thiệu danh mục" active={cameraSelection === "introduction"} onClick={() => setCameraSelection("introduction")} />
            </>
          )}
        </aside>

        <main className={`${mobilePane === "preview" ? "flex" : "hidden"} min-w-0 items-start justify-center overflow-auto bg-[#252b30] p-4 lg:flex`}>
          <iframe
            key={`${previewKey}-${activePage}-${solarSelection}-${cameraSelection}`}
            title="Xem trước website"
            data-viewport={viewport}
            src={previewSource}
            sandbox="allow-scripts allow-same-origin"
            className={`h-full min-h-[720px] bg-white shadow-2xl transition-[width] ${viewport === "mobile" ? "w-[390px] max-w-full" : "w-full"}`}
          />
        </main>

        <aside className={`${mobilePane === "inspector" ? "block" : "hidden"} overflow-y-auto border-l border-white/10 bg-[#0d1114] p-5 lg:block`}>
          <h2 className="mb-5 text-sm font-black uppercase text-[#ffc400]">
            {activePage === "solar"
              ? solarSelection === "hero"
                ? "Banner điện mặt trời"
                : solarSelection === "notice"
                  ? "Thông báo sản phẩm"
                  : content.pages.solar.groups[solarSelection].label
              : activePage === "camera"
                ? cameraSelection === "hero"
                  ? "Banner camera"
                  : cameraSelection === "notice"
                    ? "Thông báo sản phẩm"
                    : "Giới thiệu danh mục"
              : selection === "site"
                ? "Cài đặt chung"
                : selection === "hero"
                  ? "Banner trang chủ"
                  : selection === "images"
                    ? "Hình ảnh"
                    : sectionLabels[selection]}
          </h2>
          {inspector}
        </aside>
      </div>
    </div>
  );
}

function moveArrayItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return;
  [items[index], items[target]] = [items[target], items[index]];
}

function RepeatedItemsHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-white/15 pt-4 text-xs font-black uppercase text-[#ffc400]">
      {children}
    </p>
  );
}

function MoveButtons({
  label,
  index,
  count,
  onMove,
}: {
  label: string;
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <IconButton label={`Đưa ${label} lên`} onClick={() => onMove(-1)} disabled={index === 0}>
        <ArrowUp />
      </IconButton>
      <IconButton label={`Đưa ${label} xuống`} onClick={() => onMove(1)} disabled={index === count - 1}>
        <ArrowDown />
      </IconButton>
    </div>
  );
}

function StyleFields({
  style,
  onChange,
}: {
  style: { titleSize: "small" | "medium" | "large"; alignment: "left" | "center" | "right" };
  onChange: (key: "titleSize" | "alignment", value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="grid gap-2 text-sm font-semibold">
        Kích thước chữ
        <select value={style.titleSize} onChange={(event) => onChange("titleSize", event.target.value)} className="min-h-11 border border-white/20 bg-[#171c21] px-3">
          <option value="small">Nhỏ</option><option value="medium">Vừa</option><option value="large">Lớn</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Căn chữ
        <select value={style.alignment} onChange={(event) => onChange("alignment", event.target.value)} className="min-h-11 border border-white/20 bg-[#171c21] px-3">
          <option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option>
        </select>
      </label>
    </div>
  );
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`min-h-10 flex-1 px-3 text-left text-sm font-bold ${active ? "bg-[#ffc400] text-black" : "text-[#d7dbe0] hover:bg-white/10"}`}>{label}</button>;
}

function IconButton({ label, onClick, disabled, active, children }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className={`grid size-10 shrink-0 place-items-center border border-white/15 disabled:opacity-30 ${active ? "bg-[#ffc400] text-black" : "bg-[#171c21] text-white hover:border-[#ffc400]"}`}>
      <span className="[&>svg]:size-[17px]">{children}</span>
    </button>
  );
}
