import { Link } from "react-router";

function EditGoods() {
  return (
    <>
      <Link
        to="/admin/edit-goods"
        className="w-fit px-5 py-2 cursor-pointer border-2 rounded "
      >
        GO
      </Link>
    </>
  );
}

export default EditGoods;
