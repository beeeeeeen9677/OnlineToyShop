import { Activity, useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import { FaUpload } from "react-icons/fa";
import { useTranslation } from "../../../i18n/hooks";
import { categories, type Category, type Good } from "../../../interface/good";
import LoadingPanel from "../../../components/LoadingPanel";

type MutationResult<T> = { message: string; result: T };
type ProductFormProps = {
  product?: Good;
  mutationFn?: (formData: FormData) => Promise<MutationResult<Good>>;
  onSuccessCB?: (updatedProduct: Good) => void;
};

function ProductForm({ product, mutationFn, onSuccessCB }: ProductFormProps) {
  const { t } = useTranslation("admin");

  // Mode: add or edit
  const mode = product ? "edit" : "add";
  const [isLoading, setIsLoading] = useState(false);

  // Form refs
  const nameRef = useRef<HTMLInputElement | null>(null);
  const preorderCloseDateRef = useRef<HTMLInputElement | null>(null);
  const shippingDateRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Description language states
  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [descriptionZh, setDescriptionZh] = useState<string>("");
  const [descriptionLang, setDescriptionLang] = useState<"en" | "zh">("en");
  const [quota, setQuota] = useState<number>(0);
  const [available, setAvailable] = useState<boolean>(true); // for edit mode only

  // File and image preview
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Category selection state
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle category selection
  const handleCategoryChange = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Form validation and error state
  const [showError, setShowError] = useState(false);

  const clearForm = () => {
    // Clear all input refs
    if (nameRef.current) nameRef.current.value = "";
    if (preorderCloseDateRef.current) preorderCloseDateRef.current.value = "";
    if (shippingDateRef.current) shippingDateRef.current.value = "";
    if (priceRef.current) priceRef.current.value = "";
    setDescriptionEn("");
    setDescriptionZh("");
    setDescriptionLang("en");
    setQuota(0);

    // Clear category selection
    setSelectedCategories([]);

    // Clear file and preview
    setFile(null);
    setImagePreview(null);

    // Clear file input
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Hide error message
    setShowError(false);
  };

  const handleFormSubmit = async () => {
    // Validate all fields
    const name = nameRef.current?.value.trim();
    const preorderCloseDate = preorderCloseDateRef.current?.value;
    const shippingDate = shippingDateRef.current?.value;
    const price = priceRef.current?.value;
    //const stock = stockRef.current?.value;

    // Build description object from language states
    const description = {
      en: descriptionEn.trim(),
      zh: descriptionZh.trim(),
    };

    // Get selected categories from state
    const categoryData = selectedCategories;

    // Validation for basic required fields (excluding image)
    if (
      !name ||
      !preorderCloseDate ||
      !shippingDate ||
      !price ||
      !description ||
      quota < 0
    ) {
      setShowError(true);
      return;
    }

    // Check image requirements
    // No need to check in edit mode,
    // keep existing image if no file is selected
    if (mode === "add" && !file) {
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
      quota,
      description,
      category: categoryData,
      available,
    };

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("data", JSON.stringify(requestBody));

    if (mode === "add") {
      try {
        const path = "admin/goods";
        const method = api.post;
        setIsLoading(true);
        const response = await method(path, formData);
        console.log("Upload" + " success:", response.data);

        // Show success alert and clear form
        alert(t("messages.uploadSuccess"));
        clearForm();
        setIsLoading(false);

        // if (mode === "edit") {
        //   // refresh
        //   if (onSuccessCB) onSuccessCB(response.data.result);
        // }
      } catch (error) {
        console.error("Upload failed:", error);
        alert(t("messages.uploadFailed"));
        setIsLoading(false);
      }
    } else if (mode === "edit" && mutationFn) {
      try {
        //setIsLoading(true); // edit mode loading is handled by mutation
        const updatedProduct = await mutationFn(formData);
        // Call the onSuccess callback if provided
        //console.log("Update success:", updatedProduct);
        if (onSuccessCB) onSuccessCB(updatedProduct.result as Good);
        //setIsLoading(false);
      } catch (error) {
        console.error("Update failed:", error);
        alert(t("messages.updateFailed"));
        //setIsLoading(false);
      }
    }
  };

  // Pre-fill form fields with product data (for edit mode)
  useEffect(() => {
    if (mode !== "edit" || !product) return;
    if (nameRef.current) nameRef.current.value = product.name;
    if (preorderCloseDateRef.current)
      preorderCloseDateRef.current.value = new Date(product.preorderCloseDate)
        .toISOString()
        .split("T")[0];
    if (shippingDateRef.current)
      shippingDateRef.current.value = new Date(product.shippingDate)
        .toISOString()
        .split("T")[0];
    if (priceRef.current) priceRef.current.value = product.price.toString();
    setDescriptionEn(
      (product.description as { en?: string; zh?: string })?.en || ""
    );
    setDescriptionZh(
      (product.description as { en?: string; zh?: string })?.zh || ""
    );
    setDescriptionLang("en");
    setSelectedCategories(product.category);
    setQuota(product.quota);
    setAvailable(product.available);
    setImagePreview(product.imageUrl);
  }, [product, mode]);

  return (
    <>
      {isLoading && <LoadingPanel />}
      <div className="flex flex-col">
        <label className="ml-2">{t("labels.productName")}</label>
        <input
          ref={nameRef}
          type="text"
          placeholder={t("placeholders.productName")}
          className="tw-input-field"
        />
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col grow">
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
        <div className="flex flex-col grow">
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
        {mode === "edit" && (
          <label
            className="cursor-pointer select-none gap-2 flex items-center mx-4"
            htmlFor="availableCheckbox"
          >
            <span> {t("labels.available")}</span>
            <input
              type="checkbox"
              id="availableCheckbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="cursor-pointer"
            />
          </label>
        )}
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col">
            <label className="ml-2">{t("labels.quota")}</label>
            <input
              type="number"
              min="0"
              className="tw-input-field"
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col flex-3">
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
        </div>

        <div className="flex flex-col flex-2">
          <label className="ml-2">{t("labels.category")}</label>
          <div className="tw-input-field max-h-32 overflow-y-auto space-y-1">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 p-1 hover:bg-amber-400 dark:hover:bg-gray-50  dark:hover:text-black rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm capitalize">
                  {t(`category.${category}`, { ns: "goods" })}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="grow flex flex-col">
          <div className="gap-6 flex">
            <label className="ml-2  ">{t("labels.description")}</label>
            {/* Language selector */}
            <span className="flex gap-4 mb-2 ml-2 ">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  value="en"
                  checked={descriptionLang === "en"}
                  onChange={() => setDescriptionLang("en")}
                  className="cursor-pointer"
                />
                <span>en</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  value="zh"
                  checked={descriptionLang === "zh"}
                  onChange={() => setDescriptionLang("zh")}
                  className="cursor-pointer"
                />
                <span>zh</span>
              </label>
            </span>
          </div>

          <textarea
            value={descriptionLang === "zh" ? descriptionZh : descriptionEn}
            onChange={(e) => {
              if (descriptionLang === "zh") {
                setDescriptionZh(e.target.value);
              } else {
                setDescriptionEn(e.target.value);
              }
            }}
            rows={4}
            placeholder={t("placeholders.productDescription")}
            className="tw-input-field resize-none"
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
              onChange={handleImageFileChange}
              className="hidden"
            />
            <Activity mode={imagePreview ? "visible" : "hidden"}>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setImagePreview(null);
                  // Clear the file input
                  const fileInput = fileInputRef.current;
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
        onClick={handleFormSubmit}
        className="w-fit mx-auto cursor-pointer border rounded-xl py-1 px-2 "
      >
        {t(mode === "add" ? "buttons.upload" : "buttons.update")}
      </button>
    </>
  );
}

export default ProductForm;
