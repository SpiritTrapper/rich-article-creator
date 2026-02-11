import { FC, lazy, Suspense } from "react";

import Button from "@/RichArticleEditor/components/ui/buttons/button";

import { getEditorCallbacks } from "../../pm/callbackPlugin";
import { createReactNodeView } from "../../pm/react/ReactNodeView";
import { CarouselItem } from "../../shared/types";

import type { ReactNodeViewProps } from "../../pm/react/ReactNodeView";

const CarouselSlider = lazy(() => import("./CarouselSlider"));

const CarouselNodeView: FC<ReactNodeViewProps> = ({ node, getPos, deleteNode, view }) => {
  const callbacks = getEditorCallbacks(view);
  const items: CarouselItem[] = (node.attrs.items as CarouselItem[]) ?? [];

  const onRemoveCarousel = () => {
    callbacks.setCarouselItems?.([]);
    callbacks.setEditingCarouselPos?.(null);
    deleteNode();
  };

  const onEditCarousel = () => {
    callbacks.setCarouselItems?.(items);
    const pos = getPos();
    callbacks.setEditingCarouselPos?.((pos as number) ?? null);
    callbacks.openCarouselModal?.();
  };

  return (
    <div className="mt-5">
      <div className="carousel-controls w-full flex justify-end gap-2 mb-3 select-none">
        <Button styleType="gray-border" onClick={onRemoveCarousel}>
          Delete
        </Button>
        <Button styleType="gray-border" onClick={onEditCarousel}>
          Edit
        </Button>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-xl" />}>
        <CarouselSlider items={items} />
      </Suspense>
    </div>
  );
};

export const imageCarouselNodeView = createReactNodeView(CarouselNodeView);
