import { Activity, useState } from "react";
import { useLocation } from "react-router";
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

function Search() {
  const { t } = useTranslation("search");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword");
  const [sortBy, setSortBy] = useState<string>(sortingOptions.relevance.value);

  const queryString = keyword ? `keyword=${encodeURIComponent(keyword)}` : "";
  const {
    data: searchResult,
    isLoading,
    isError,
    error,
  } = useQuery<SearchGoodsResponse>({
    queryKey: ["searchResult", { queryString }],
    queryFn: async () => {
      const res = await api.get(`/goods/search?${queryString}`);
      return res.data;
    },
  });

  console.log("searchResult:", searchResult);

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
      <div className="w-full max-w-290 px-8 mx-auto">
        <div className="font-oswald font-bold text-3xl mt-10 mb-6 pb-6 border-b-2 ">
          {t("searchResults")}
        </div>
        <div className="flex gap-6">
          {/* left part */}
          <Filter />
          {/* right part */}
          <div>
            <div className="font-oswald text-xl mb-6 gap-2 flex flex-col md:flex-row-reverse md:justify-end">
              <div>{keyword}</div>
              <div>
                {t("resultsCount", { count: searchResult?.total || 0 })}
              </div>
            </div>
            {searchResult && searchResult.total > 0 && (
              <div className="mb-6 flex flex-col gap-2">
                <label htmlFor="options">{t("sortBy")}</label>
                <select
                  id="options"
                  name="options"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                  }}
                  className="border-2 px-4 py-2 w-fit rounded-2xl outline-none"
                >
                  {Object.values(sortingOptions).map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-black mx-4 my-2"
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
          </div>
        </div>

        {searchResult?.total === 0 && (
          <div className="text-center text-3xl font-oswald mt-20">
            {t("noResultsFound")}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
