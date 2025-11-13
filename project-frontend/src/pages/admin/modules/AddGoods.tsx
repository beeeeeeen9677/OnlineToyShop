import { useState } from "react";

import { auth } from "../../../firebase/firebase";
import api from "../../../services/api";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function AddGoods() {
  // Control Module
  const [isOpen, setIsOpen] = useState(false);

  // File
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file); // 'file' is the key expected by your API

    const idToken = auth.currentUser?.getIdToken();

    if (!idToken) return;

    try {
      const response = await api.post("admin/goods", formData);
      console.log("Upload success:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div
      className={`bg-yellow-100 dark:bg-zinc-600 rounded-lg p-4 m-4 relative flex flex-col gap-4 overflow-y-hidden ${
        isOpen ? "h-auto" : "h-16"
      } transition-[height] duration-1000 ease-in-out`}
    >
      <button
        className="absolute right-10 cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      <div className="font-black text-3xl">Add New Goods</div>
      {/* Form */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
}

export default AddGoods;
