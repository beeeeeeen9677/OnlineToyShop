import { useState, useEffect } from "react";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const visibleThreshold = 300;

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
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <button
        onClick={scrollToTop}
        className={`bg-white text-primary hover:bg-purple-50 hover:text-primary-hover border-2 border-primary rounded-full font-extrabold text-lg w-12 h-12 fixed bottom-10 right-10 lg:right-30  cursor-pointer z-20 ${
          isVisible ? "scale-100" : "scale-0"
        } transition-transform duration-300`}
      >
        Top
      </button>
    </>
  );
};

export default BackToTopButton;
