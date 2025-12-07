import { Link } from "react-router";
import { useLoginContext, useUserContext } from "../context/app";
import {
  useTranslation,
  useLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../i18n/hooks";
import { useCart } from "../pages/shoppingCart/useCart";
import { getNavItems } from "./Navigation/NavItems";
import { NavItem } from "./Navigation/NavItem";
import { SideNav } from "./Navigation/SideNav";

function Header() {
  const { currentLanguage, changeLanguage } = useLanguage();

  const { t } = useTranslation("header");
  const isLoggedIn = useLoginContext();
  const user = useUserContext();
  const isAdmin = isLoggedIn && user?.role === "admin";
  const { totalItems } = useCart();

  const navItems = getNavItems(t, isLoggedIn, isAdmin, totalItems);

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
            className="cursor-pointer hover:scale-125 transition duration-150 text-white outline-none"
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

          {/* Desktop Navigation - Hidden on small screens */}
          <div className="hidden md:flex items-center gap-5 h-full">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} variant="header" />
            ))}
          </div>

          {/* Mobile Navigation - Show hamburger on small screens */}
          <SideNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}

export default Header;
