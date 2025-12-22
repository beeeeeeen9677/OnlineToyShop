import { useRef, useState } from "react";
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
    if (!keyword || keyword.trim() === "") {
      navigate(`/search`);
    } else {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  const handleEnter = () => {
    redirectToSearch(inputValue);
    setInputValue("");
    if (inputElem.current) {
      inputElem.current.blur();
    }
  };

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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEnter();
            }
          }}
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
