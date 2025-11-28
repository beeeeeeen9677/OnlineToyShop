import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type ModuleWrapperProps = {
  maxHeight: string;
  title: string;
  component: React.ReactNode;
};

function ModuleWrapper({ maxHeight, title, component }: ModuleWrapperProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div
      className={`border-2 border-primary dark:border-white dark:bg-zinc-600 rounded-lg p-4 m-4 relative flex flex-col gap-4 overflow-hidden ${
        isOpen ? maxHeight : "max-h-16"
      } transition-[max-height] duration-1000 ease-out `}
    >
      <div className="absolute right-10 cursor-pointer">
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      <div
        className="font-black text-3xl pl-2 cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {title}
      </div>
      {component}
    </div>
  );
}

export default ModuleWrapper;
