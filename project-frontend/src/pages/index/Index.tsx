import { Activity, useEffect, useState } from "react";
import { useTranslation } from "../../i18n/hooks";
import api from "../../services/api";
import type { AxiosError } from "axios";
import Header from "../../components/Header";
import LoadingPanel from "../../components/LoadingPanel";
import type { Good } from "../../interface/good";
import HorizontalContainer from "./HorizontalContainer";
import Banner from "./Banner";

// type IndexProps = {
//   isLoggedIn: boolean;
// };

//function Index({ isLoggedIn }: IndexProps) {
function Index() {
  const { t } = useTranslation("index");
  const [allGoods, setAllGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      }
    };

    fetchAllGoods();
  }, []);
  return (
    <div className="animate-fade-in min-h-screen">
      <title>Premium Ben Toys</title>
      <Header />
      <Activity mode={loading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
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
