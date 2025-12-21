import { useState } from "react";
import { Link } from "react-router";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import type { NavItemConfig } from "./NavItems";
import { NavItem } from "./NavItem";

interface SideNavProps {
  navItems: NavItemConfig[];
}

export function SideNav({ navItems }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <HiMenuAlt3 className="text-3xl" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <Link to="/" onClick={closeSidebar}>
            <img src="/logo.png" alt="Logo" className="h-12" />
          </Link>
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <IoClose className="text-3xl text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              variant="sidebar"
              onNavigate={closeSidebar}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
