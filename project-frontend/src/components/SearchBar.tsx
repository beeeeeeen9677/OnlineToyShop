import { useEffect, useEffectEvent, useState } from "react";
import { useTranslation } from "../i18n/hooks";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router";

function SearchBar() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");

  // enter key for handling search
  const handleEnterEvent = useEffectEvent((event: { key: string }) => {
    if (event.key === "Enter") {
      navigate(`/search?query=${encodeURIComponent(inputValue)}`);
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      handleEnterEvent(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-black h-14 flex justify-center items-center py-2">
      <div className="bg-white text-black relative flex h-full w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-2 pl-15 pr-5 py-2 rounded-full shadow-xl">
        <CiSearch className="size-6 absolute left-6" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1  outline-none"
          placeholder={t("placeholders.search")}
        />
      </div>
    </div>
  );
}

export default SearchBar;
