import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslation } from "../i18n/hooks";
import { CiSearch } from "react-icons/ci";
import { FaLocationArrow } from "react-icons/fa";
import { useNavigate } from "react-router";

function SearchBar() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const inputElem = useRef<HTMLInputElement>(null);

  // enter key for handling search
  const redirectToSearch = (keyword: string) => {
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleEnterEvent = useEffectEvent((event: { key: string }) => {
    if (event.key === "Enter") {
      redirectToSearch(inputValue);
      setInputValue("");
      if (inputElem.current) {
        inputElem.current.blur();
      }
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
    <div className="h-14 flex justify-center items-center py-2">
      <div className="bg-white text-black relative flex h-full w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-2 pl-15 pr-5 py-2 rounded-full shadow-md dark:shadow-none shadow-primary">
        <CiSearch className="size-6 absolute left-6" />
        <input
          type="text"
          ref={inputElem}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1  outline-none"
          placeholder={t("placeholders.search")}
        />
        <button
          onClick={() => redirectToSearch(inputValue)}
          className="cursor-pointer "
        >
          <FaLocationArrow className="rotate-45 " />
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
