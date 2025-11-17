import { Link } from "react-router";

function EditGoods() {
  return (
    <>
      <Link
        to="/admin/product"
        className="px-5 py-2 cursor-pointer border-2 rounded text-center"
      >
        GO
      </Link>
    </>
  );
}

export default EditGoods;
