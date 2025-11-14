import { Activity, useRef, useState } from "react";

import { auth } from "../../../firebase/firebase";
import api from "../../../services/api";
import { FaUpload } from "react-icons/fa";

function AddGoods() {
  // Form refs
  const nameRef = useRef<HTMLInputElement | null>(null);
  const preorderCloseDateRef = useRef<HTMLInputElement | null>(null);
  const shippingDateRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const stockRef = useRef<HTMLInputElement | null>(null);

  // File and image preview
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (selectedFile) {
      // Check if the file is an image
      if (!selectedFile.type.startsWith("image/")) {
        alert("Please select an image file (PNG, JPG, JPEG, GIF, WebP)");
        e.target.value = ""; // Clear the input
        return;
      }

      // Check file size (optional: limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = ""; // Clear the input
        return;
      }

      setFile(selectedFile);

      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    } else {
      setFile(null);
      setImagePreview(null);
    }
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
    <>
      <div className="flex flex-col">
        <label className="ml-2">Product Name:</label>
        <input
          ref={nameRef}
          type="text"
          placeholder="THE METAL ROBOT SPIRITS <SIDE MS> MIGHTY STRIKE FREEDOM GUNDAM FINAL BATTLE Ver."
          className="tw-input-field"
        />
      </div>
      <div className="flex flex-col">
        <label className="ml-2">Preorder Close Date:</label>
        <input
          ref={preorderCloseDateRef}
          type="date"
          className="tw-input-field cursor-pointer"
          onClick={() => {
            preorderCloseDateRef.current?.showPicker();
          }}
        />
      </div>
      <div className="flex flex-col">
        <label className="ml-2">Shipping Date:</label>
        <input
          ref={shippingDateRef}
          type="date"
          className="tw-input-field cursor-pointer"
          onClick={() => {
            shippingDateRef.current?.showPicker();
          }}
        />
      </div>
      <div className="flex flex-col">
        <label className="ml-2">Price:</label>
        <input
          ref={priceRef}
          type="number"
          step="0.01"
          min="0"
          placeholder="1580"
          className="tw-input-field"
        />
      </div>
      <div className="flex flex-col">
        <label className="ml-2">Stock:</label>
        <input
          ref={stockRef}
          type="number"
          min="0"
          placeholder="100"
          className="tw-input-field"
        />
      </div>
      <div className="flex gap-2">
        <div className="grow flex flex-col">
          <label className="ml-2">Description:</label>
          <textarea
            ref={descriptionRef}
            rows={4}
            placeholder="Product description..."
            className="tw-input-field resize-none "
          />
        </div>
        <div className="flex">
          <div className="flex flex-col w-30 space-y-2">
            <label className="ml-2">Image:</label>

            <label
              htmlFor="fileUpload"
              className="border rounded px-2 py-1 mx-2"
            >
              <FaUpload />
              Upload File
            </label>

            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Activity mode={imagePreview ? "visible" : "hidden"}>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setImagePreview(null);
                  // Clear the file input
                  const fileInput = document.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
                className="ml-2 text-red-500 hover:text-red-700 text-sm  border rounded px-2 py-1 mx-2"
              >
                Remove
              </button>
            </Activity>
          </div>
          <div className="mb-2 mr-2">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded border"
              />
            )}
          </div>
        </div>
      </div>
      <button onClick={handleUpload} className="mx-auto w-fit cursor-pointer">
        Upload
      </button>
    </>
  );
}

export default AddGoods;
