import { Link } from "react-router";
import type { NavItemConfig } from "./NavItems";

interface NavItemProps {
  item: NavItemConfig;
  variant?: "header" | "sidebar";
  onNavigate?: () => void;
}

export function NavItem({
  item,
  variant = "header",
  onNavigate,
}: NavItemProps) {
  const Icon = item.icon;

  if (variant === "sidebar") {
    return (
      <Link
        to={item.to}
        onClick={onNavigate}
        className="flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
      >
        <Icon className="text-2xl" />
        <span className="text-lg font-medium">{item.labelKey}</span>
        {item.showBadge && item.badgeCount !== undefined && (
          <div className="bg-red-600 text-white rounded-full ml-auto px-2 py-1 text-xs flex items-center justify-center min-w-6">
            {item.badgeCount}
          </div>
        )}
      </Link>
    );
  }

  // Header variant
  const duration = "200";
  return (
    <Link
      to={item.to}
      className="group text-white flex flex-col justify-center items-center h-full w-16 transition duration-1000 relative"
    >
      <Icon
        className={`absolute top-3 scale-160 group-hover:scale-250 group-hover:translate-y-3 transition duration-${duration}`}
      />
      <p
        className={`absolute bottom-2 group-hover:hidden transition duration-${duration}`}
      >
        {item.labelKey}
      </p>
      {item.showBadge && item.badgeCount !== undefined && (
        <div className="bg-red-600 text-white rounded-full absolute top-1 right-1 size-5 text-xs flex items-center justify-center">
          {item.badgeCount}
        </div>
      )}
    </Link>
  );
}
