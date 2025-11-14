import { Activity, useRef, useState } from "react";

import api from "../../../services/api";
import { FaUpload } from "react-icons/fa";
import { useTranslation } from "../../../i18n/hooks";

function AddGoods() {
  const { t } = useTranslation("admin");

  // Form refs
  const nameRef = useRef<HTMLInputElement | null>(null);
  const preorderCloseDateRef = useRef<HTMLInputElement | null>(null);
  const shippingDateRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  //const stockRef = useRef<HTMLInputElement | null>(null);

  // File and image preview
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (selectedFile) {
      // Check if the file is an image
      if (!selectedFile.type.startsWith("image/")) {
        alert(t("messages.imageFileOnly"));
        e.target.value = ""; // Clear the input
        return;
      }

      // Check file size (optional: limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert(t("messages.fileSizeLimit"));
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

  // Form validation and error state
  const [showError, setShowError] = useState(false);

  const clearForm = () => {
    // Clear all input refs
    if (nameRef.current) nameRef.current.value = "";
    if (preorderCloseDateRef.current) preorderCloseDateRef.current.value = "";
    if (shippingDateRef.current) shippingDateRef.current.value = "";
    if (priceRef.current) priceRef.current.value = "";
    if (descriptionRef.current) descriptionRef.current.value = "";

    // Clear file and preview
    setFile(null);
    setImagePreview(null);

    // Clear file input
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Hide error message
    setShowError(false);
  };

  const handleUpload = async () => {
    // Validate all fields
    const name = nameRef.current?.value.trim();
    const preorderCloseDate = preorderCloseDateRef.current?.value;
    const shippingDate = shippingDateRef.current?.value;
    const price = priceRef.current?.value;
    //const stock = stockRef.current?.value;
    const description = descriptionRef.current?.value.trim();

    // Check if any field is empty or null
    if (
      !name ||
      !preorderCloseDate ||
      !shippingDate ||
      !price ||
      //!stock ||
      !description ||
      !file
    ) {
      setShowError(true);
      return;
    }

    // Hide error if all fields are valid
    setShowError(false);

    const requestBody = {
      name,
      preorderCloseDate,
      shippingDate,
      price: parseInt(price),
      //stock: parseInt(stock),
      description,
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(requestBody));

    try {
      const response = await api.post("admin/goods", formData);
      console.log("Upload success:", response.data);

      // Show success alert and clear form
      alert(t("messages.uploadSuccess"));
      clearForm();
    } catch (error) {
      console.error("Upload failed:", error);
      alert(t("messages.uploadFailed"));
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <label className="ml-2">{t("labels.productName")}</label>
        <input
          ref={nameRef}
          type="text"
          placeholder={t("placeholders.productName")}
          className="tw-input-field"
        />
      </div>
      <div className="flex flex-col">
        <label className="ml-2">{t("labels.preorderCloseDate")}</label>
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
        <label className="ml-2">{t("labels.shippingDate")}</label>
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
        <label className="ml-2">{t("labels.price")}</label>
        <input
          ref={priceRef}
          type="number"
          step="0.01"
          min="0"
          placeholder={t("currency.hkd", { ns: "common" })}
          className="tw-input-field"
        />
      </div>

      {/* <div className="flex flex-col">
        <label className="ml-2">Stock:</label>
        <input
          ref={stockRef}
          type="number"
          min="0"
          placeholder="100"
          className="tw-input-field"
        />
      </div> */}
      <div className="flex gap-2">
        <div className="grow flex flex-col">
          <label className="ml-2">{t("labels.description")}</label>
          <textarea
            ref={descriptionRef}
            rows={4}
            placeholder={t("placeholders.productDescription")}
            className="tw-input-field resize-none "
          />
        </div>
        <div className="flex">
          <div className="flex flex-col w-30 space-y-2">
            <label className="ml-2">{t("labels.image")}</label>

            <label
              htmlFor="fileUpload"
              className="border rounded px-2 py-1 mx-2"
            >
              <FaUpload />
              {t("buttons.uploadFile")}
            </label>

            <input
              ref={fileInputRef}
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
                {t("buttons.remove")}
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

      <div
        className={`absolute text-red-500 bottom-4 left-6 animate-shake ${
          showError ? "block" : "hidden"
        }`}
      >
        {t("messages.invalidField")}
      </div>
      <button
        onClick={handleUpload}
        className="w-fit mx-auto cursor-pointer border rounded-xl py-1 px-2 "
      >
        {t("buttons.upload")}
      </button>
    </>
  );
}

export default AddGoods;
