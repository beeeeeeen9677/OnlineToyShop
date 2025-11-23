import { Activity } from "react";
import { Link } from "react-router";
import { useLoginContext, useUserContext } from "../context/app";
import {
  useTranslation,
  useLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../i18n/hooks";
import { CgLogIn, CgLogOut } from "react-icons/cg";

function Header() {
  const { currentLanguage, changeLanguage } = useLanguage();

  const { t } = useTranslation("header");
  const isLoggedIn = useLoginContext();
  const user = useUserContext();
  const isAdmin = isLoggedIn && user?.role === "admin";
  const duration = "200";
  return (
    <header className="bg-primary w-full h-16 justify-center flex">
      <div className="relative flex grow justify-between  max-w-8/10">
        <Link to="/">
          <img
            src={"/logo.png"}
            alt={t("alt.logo")}
            className="h-full py-0.5 my-auto"
          />
        </Link>
        {/* Right Hand Side */}
        <div className="flex items-center gap-5">
          <select
            className="cursor-pointer hover:scale-125 transition duration-150 text-white"
            value={currentLanguage}
            onChange={(e) =>
              changeLanguage(e.target.value as SupportedLanguage)
            }
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-amber-50 text-black"
              >
                {lang.nativeName}
              </option>
            ))}
          </select>
          <Activity mode={isAdmin ? "visible" : "hidden"}>
            <Link to="/admin">
              <p className="hover:scale-125 transition duration-150 text-white">
                {t("navigation.admin")}
              </p>
            </Link>
          </Activity>
          <Activity mode={isLoggedIn ? "visible" : "hidden"}>
            <Link
              to="/user"
              className="group relative text-white flex flex-col justify-center items-center h-full w-16 transition duration-1000"
            >
              <svg
                className={`absolute top-2 group-hover:scale-150 group-hover:translate-y-3 transition duration-${duration}`}
                viewBox="0 0 32 32"
                enableBackground="new 0 0 32 32"
                fill="currentColor"
                width="24px"
                height="24px"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <circle
                      cx="16"
                      cy="16"
                      fill="none"
                      r="15"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeMiterlimit="10"
                      strokeWidth="2"
                    ></circle>
                    <path
                      d="M26,27L26,27 c0-5.523-4.477-10-10-10h0c-5.523,0-10,4.477-10,10v0"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeMiterlimit="10"
                      strokeWidth="2"
                    ></path>
                    <circle
                      cx="16"
                      cy="11"
                      fill="none"
                      r="6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeMiterlimit="10"
                      strokeWidth="2"
                    ></circle>
                  </g>
                </g>
              </svg>
              <p
                className={`absolute bottom-2 group-hover:hidden transition duration-${duration}`}
              >
                {t("navigation.profile")}
              </p>
            </Link>
          </Activity>
          <Link
            to="/auth"
            className="group text-white flex flex-col justify-center items-center h-full w-16 transition duration-1000"
          >
            <div
              className={`absolute top-3 scale-200 group-hover:scale-300 group-hover:translate-y-3 transition duration-${duration}`}
            >
              {isLoggedIn ? <CgLogOut /> : <CgLogIn />}
            </div>
            <p
              className={`absolute bottom-2 group-hover:hidden transition duration-${duration}`}
            >
              {!isLoggedIn ? t("navigation.login") : t("navigation.logout")}
            </p>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
