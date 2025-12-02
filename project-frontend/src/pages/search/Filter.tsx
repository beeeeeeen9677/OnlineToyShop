import { useState } from "react";
import { useTranslation } from "../../i18n/hooks";
import { categories } from "../../interface/good";
import type { PriceRange } from "./Search";
import FilterSection from "./FilterSection";
import FilterTag from "./FilterTag";
import { FaFilter } from "react-icons/fa";

// Sales status options
const salesStatusOptions = ["available", "preorderClosed"] as const;

interface FilterProps {
  selectedCategories: string[];
  selectedSalesStatus: string[];
  priceRange: PriceRange;
  onCategoryChange: (category: string) => void;
  onSalesStatusChange: (status: string) => void;
  onPriceRangeChange: (priceRange: PriceRange) => void;
  onRemoveFilter: (
    type: "category" | "salesStatus" | "price",
    value?: string
  ) => void;
  onClearAll: () => void;
}

function Filter({
  selectedCategories,
  selectedSalesStatus,
  priceRange,
  onCategoryChange,
  onSalesStatusChange,
  onPriceRangeChange,
  onRemoveFilter,
  onClearAll,
}: FilterProps) {
  const { t } = useTranslation("search");
  const { t: tGoods } = useTranslation("goods");

  // Local state for price inputs (before applying)
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");

  const handleApplyPriceRange = () => {
    const newPriceRange: PriceRange = {};
    if (minPriceInput) newPriceRange.min = Number(minPriceInput);
    if (maxPriceInput) newPriceRange.max = Number(maxPriceInput);
    onPriceRangeChange(newPriceRange);
  };

  // Check if any filters are selected
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSalesStatus.length > 0 ||
    priceRange.min !== undefined ||
    priceRange.max !== undefined;

  return (
    <div className="hidden md:block bg-orange-100 dark:bg-gray-500 w-65 shrink-0 h-fit px-4 py-6 space-y-4 sticky top-20 self-start rounded-md">
      <div className="font-oswald font-bold text-2xl flex items-center gap-2">
        <FaFilter />
        {t("filter")}
      </div>

      {/* Selected filters header with clear all */}
      <div className="flex justify-between items-center">
        <div className="font-oswald text-md">{t("selectedFilters")}</div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      {/* Selected filters tags */}
      <div className="flex flex-wrap gap-2">
        {selectedCategories.map((category) => (
          <FilterTag
            key={category}
            label={tGoods(`category.${category}`)}
            onRemove={() => onRemoveFilter("category", category)}
          />
        ))}
        {selectedSalesStatus.map((status) => (
          <FilterTag
            key={status}
            label={t(`salesStatus.${status}`)}
            onRemove={() => onRemoveFilter("salesStatus", status)}
          />
        ))}
        {(priceRange.min !== undefined || priceRange.max !== undefined) && (
          <FilterTag
            label={`$${priceRange.min ?? 0} - $${priceRange.max ?? "∞"}`}
            onRemove={() => onRemoveFilter("price")}
          />
        )}
      </div>

      {/* Filter sections */}
      <div className="space-y-2">
        {/* Sales Status */}
        <FilterSection title={t("filterSections.salesStatus")}>
          <div className="space-y-2">
            {salesStatusOptions.map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 cursor-pointer hover:bg-orange-200 dark:hover:bg-gray-400 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedSalesStatus.includes(status)}
                  onChange={() => onSalesStatusChange(status)}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm">{t(`salesStatus.${status}`)}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection
          title={t("filterSections.categories")}
          defaultOpen={false}
        >
          <div className="space-y-2 max-h-42 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer hover:bg-orange-200 dark:hover:bg-gray-400 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => onCategoryChange(category)}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm">
                  {tGoods(`category.${category}`)}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title={t("filterSections.priceRange")}
          defaultOpen={false}
        >
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder={t("priceRange.min")}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:border-gray-500"
                min="0"
              />
              <span>-</span>
              <input
                type="number"
                placeholder={t("priceRange.max")}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:border-gray-500"
                min="0"
              />
            </div>
            <button
              onClick={handleApplyPriceRange}
              className="w-full px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-hover transition-colors"
            >
              {t("priceRange.apply")}
            </button>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

export default Filter;
