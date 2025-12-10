import { Activity } from "react";
import { useTranslation } from "../../i18n/hooks";
import api from "../../services/api";
import type { AxiosError } from "axios";
import Header from "../../components/Header";
import LoadingPanel from "../../components/LoadingPanel";
import type { Good } from "../../interface/good";
import HorizontalContainer from "./HorizontalContainer";
import Banner from "./Banner";
import { useQuery } from "@tanstack/react-query";
import BackToTopButton from "../../components/BackToTopButton";
import CustomerService from "../../components/CustomerService/CustomerService";
import SearchBar from "../../components/SearchBar";

// type IndexProps = {
//   isLoggedIn: boolean;
// };

//function Index({ isLoggedIn }: IndexProps) {
function Index() {
  const { t } = useTranslation("index");
  /*
  const [allGoods, setAllGoods] = useState<Good[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchAllGoods = async () => {
      try {
        const response = await api.get("/goods/");
        setAllGoods(response.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ error: string }>;
        console.error(
          "Error fetching all goods data:",
          axiosError.response?.data?.error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllGoods();
  }, []);
  */

  const {
    data: allGoods = [],
    isLoading,
    isError,
    error,
  } = useQuery<Good[], AxiosError>({
    queryKey: ["allGoods"],
    queryFn: async () => {
      const response = await api.get("/goods/");
      return response.data.filter((good: Good) => good.available);
    },
  });

  if (!allGoods && isLoading) {
    return <LoadingPanel />;
  }

  if (isError) {
    return (
      <div>
        Error: {(error as AxiosError<{ error: string }>)?.response?.data?.error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen mb-20">
      <title>PREMIUM BEN TOYS</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
      <SearchBar />
      <Banner goods={allGoods} />
      {/* New Arriavals */}
      <HorizontalContainer
        title={t("title.newArrivals")}
        subtitle={t("title.viewAll")}
        goods={allGoods}
        sortingKey="createdAt"
      />
      <HorizontalContainer
        title={t("title.closingSoon")}
        subtitle={t("title.viewAll")}
        goods={allGoods}
        sortingKey="preorderCloseDate"
        titleColor="text-red-500"
      />
    </div>
  );
}

export default Index;
