import Header from "../../components/Header";
import ModuleWrapper from "../../components/ModuleWrapper";
import AddGoods from "./modules/AddGoods";
import { useTranslation } from "../../i18n/hooks";

function Admin() {
  const { t } = useTranslation("admin");

  return (
    <div className="animate-fade-in min-h-screen">
      <title>Admin</title>
      <Header />
      <div>
        <ModuleWrapper
          maxHeight={"max-h-195"}
          title={t("titles.addGoods")}
          component={<AddGoods />}
        />
      </div>
    </div>
  );
}

export default Admin;
