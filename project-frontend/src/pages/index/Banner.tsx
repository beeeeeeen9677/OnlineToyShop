import { Suspense, lazy } from "react";
import type { Good } from "../../interface/good";

const BannerSlides = lazy(() => import("./BannerSlides"));

function Banner({ goods }: { goods: Good[] }) {
  return (
    <div className="bg-black dark:bg-gray-600 py-3 select-none">
      <Suspense fallback={<div></div>}>
        <BannerSlides goods={goods} />
      </Suspense>
    </div>
  );
}

export default Banner;
