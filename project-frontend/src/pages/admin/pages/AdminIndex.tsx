import Header from "../../../components/Header";
import ModuleWrapper from "../../../components/ModuleWrapper";
import ProductForm from "../modules/ProductForm";
import { useTranslation } from "../../../i18n/hooks";
import EditGoods from "../modules/EditGoods";
// import { useNavigate } from "react-router";
import { useUserContext } from "../../../context/app";
// import { useEffect } from "react";

function AdminIndex() {
  const { t } = useTranslation("admin");
  // const navigate = useNavigate();
  const user = useUserContext();

  // useEffect(() => {
  //   if (user === undefined || user.role !== "admin") {
  //     alert("Invalid User Access");
  //     navigate("/");
  //   }
  // }, [user]);

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

  return (
    <div className="animate-fade-in min-h-screen">
      <title>ADMIN | PREMIUM BEN TOYS</title>
      <Header />
      <div>
        <ModuleWrapper
          maxHeight={"max-h-170"}
          title={t("titles.addGoods")}
          component={<ProductForm />}
        />
        <ModuleWrapper
          maxHeight={"max-h-30"}
          title={t("titles.editGoods")}
          component={<EditGoods />}
        />
      </div>
    </div>
  );
}

export default AdminIndex;
