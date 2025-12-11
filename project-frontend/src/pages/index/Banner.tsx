import { Suspense, lazy } from "react";

const BannerSlides = lazy(() => import("./BannerSlides"));

function Banner() {
  return (
    <div className="bg-black dark:bg-gray-600 py-3 select-none">
      <Suspense fallback={<div></div>}>
        <BannerSlides />
      </Suspense>
    </div>
  );
}

export default Banner;
