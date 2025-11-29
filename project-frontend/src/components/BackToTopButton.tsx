import { useScrollToggleVisibility } from "../hooks/useScrollToggleVisibility";

const BackToTopButton = () => {
  const { isVisible, scrollToTop } = useScrollToggleVisibility(300);

  return (
    <>
      <button
        onClick={scrollToTop}
        className={`bg-primary text-white hover:bg-primary-hover hover:text-purple-50 dark:bg-white dark:text-primary dark:hover:bg-purple-50 dark:hover:text-primary-hover border-2 border-primary rounded-full font-extrabold text-lg size-12 fixed bottom-26 lg:bottom-10 right-10 lg:right-46  cursor-pointer ${
          isVisible ? "scale-100" : "scale-0"
        } transition-transform duration-300  z-20`}
      >
        Top
      </button>
    </>
  );
};

export default BackToTopButton;
