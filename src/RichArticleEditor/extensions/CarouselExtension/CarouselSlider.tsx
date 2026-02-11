import { FC, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";

import { CarouselItem } from "../../shared/types";

import { NextButton, PrevButton, usePrevNextButtons } from "./EmblaCarouselArrowButtons";

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

interface PropType {
  items: CarouselItem[];
  isAutoplay?: boolean;
  className?: string;
}

const CarouselSlider: FC<PropType> = ({ items, className }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(emblaApi);

  const setTweenNodes = (api: EmblaCarouselType): void => {
    tweenNodes.current = api.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla__slide__inner") as HTMLElement;
    });
  };

  const setTweenFactor = (api: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * api.scrollSnapList().length;
  };

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const tweenScale = (api: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = api.internalEngine();
      const scrollProgress = api.scrollProgress();
      const slidesInView = api.slidesInView();
      const isScrollEvent = eventName === "scroll";

      api?.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) {
            return;
          }

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenValue = 1 - Math.abs((diffToTarget * tweenFactor.current) / 3.5);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode.style.transform = `scaleY(${scale})`;

          if (slideIndex !== selectedIndex) {
            tweenNode.style.opacity = "0.5";
            tweenNode.classList.add("is-hidden-slide");
          } else {
            tweenNode.style.opacity = "1";
            tweenNode.classList.remove("is-hidden-slide");
          }
        });
      });
    };

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale);

    return () => {
      emblaApi
        .off("reInit", setTweenNodes)
        .off("reInit", setTweenFactor)
        .off("reInit", tweenScale)
        .off("scroll", tweenScale)
        .off("slideFocus", tweenScale);
    };
  }, [emblaApi, selectedIndex]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [items, emblaApi]);

  const orientationCls =
    items[selectedIndex]?.orientation === "horizontal"
      ? "_horizontal"
      : items[selectedIndex]?.orientation === "vertical"
        ? "_vertical"
        : "_square";

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className={clsx("embla", orientationCls, className)}>
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {items.map((item, idx) => (
              <div key={`slide_${items[idx].id}`} className="embla__slide">
                <div className="embla__slide__inner">
                  <img
                    src={item.src}
                    alt={item.caption}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>
      <div className="flex items-center gap-3.75 w-full select-none">
        <div className="flex text-[11px] font-medium text-(--Monochrome-Main-color) text-center bg-(--Monochrome-Fields) rounded-xl py-2 px-3 *:m-auto *:font-(--font-default)!">
          <span>{`${selectedIndex + 1}/${items.length}`}</span>
        </div>
        <p className="text-[13px]! m-0! font-medium text-(--Monochrome-Auxiliary) max-md:text-xs!">
          {items[selectedIndex]?.caption ?? ""}
        </p>
      </div>
    </div>
  );
};

export default CarouselSlider;
