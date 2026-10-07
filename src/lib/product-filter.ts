import type { Product, ProductFilters } from "@/types/content";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLocaleLowerCase("vi")
    .trim();
}

export function filterProducts(items: Product[], filters: ProductFilters) {
  const query = normalize(filters.query);

  return items
    .filter((product) => {
      const matchesQuery = !query || normalize(product.name).includes(query);
      const matchesCategory =
        filters.category === "all" || product.categorySlug === filters.category;
      const matchesBrand = filters.brand === "all" || product.brand === filters.brand;
      const matchesSolarGroup =
        filters.solarGroup === "all" ||
        product.solarDetails?.group === filters.solarGroup;
      const matchesComputingGroup =
        filters.computingGroup === "all" ||
        product.computingDetails?.group === filters.computingGroup;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesBrand &&
        matchesSolarGroup &&
        matchesComputingGroup
      );
    })
    .toSorted((left, right) => {
      const comparison = left.name.localeCompare(right.name, "vi");
      return filters.sort === "name-desc" ? -comparison : comparison;
    });
}
