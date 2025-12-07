import { CgLogIn, CgLogOut } from "react-icons/cg";
import { FiShoppingCart } from "react-icons/fi";
import { MdOutlineWorkHistory } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";

export interface NavItemConfig {
  id: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  showBadge?: boolean;
  badgeCount?: number;
  condition?: "loggedIn" | "admin" | "always";
  isSpecial?: boolean; // For login/logout that changes based on state
}

export const getNavItems = (
  t: (key: string) => string,
  isLoggedIn: boolean,
  isAdmin: boolean,
  totalItems: number // cart
): NavItemConfig[] => {
  const items: NavItemConfig[] = [
    {
      id: "admin",
      to: "/admin",
      icon: RiAdminFill,
      labelKey: t("navigation.admin"),
      condition: "admin" as const,
    },
    {
      id: "orders",
      to: "/order-history",
      icon: MdOutlineWorkHistory,
      labelKey: t("navigation.orders"),
      condition: "loggedIn" as const,
    },
    {
      id: "profile",
      to: "/user",
      icon: FaUserCircle,
      labelKey: t("navigation.profile"),
      condition: "loggedIn" as const,
    },
    {
      id: "cart",
      to: "/cart",
      icon: FiShoppingCart,
      labelKey: t("navigation.cart"),
      showBadge: totalItems > 0,
      badgeCount: totalItems,
      condition: "always" as const,
    },
    {
      id: "auth",
      to: "/auth",
      icon: isLoggedIn ? CgLogOut : CgLogIn,
      labelKey: isLoggedIn ? t("navigation.logout") : t("navigation.login"),
      condition: "always" as const,
      isSpecial: true,
    },
  ];

  return items.filter((item) => {
    if (item.condition === "always") return true;
    if (item.condition === "loggedIn") return isLoggedIn;
    if (item.condition === "admin") return isAdmin;
    return true;
  });
};
