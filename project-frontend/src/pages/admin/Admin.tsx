import Header from "../../components/Header";
import ModuleWrapper from "../../components/ModuleWrapper";
import AddGoods from "./modules/AddGoods";
import { useTranslation } from "../../i18n/hooks";
import EditGoods from "./modules/EditGoods";
// import { useNavigate } from "react-router";
// import { useUserContext } from "../../context/app";
// import { useEffect } from "react";

function Admin() {
  const { t } = useTranslation("admin");
  // const navigate = useNavigate();
  // const user = useUserContext();

  // useEffect(() => {
  //   if (user === undefined || user.role !== "admin") {
  //     alert("Invalid User Access");
  //     navigate("/");
  //   }
  // }, [user]);

  return (
    <div className="animate-fade-in min-h-screen">
      <title>Admin</title>
      <Header />
      <div>
        <ModuleWrapper
          maxHeight={"max-h-170"}
          title={t("titles.addGoods")}
          component={<AddGoods />}
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

export default Admin;
