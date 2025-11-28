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

  const slicedGoods = sortedGoods.slice(0, 9);

  const enableLoop = slicedGoods.length > 3;

  const bannerWidth = "clamp(27.5rem, calc(100% - 14rem), 80rem)";

  const bannerSlideStyle: React.CSSProperties = {
    width: bannerWidth,
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
      >
        {slicedGoods.map((good) => (
          <SwiperSlide key={good._id} style={bannerSlideStyle}>
            <BannerItem itemDetails={good} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="custom-pagination" style={{ width: bannerWidth }}></div>
    </>
  );
}

export default BannerSlides;
