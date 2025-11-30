import { Activity } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import type { AxiosError } from "axios";
import SearchBar from "../../components/SearchBar";
import LoadingPanel from "../../components/LoadingPanel";
import Header from "../../components/Header";
import BackToTopButton from "../../components/BackToTopButton";
import CustomerService from "../../components/CustomerService/CustomerService";
import type { Good } from "../../interface/good";
import ItemCard from "../../components/ItemCard";

interface SearchGoodsResponse {
  results: Good[];
  total: number;
  page: number;
  totalPages: number;
}

function Search() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword");

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

  return (
    <div className="animate-fade-in min-h-screen">
      <title>{keyword}</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      {isError && (
        <div>
          Error:{" "}
          {(error as AxiosError<{ error: string }>)?.response?.data?.error ||
            "Unknown error"}
        </div>
      )}
      <CustomerService />
      <BackToTopButton />
      <SearchBar />
      {/* search results */}
      <div>
        {searchResult &&
          searchResult.results.length > 0 &&
          searchResult.total > 0 &&
          searchResult.results.map((good) => (
            <ItemCard key={good._id} itemDetails={good} />
          ))}
      </div>
    </div>
  );
}

export default Search;
