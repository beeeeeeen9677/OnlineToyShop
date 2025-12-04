import { Link, useParams } from "react-router";
// import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import api from "../../../services/api";

import LoadingPanel from "../../../components/LoadingPanel";
import type { Good } from "../../../interface/good";
import type { AxiosError } from "axios";
import ProductForm from "../modules/ProductForm";
import { useTranslation } from "../../../i18n/hooks";
import { useUserContext } from "../../../context/app";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

function AdminEditProduct() {
  const user = useUserContext();

  const { t } = useTranslation("admin");
  const { id } = useParams();
  //const [product, setProduct] = useState<Good | null>(null);
  //const [isLoading, setIsLoading] = useState(true);
  /*
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/goods/${id}`);
        setProduct(response.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ error: string }>;
        console.error(
          "Error fetching product data:",
          axiosError.response?.data?.error
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);
  */

  const queryClient = useQueryClient();
  const {
    data: product = null,
    isLoading,
    isError,
    error,
  } = useQuery<Good, AxiosError>({
    queryKey: ["good", { id }],
    queryFn: async () => {
      const res = await api.get(`/goods/${id}`);
      return res.data;
    },
  });

  const { mutateAsync: setProductMutation, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const path = `admin/goods/${product?._id}`;
      const res = await api.put(path, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["good", { id }] });
    },
  });

  // Callback to update product state directly
  const handleProductUpdate = (updatedProduct: Good) => {
    //setProduct(updatedProduct);
    alert(t("messages.updateSuccess") + `:\n${updatedProduct.name}`);
  };

  useEffect(() => {
    document.title = `Edit: ${product?.name || ""} | PREMIUM BEN TOYS`;
  }, [product?.name]);

  if (user === undefined || user.role !== "admin") {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-100">
          <div className="text-5xl text">Restricted Access</div>
        </div>
      </>
    );
  }

  if (isError)
    return (
      <p>
        Error: {(error as AxiosError<{ error: string }>)?.response?.data?.error}
      </p>
    );
  if (isLoading) return <LoadingPanel />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="animate-fade-in min-h-screen">
      {isPending && <LoadingPanel />}
      <Header />
      {/* Back Btn */}
      <Link to="/admin/product">
        <div className="mx-6 mt-3 underline text-2xl"> &lt;Back</div>
      </Link>
      <div className="border-2 border-primary dark:border-white dark:bg-zinc-600 rounded-lg p-4 m-4 relative flex flex-col gap-4 h-fit">
        <div className="text-4xl mx-auto underline">UPDATE</div>
        <div className="p-2 text-3xl">ID: {product._id}</div>
        <div className="p-2 text-2xl">
          {t("labels.createdAt")} {product.createdAt.split("T")[0]}
        </div>
        <div>
          <span className="p-2 text-lg">
            {t("labels.broughtCount")} {product.broughtCount}
          </span>
          <span className="p-2 text-lg">
            {t("labels.viewedCount")} {product.viewedCount}
          </span>
        </div>

        <ProductForm
          product={product}
          mutationFn={setProductMutation}
          onSuccessCB={handleProductUpdate}
        />
      </div>
    </div>
  );
}

export default AdminEditProduct;
