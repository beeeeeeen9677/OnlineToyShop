import {
  Activity,
  useEffect,
  useEffectEvent,
  useReducer,
  useState,
} from "react";
import { useLocation } from "react-router";
import { FaFilter } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "../../i18n/hooks";
import api from "../../services/api";
import type { AxiosError } from "axios";
import SearchBar from "../../components/SearchBar";
import LoadingPanel from "../../components/LoadingPanel";
import Header from "../../components/Header";
import BackToTopButton from "../../components/BackToTopButton";
import CustomerService from "../../components/CustomerService/CustomerService";
import SearchItem from "./SearchItem";
import type { Good } from "../../interface/good";
import Filter from "./Filter";
import { sortingOptions } from "./sortingOptions";

interface SearchGoodsResponse {
  results: Good[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PriceRange {
  min?: number;
  max?: number;
}

export interface FilterState {
  selectedCategories: string[];
  selectedSalesStatus: string[];
  priceRange: PriceRange;
}

// Action types for the reducer
type FilterAction =
  | { type: "TOGGLE_CATEGORY"; payload: string }
  | { type: "TOGGLE_SALES_STATUS"; payload: string }
  | { type: "SET_PRICE_RANGE"; payload: PriceRange }
  | {
      type: "REMOVE_FILTER";
      payload: {
        filterType: "category" | "salesStatus" | "price";
        value?: string;
      };
    }
  | { type: "CLEAR_ALL" }
  | { type: "INIT_FROM_URL"; payload: FilterState };

// Initial state
const initialFilterState: FilterState = {
  selectedCategories: [],
  selectedSalesStatus: [],
  priceRange: {},
};

// Helper function to parse URL params into FilterState
const parseFiltersFromURL = (searchParams: URLSearchParams): FilterState => {
  const categories = searchParams.getAll("category");
  const salesStatus = searchParams.getAll("salesStatus");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  return {
    selectedCategories: categories,
    selectedSalesStatus: salesStatus,
    priceRange: {
      ...(minPrice ? { min: Number(minPrice) } : {}),
      ...(maxPrice ? { max: Number(maxPrice) } : {}),
    },
  };
};

// Reducer function - all state logic in one place
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "INIT_FROM_URL":
      return action.payload;
    case "TOGGLE_CATEGORY":
      return {
        ...state,
        selectedCategories: state.selectedCategories.includes(action.payload)
          ? state.selectedCategories.filter((c) => c !== action.payload)
          : [...state.selectedCategories, action.payload],
      };
    case "TOGGLE_SALES_STATUS":
      return {
        ...state,
        selectedSalesStatus: state.selectedSalesStatus.includes(action.payload)
          ? state.selectedSalesStatus.filter((s) => s !== action.payload)
          : [...state.selectedSalesStatus, action.payload],
      };
    case "SET_PRICE_RANGE":
      return {
        ...state,
        priceRange: action.payload,
      };
    case "REMOVE_FILTER":
      if (action.payload.filterType === "category" && action.payload.value) {
        return {
          ...state,
          selectedCategories: state.selectedCategories.filter(
            (c) => c !== action.payload.value
          ),
        };
      } else if (
        action.payload.filterType === "salesStatus" &&
        action.payload.value
      ) {
        return {
          ...state,
          selectedSalesStatus: state.selectedSalesStatus.filter(
            (s) => s !== action.payload.value
          ),
        };
      } else if (action.payload.filterType === "price") {
        return {
          ...state,
          priceRange: {},
        };
      }
      return state;
    case "CLEAR_ALL":
      return initialFilterState;
    default:
      return state;
  }
}

function Search() {
  const { t } = useTranslation("search");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword");

  // Initialize sortBy from URL or default
  // If no keyword, default to "newest" instead of "relevance" (relevance requires keyword)
  const defaultSort = keyword
    ? sortingOptions.relevance.value
    : sortingOptions.newest.value;
  const initialSort = queryParams.get("sort") || defaultSort;
  const [sortBy, setSortBy] = useState<string>(initialSort);

  // Initialize page from URL or default to 1
  const initialPage = Number(queryParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Mobile filter overlay state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Initialize filter state from URL params
  const [filterState, dispatch] = useReducer(
    filterReducer,
    //initialFilterState,
    null,
    () => parseFiltersFromURL(queryParams) //lazy initializer
  );
  const { selectedCategories, selectedSalesStatus, priceRange } = filterState;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Build query string with filters (for API call and URL sync)
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (keyword && keyword.trim() !== "") params.append("keyword", keyword);
    // Don't send relevance sort if no keyword
    const effectiveSort =
      sortBy === "relevance" && !keyword ? sortingOptions.newest.value : sortBy;
    params.append("sort", effectiveSort);

    if (selectedCategories.length > 0) {
      selectedCategories.forEach((cat) => params.append("category", cat));
    }
    if (selectedSalesStatus.length > 0) {
      selectedSalesStatus.forEach((status) =>
        params.append("salesStatus", status)
      );
    }
    if (priceRange.min !== undefined)
      params.append("minPrice", String(priceRange.min));
    if (priceRange.max !== undefined)
      params.append("maxPrice", String(priceRange.max));
    if (currentPage > 1) params.append("page", String(currentPage));
    return params.toString();
  };

  const buildQueryStringEvent = useEffectEvent(() => {
    return buildQueryString();
  });

  // Sync filter state to URL when it changes (using replaceState to avoid re-render)
  useEffect(() => {
    const newSearch = buildQueryStringEvent();
    const newUrl = newSearch ? `?${newSearch}` : location.pathname;
    if (location.search !== `?${newSearch}`) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [
    keyword,
    sortBy,
    currentPage,
    selectedCategories,
    selectedSalesStatus,
    priceRange,
  ]);

  const queryString = buildQueryString();
  //console.log("Query String:", queryString);

  const {
    data: searchResult,
    isLoading,
    isError,
    error,
  } = useQuery<SearchGoodsResponse>({
    queryKey: [
      "searchResult",
      {
        keyword,
        sortBy,
        currentPage,
        selectedCategories,
        selectedSalesStatus,
        priceRange,
      },
    ],
    queryFn: async () => {
      const res = await api.get(`/goods/search?${queryString}`);
      //console.log("API Call: /goods/search?", queryString);
      return res.data;
    },
    staleTime: 30 * 1000, // 30s
  });

  // Dispatch wrapper functions for cleaner API to Filter component
  const handleCategoryChange = (category: string) => {
    dispatch({ type: "TOGGLE_CATEGORY", payload: category });
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleSalesStatusChange = (status: string) => {
    dispatch({ type: "TOGGLE_SALES_STATUS", payload: status });
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handlePriceRangeChange = (newPriceRange: PriceRange) => {
    dispatch({ type: "SET_PRICE_RANGE", payload: newPriceRange });
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleRemoveFilter = (
    filterType: "category" | "salesStatus" | "price",
    value?: string
  ) => {
    dispatch({ type: "REMOVE_FILTER", payload: { filterType, value } });
  };

  const handleClearAllFilters = () => {
    dispatch({ type: "CLEAR_ALL" });
    setCurrentPage(1); // Reset to page 1 when clearing filters
  };

  //console.log("searchResult:", searchResult);

  if (isError) {
    return (
      <div>
        Error:{" "}
        {(error as AxiosError<{ error: string }>)?.response?.data?.error ||
          "Unknown error"}
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <title>{`Search results for ${keyword} | PREMIUM BEN TOYS`}</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
      <SearchBar />
      <div className="w-full max-w-290 px-8 mx-auto mb-20">
        <div className="font-oswald font-bold text-3xl mt-10 mb-6 pb-6 border-b-2 ">
          {t("searchResults")}
        </div>
        <div className="flex gap-6 ">
          {/* left part */}
          <Filter
            selectedCategories={selectedCategories}
            selectedSalesStatus={selectedSalesStatus}
            priceRange={priceRange}
            onCategoryChange={handleCategoryChange}
            onSalesStatusChange={handleSalesStatusChange}
            onPriceRangeChange={handlePriceRangeChange}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
          />
          {/* right part */}
          <div className="flex-1">
            <div className="flex justify-between items-center w-full">
              <div className="font-oswald mb-6 gap-2 flex flex-col md:flex-row-reverse md:justify-end md:items-end">
                <span className="text-2xl ">{keyword}</span>
                <span className="text-xl ">
                  {t("resultsCount", { count: searchResult?.total || 0 })}
                </span>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden border-2 h-fit px-6 py-2 rounded-2xl mb-6 font-oswald font-medium text-xl cursor-pointer flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition duration-300"
              >
                <FaFilter />
                {t("filter")}
              </button>
            </div>

            {/* sorting options */}
            {searchResult && searchResult.total > 0 && (
              <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="options">{t("sortBy")}</label>
                <select
                  id="options"
                  name="options"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                  }}
                  className="border-2 px-4 py-2 w-fit rounded-2xl outline-none"
                >
                  {Object.values(sortingOptions).map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-black"
                    >
                      {t(`${option.translateKey}`)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* search results */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResult &&
                searchResult.results.length > 0 &&
                searchResult.total > 0 &&
                searchResult.results.map((good) => (
                  <SearchItem key={good._id} itemDetails={good} />
                ))}
            </div>
            {searchResult?.total === 0 && (
              <div className="text-center text-3xl font-oswald mt-40">
                {t("noResultsFound")}
              </div>
            )}

            {/* Pagination */}
            {searchResult && searchResult.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {/* Previous button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="tw-page-arrow-btn"
                >
                  &lt;
                </button>

                {/* Page numbers */}
                {Array.from(
                  { length: searchResult.totalPages },
                  (_, i) => i + 1
                )
                  .filter((page) => {
                    // Show first, last, current, and neighbors
                    return (
                      page === 1 ||
                      page === searchResult.totalPages ||
                      Math.abs(page - currentPage) <= 1 // Show current ± 1 neighbor
                    );
                  })
                  .map((page, index, array) => (
                    <span key={page} className="flex items-center">
                      {/* Show ellipsis if there's a gap */}
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-oswald transition duration-300 ${
                          currentPage === page
                            ? "bg-primary text-white"
                            : "border-2 hover:text-primary cursor-pointer"
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}

                {/* Next button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, searchResult.totalPages)
                    )
                  }
                  disabled={currentPage === searchResult.totalPages}
                  className="tw-page-arrow-btn"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
