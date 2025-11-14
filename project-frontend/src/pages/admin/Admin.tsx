import Header from "../../components/Header";
import ModuleWrapper from "../../components/ModuleWrapper";
import AddGoods from "./modules/AddGoods";

function Admin() {
  return (
    <div className="animate-fade-in min-h-screen">
      <title>Admin</title>
      <Header />
      <div>
        <ModuleWrapper
          maxHeight={"max-h-195"}
          title="Add Goods"
          component={<AddGoods />}
        />
      </div>
    </div>
  );
}

export default Admin;
