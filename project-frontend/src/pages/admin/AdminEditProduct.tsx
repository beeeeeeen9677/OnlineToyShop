import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../services/api";

import LoadingPanel from "../../components/LoadingPanel";
import type { Good } from "../../interface/good";
import type { AxiosError } from "axios";
import ProductForm from "./modules/ProductForm";
import { useTranslation } from "../../i18n/hooks";
import { useUserContext } from "../../context/app";

function AdminEditProduct() {
  const user = useUserContext();

  const { t } = useTranslation("admin");
  const { id } = useParams();
  const [product, setProduct] = useState<Good | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Callback to update product state directly
  const handleProductUpdate = (updatedProduct: Good) => {
    setProduct(updatedProduct);
    alert(t("messages.updateSuccess"));
  };

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

  if (loading) return <LoadingPanel />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="animate-fade-in min-h-screen">
      <title>Edit Product</title>
      <Header />
      <Link to="/admin/edit">
        <div className="mx-6 mt-3 underline text-2xl"> &lt;Back</div>
      </Link>
      <div className="bg-yellow-100 dark:bg-zinc-600 rounded-lg p-4 m-4 relative flex flex-col gap-4 h-fit">
        <div className="text-4xl mx-auto underline">UPDATE</div>
        <div className="p-2 text-3xl">ID: {product._id}</div>
        <ProductForm product={product} onSuccessCB={handleProductUpdate} />
      </div>
    </div>
  );
}

export default AdminEditProduct;
