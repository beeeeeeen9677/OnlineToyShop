import { useParams } from "react-router";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../services/api";

import LoadingPanel from "../../components/LoadingPanel";
import type { Good } from "../../interface/good";
import type { AxiosError } from "axios";

function AdminEditProduct() {
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

  if (loading) return <LoadingPanel />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="animate-fade-in min-h-screen">
      <title>Edit Product</title>
      <Header />
      {/* Your edit form */}
    </div>
  );
}

export default AdminEditProduct;
