import { Activity } from "react";
import Header from "../../components/Header";
import LoadingPanel from "../../components/LoadingPanel";
import CustomerService from "../../components/CustomerService/CustomerService";
import BackToTopButton from "../../components/BackToTopButton";
import { useQuery } from "@tanstack/react-query";

function OrderHistory() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userOrders"],
    queryFn: async () => {},
  });

  return (
    <div className="animate-fade-in min-h-screen mb-20">
      <title>ORDERS | PREMIUM BEN TOYS</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
    </div>
  );
}

export default OrderHistory;
