import React, { Activity } from "react";
import Header from "../../components/Header";
import CustomerService from "../../components/CustomerService/CustomerService";
import BackToTopButton from "../../components/BackToTopButton";
import LoadingPanel from "../../components/LoadingPanel";
import SearchBar from "../../components/SearchBar";

function Cart() {
  const isLoading = false;
  return (
    <div className="animate-fade-in min-h-screen">
      <title>Cart</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
      <SearchBar />
    </div>
  );
}

export default Cart;
