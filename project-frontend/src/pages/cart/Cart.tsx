import React, { Activity } from "react";
import Header from "../../components/Header";
import CustomerService from "../../components/CustomerService/CustomerService";
import BackToTopButton from "../../components/BackToTopButton";
import LoadingPanel from "../../components/LoadingPanel";

function Cart() {
  const isLoading = false;
  return (
    <div className="animate-fade-in min-h-screen">
      <title>PREMIUM BEN TOYS</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
    </div>
  );
}

export default Cart;
