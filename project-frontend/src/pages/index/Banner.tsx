import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { Good } from "../../interface/good";
import BannerItem from "./BannerItem";

function Banner({ goods }: { goods: Good[] }) {
  const sortedGoods = [...goods].sort((a, b) => {
    const aValue: number = a["broughtCount"];
    const bValue: number = b["broughtCount"];

    return bValue - aValue; // Highest first
  });

  const bannerSlideStyle: React.CSSProperties = {
    width: "clamp(27.5rem, calc(100% - 10rem), 80rem)",
    aspectRatio: "2 / 1",
  };

  return (
    <div className="bg-black dark:bg-gray-600 py-3 select-none">
      <Swiper
        loop
        slidesPerView={"auto"}
        spaceBetween={16}
        centeredSlides={true}
        className="p-4"
      >
        {sortedGoods.map((good) => (
          <SwiperSlide key={good._id} style={bannerSlideStyle}>
            <BannerItem itemDetails={good} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Banner;
