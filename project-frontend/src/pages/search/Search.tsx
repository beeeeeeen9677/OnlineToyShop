import { useLocation } from "react-router";
import SearchBar from "../../components/SearchBar";
import BackToTopButton from "../../components/BackToTopButton";
import CustomerService from "../../components/CustomerService/CustomerService";
import { Activity } from "react";
import LoadingPanel from "../../components/LoadingPanel";
import Header from "../../components/Header";

function Search() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");
  return (
    <div className="animate-fade-in min-h-screen">
      <title>PREMIUM BEN TOYS</title>
      <Header />
      {/* <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity> */}
      <CustomerService />
      <BackToTopButton />
      <SearchBar />
    </div>
  );
}

export default Search;
