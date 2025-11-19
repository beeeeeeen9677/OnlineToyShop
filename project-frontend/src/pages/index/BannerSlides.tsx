import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import type { Good } from "../../interface/good";
import BannerItem from "./BannerItem";
import "./IndexPage.css";

function BannerSlides({ goods }: { goods: Good[] }) {
  const sortedGoods = useMemo(() => {
    return [...goods].sort((a, b) => {
      const aValue: number = a["broughtCount"];
      const bValue: number = b["broughtCount"];

      return bValue - aValue; // Highest first
    });
  }, [goods]);

  const enableLoop = sortedGoods.length > 3;

  const bannerSlideStyle: React.CSSProperties = {
    width: "clamp(27.5rem, calc(100% - 14rem), 80rem)",
    aspectRatio: "2 / 1",
  };

  return (
    <>
      <Swiper
        modules={[Pagination]}
        pagination={{
          el: ".custom-pagination",
          clickable: true,
        }}
        loop={enableLoop}
        slidesPerView={"auto"}
        slidesPerGroup={1}
        spaceBetween={20}
        centeredSlides={true}
        className="p-4"
      >
        {sortedGoods.map((good) => (
          <SwiperSlide key={good._id} style={bannerSlideStyle}>
            <BannerItem itemDetails={good} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="custom-pagination flex mx-auto md:mt-4 gap-2 w-[clamp(27.5rem,calc(100%-14rem),80rem)]"></div>
    </>
  );
}

export default BannerSlides;
