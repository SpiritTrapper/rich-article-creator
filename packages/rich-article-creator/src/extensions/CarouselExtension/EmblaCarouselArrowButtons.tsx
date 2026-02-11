import { ComponentPropsWithRef, FC, useEffect, useState } from "react";

import { EmblaCarouselType } from "embla-carousel";

interface UsePrevNextButtonsType {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
}

type PropType = ComponentPropsWithRef<"button">;

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (api: EmblaCarouselType) => void,
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = () => {
    if (!emblaApi) {
      return;
    }

    emblaApi.scrollPrev();

    if (onButtonClick) {
      onButtonClick(emblaApi);
    }
  };

  const onNextButtonClick = () => {
    if (!emblaApi) {
      return;
    }

    emblaApi.scrollNext();

    if (onButtonClick) {
      onButtonClick(emblaApi);
    }
  };

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

export const PrevButton: FC<PropType> = (props) => {
  return (
    <button
      type="button"
      className="absolute top-0 left-0 w-30 h-full z-100 select-none max-md:w-15"
      {...props}
    />
  );
};

export const NextButton: FC<PropType> = (props) => {
  return (
    <button
      type="button"
      className="absolute top-0 right-0 w-30 h-full z-100 select-none max-md:w-15"
      {...props}
    />
  );
};
