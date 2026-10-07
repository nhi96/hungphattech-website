"use client";

import {
  BatteryCharging,
  Laptop,
  Monitor,
  PanelsTopLeft,
  Printer,
  RotateCcw,
  Search,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { categories } from "@/data/categories";
import { solarProductGroupLabels } from "@/data/solar-product-groups";
import type {
  SiteContent,
  SolarPageContent,
} from "@/lib/content/content-schema";
import { filterProducts } from "@/lib/product-filter";
import type {
  ComputingProductGroup,
  Product,
  ProductFilters,
  SolarProductGroup,
} from "@/types/content";
import { ProductCard } from "./product-card";

const defaults: ProductFilters = {
  query: "",
  category: "all",
  brand: "all",
  solarGroup: "all",
  computingGroup: "all",
  sort: "name-asc",
};

type ProductGroupButton<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

const computingGroupButtons: ProductGroupButton<ComputingProductGroup>[] = [
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "desktop", label: "Máy tính để bàn", icon: Monitor },
  { id: "printer", label: "Máy in", icon: Printer },
];

const solarGroupIcons: Record<SolarProductGroup, LucideIcon> = {
  panel: PanelsTopLeft,
  inverter: Zap,
  battery: BatteryCharging,
};

function ProductGroupButtons<T extends string>({
  ariaLabel,
  activeGroup,
  buttons,
  onSelect,
}: {
  ariaLabel: string;
  activeGroup: T;
  buttons: ProductGroupButton<T>[];
  onSelect: (group: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="mb-6 grid grid-cols-1 gap-1.5 bg-[#0b0f12] p-1.5 sm:grid-cols-3"
    >
      {buttons.map(({ id, label, icon: Icon }) => {
        const selected = activeGroup === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(id)}
            className={`flex min-h-14 items-center justify-center gap-3 px-4 py-3 text-center text-sm font-extrabold transition-colors sm:min-h-[72px] ${
              selected
                ? "bg-[#ffc400] text-[#0b0f12]"
                : "bg-white text-[#37404a] hover:bg-[#fff2bd] hover:text-[#0b0f12]"
            } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc400]`}
          >
            <Icon size={22} strokeWidth={2.25} aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProductExplorer({
  items,
  initialCategory = "all",
  fixedCategory = false,
  showSolarGroups = false,
  showComputingGroups = false,
  solarContent,
  assets,
  initialSolarGroup = "panel",
  initialComputingGroup = "laptop",
}: {
  items: Product[];
  initialCategory?: ProductFilters["category"];
  fixedCategory?: boolean;
  showSolarGroups?: boolean;
  showComputingGroups?: boolean;
  solarContent?: SolarPageContent;
  assets?: SiteContent["assets"];
  initialSolarGroup?: SolarProductGroup;
  initialComputingGroup?: ComputingProductGroup;
}) {
  const [filters, setFilters] = useState<ProductFilters>({
    ...defaults,
    category: initialCategory,
    solarGroup: showSolarGroups ? initialSolarGroup : "all",
    computingGroup: showComputingGroups ? initialComputingGroup : "all",
  });
  const itemsInActiveGroup = useMemo(() => {
    if (filters.solarGroup !== "all") {
      return items.filter(
        (product) => product.solarDetails?.group === filters.solarGroup,
      );
    }
    if (filters.computingGroup !== "all") {
      return items.filter(
        (product) => product.computingDetails?.group === filters.computingGroup,
      );
    }
    return items;
  }, [filters.computingGroup, filters.solarGroup, items]);
  const brands = useMemo(
    () =>
      Array.from(new Set(itemsInActiveGroup.map((product) => product.brand))).sort((a, b) =>
        a.localeCompare(b, "vi"),
      ),
    [itemsInActiveGroup],
  );
  const filtered = useMemo(() => filterProducts(items, filters), [items, filters]);
  const activeSolarGroup =
    filters.solarGroup === "all" ? initialSolarGroup : filters.solarGroup;
  const activeSolarContent = solarContent?.groups[activeSolarGroup];
  const activeSolarAsset = activeSolarContent && assets
    ? assets[activeSolarContent.image.assetId]
    : null;
  const solarGroupButtons: ProductGroupButton<SolarProductGroup>[] = (
    ["panel", "inverter", "battery"] as const
  ).map((group) => ({
    id: group,
    label: solarContent?.groups[group].label ?? solarProductGroupLabels[group],
    icon: solarGroupIcons[group],
  }));
  const activeComputingGroup =
    filters.computingGroup === "all"
      ? initialComputingGroup
      : filters.computingGroup;

  const update = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const resetFilters = () =>
    setFilters((current) => ({
      ...defaults,
      category: initialCategory,
      solarGroup: showSolarGroups ? current.solarGroup : "all",
      computingGroup: showComputingGroups ? current.computingGroup : "all",
    }));
  const selectSolarGroup = (solarGroup: SolarProductGroup) => {
    setFilters((current) => ({
      ...current,
      query: "",
      brand: "all",
      solarGroup,
    }));
  };
  const selectComputingGroup = (computingGroup: ComputingProductGroup) => {
    setFilters((current) => ({
      ...current,
      query: "",
      brand: "all",
      computingGroup,
    }));
  };

  const inputClass =
    "min-h-12 w-full border border-[#cdd1d5] bg-white px-4 text-[#0b0f12] focus:border-[#0b0f12] focus:outline-none";

  return (
    <>
      {showSolarGroups ? (
        <ProductGroupButtons
          ariaLabel="Nhóm sản phẩm điện mặt trời"
          activeGroup={activeSolarGroup}
          buttons={solarGroupButtons}
          onSelect={selectSolarGroup}
        />
      ) : null}
      {showComputingGroups ? (
        <ProductGroupButtons
          ariaLabel="Nhóm sản phẩm Laptop và PC"
          activeGroup={activeComputingGroup}
          buttons={computingGroupButtons}
          onSelect={selectComputingGroup}
        />
      ) : null}
      {activeSolarContent && activeSolarAsset ? (
        <section
          data-testid="solar-group-introduction"
          className="mb-6 grid overflow-hidden border border-[#d9dde0] bg-white lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div className="relative aspect-[4/3] bg-[#171c21] lg:aspect-auto lg:min-h-72">
            <Image
              src={activeSolarAsset.path}
              alt={activeSolarContent.alt}
              fill
              className="object-cover"
              style={{
                objectPosition: `${activeSolarContent.image.focalX} ${activeSolarContent.image.focalY}`,
              }}
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="p-6 md:p-8">
            <p className="eyebrow">{activeSolarContent.label}</p>
            <h2 className="mt-4 text-3xl font-black text-[#0b0f12]">
              {activeSolarContent.title}
            </h2>
            <p className="mt-4 leading-7 text-[#59616a]">
              {activeSolarContent.description}
            </p>
          </div>
        </section>
      ) : null}
      <div
        className={`grid gap-3 border border-[#d9dde0] bg-[#eceeeb] p-4 ${
          fixedCategory
            ? "md:grid-cols-[1.6fr_1fr_1fr]"
            : "md:grid-cols-[1.6fr_1fr_1fr_1fr]"
        }`}
      >
        <label className="relative">
          <span className="sr-only">Tìm theo tên sản phẩm</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#697079]"
            size={18}
            aria-hidden
          />
          <input
            className={`${inputClass} pl-11`}
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            placeholder="Tìm theo tên sản phẩm"
            aria-label="Tìm theo tên sản phẩm"
          />
        </label>
        {!fixedCategory ? (
          <label>
            <span className="sr-only">Lọc theo danh mục</span>
            <select
              className={inputClass}
              value={filters.category}
              onChange={(event) =>
                update("category", event.target.value as ProductFilters["category"])
              }
              aria-label="Lọc theo danh mục"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          <span className="sr-only">Lọc theo thương hiệu</span>
          <select
            className={inputClass}
            value={filters.brand}
            onChange={(event) => update("brand", event.target.value)}
            aria-label="Lọc theo thương hiệu"
          >
            <option value="all">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sắp xếp theo tên</span>
          <select
            className={inputClass}
            value={filters.sort}
            onChange={(event) => update("sort", event.target.value as ProductFilters["sort"])}
            aria-label="Sắp xếp theo tên"
          >
            <option value="name-asc">Tên A–Z</option>
            <option value="name-desc">Tên Z–A</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[#59616a]">{filtered.length} sản phẩm</p>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0b0f12] hover:text-[#8b6b00]"
        >
          <RotateCcw size={16} aria-hidden />
          Đặt lại bộ lọc
        </button>
      </div>
      {filtered.length ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-7 border border-dashed border-[#aeb4ba] bg-white px-6 py-16 text-center">
          <h2 className="text-2xl font-extrabold text-[#0b0f12]">Không tìm thấy sản phẩm phù hợp</h2>
          <p className="mt-3 text-[#59616a]">Hãy thay đổi từ khóa hoặc xóa các bộ lọc đang chọn.</p>
          <button type="button" onClick={resetFilters} className="button-dark mt-6">
            Xóa bộ lọc
          </button>
        </div>
      )}
    </>
  );
}
