import Header from "../../components/Header";
import AddGoods from "./modules/AddGoods";

function Admin() {
  return (
    <div className="animate-fade-in min-h-screen">
      <title>Admin</title>
      <Header />
      <div>
        <AddGoods />
      </div>
    </div>
  );
}

export default Admin;
