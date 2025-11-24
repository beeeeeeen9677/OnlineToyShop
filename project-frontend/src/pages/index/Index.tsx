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
      return response.data;
    },
  });

  if (isError) {
    return (
      <div>
        Error: {(error as AxiosError<{ error: string }>)?.response?.data?.error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <title>PREMIUM BEN TOYS</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <BackToTopButton />
      <Banner goods={allGoods} />
      {/* New Arriavals */}
      <HorizontalContainer
        title={t("title.newArrivals")}
        goods={allGoods}
        sortingKey="createdAt"
      />
      Closing Soon
      {/* Closing Soon */}
    </div>
  );
}

export default Index;
