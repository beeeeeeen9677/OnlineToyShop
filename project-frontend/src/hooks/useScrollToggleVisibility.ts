import { useEffect, useState } from "react";

export const useScrollToggleVisibility = (visibleThreshold: number = 300) => {
  const [isVisible, setIsVisible] = useState(false);

  //const visibleThreshold = 300;

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > visibleThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [visibleThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return { isVisible, scrollToTop };
};
