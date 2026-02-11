import { useRef, ChangeEvent, useEffect } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import {
  X as CloseIcon,
  GripVertical as DragHandlerIcon,
  Plus,
  AlertTriangle as AlertIcon,
} from "lucide-react";

import Button from "@components/ui/buttons/button";
import Textarea from "@components/ui/textareas/textarea";

import { useEditorInstance, useEditorActions } from "@contexts/EditorContext";

import { CarouselItem } from "@shared/types";

import * as cmd from "../pm/commands";

import EditorModal from "./EditorModal";

const MAX_ITEMS = 10;

interface SortableItemProps {
  item: CarouselItem;
  idx: number;
  onRemove: (idx: number) => void;
  onChangeCaption: (e: ChangeEvent<HTMLTextAreaElement>, idx: number) => void;
}

function SortableItem({ item, idx, onRemove, onChangeCaption }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const orientationCls =
    item.orientation === "horizontal"
      ? "w-[142px] h-20 max-md:w-[calc(100vw-100px)] max-md:h-[189px]"
      : item.orientation === "vertical"
        ? "w-20 h-[142px] max-md:w-[120px] max-md:h-[214px]"
        : "w-20 h-20 max-md:w-[calc(100vw-160px)] max-md:h-[189px]";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex flex-row items-center gap-3 w-full max-md:flex-col"
      {...attributes}
    >
      <DragHandlerIcon
        className="max-md:hidden"
        {...listeners}
        style={{ cursor: "grab", touchAction: "none" }}
      />
      <div className="relative">
        <div
          className={clsx(
            "relative overflow-hidden rounded-lg border border-(--monochrome-outline-lines)",
            orientationCls,
          )}
        >
          <img
            src={item.src}
            alt={item.caption || "preview"}
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
        <Button
          styleType="blank"
          className="flex absolute -top-1.5 -right-1.5 w-6! h-6! p-0! bg-(--Colors-Red)! rounded-full z-3 [&>svg]:m-auto max-md:w-4! max-md:h-4! max-md:-right-0.5"
          onClick={() => onRemove(idx)}
        >
          <CloseIcon />
        </Button>
      </div>
      <Textarea
        name="caption"
        value={item.caption}
        onChange={(event) => onChangeCaption(event, idx)}
        className="w-full! h-full! bg-(--Monochrome-Fields)! rounded-2xl! border-none! max-md:py-3 max-md:px-4.5 max-md:h-21.25!"
        placeholder="Описание для фото"
        maxLength={100}
        isCounter
      />
    </li>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarouselModal({ isOpen, onClose }: Props) {
  const { view } = useEditorInstance();
  const {
    carouselItems,
    setCarouselItems,
    editingCarouselPos,
    setEditingCarouselPos,
    onUploadImage,
  } = useEditorActions();
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const openDialog = () => inputRef.current?.click();

  const addCarouselItem = (src: string) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      const orientation: CarouselItem["orientation"] =
        img.width > img.height ? "horizontal" : img.width < img.height ? "vertical" : "square";

      const id = Math.random().toString(36).substring(2, 9);
      setCarouselItems((prev) => [...prev, { id, src, caption: "", orientation }]);
    };
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }

    const remaining = MAX_ITEMS - carouselItems.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (onUploadImage) {
          onUploadImage(file).then(addCarouselItem);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              addCarouselItem(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    e.target.value = "";
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setCarouselItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const removeItem = (idx: number) => {
    setCarouselItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClose = () => {
    setEditingCarouselPos(null);
    setCarouselItems([]);
    onClose();
  };

  const onSubmit = () => {
    if (!view) {
      return;
    }

    if (editingCarouselPos != null) {
      const { state } = view;
      const node = state.doc.nodeAt(editingCarouselPos);

      if (node && node.type === state.schema.nodes.imageCarousel) {
        const tr = state.tr.setNodeMarkup(editingCarouselPos, undefined, {
          ...node.attrs,
          items: carouselItems,
        });
        view.dispatch(tr);
        view.focus();
      }
    } else {
      cmd.execCommand(view, cmd.insertCarousel(carouselItems));
    }

    setEditingCarouselPos(null);
    setCarouselItems([]);
    onClose();
  };

  const onChangeCaption = (e: ChangeEvent<HTMLTextAreaElement>, idx: number) => {
    const copy = [...carouselItems];
    copy[idx].caption = e.target.value;
    setCarouselItems(copy);
  };

  useEffect(() => {
    if (isOpen && editingCarouselPos == null && carouselItems.length > 0) {
      setCarouselItems([]);
    }
  }, [isOpen, editingCarouselPos, carouselItems.length, setCarouselItems]);

  return (
    <EditorModal
      title="Редактирование карусели"
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={onSubmit}
      submitIsDisabled={carouselItems.length < 3}
    >
      <div
        className="flex flex-col max-h-[50vh] overflow-y-auto max-md:max-h-[65vh]"
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <div className="flex items-start gap-3 bg-[rgba(255,211,88,0.1)] px-5 py-3 rounded-xl [&>svg]:min-w-6">
          <AlertIcon />
          <span className="text-[#c7a23d] text-sm font-semibold pt-0.5">
            Все фото в галерее должны быть с одинаковым соотношением сторон (К примеру, только 16:9
            или только 1:1 или только 4:3...)
          </span>
        </div>
        {carouselItems.length < MAX_ITEMS && (
          <Button
            styleType="blank"
            onClick={openDialog}
            className="w-full h-16! min-h-16! border! border-dashed! border-(--Monochrome-Auxiliary)! rounded-2xl! text-center text-sm font-semibold mt-6"
          >
            <span className="flex w-6 h-6 rounded-full bg-(--Monochrome-Main-color) text-(--Monochrome-White) *:m-auto">
              <Plus width={18} height={18} />
            </span>
            <span>
              Прикрепить фото
              <span className="pl-0.5 text-(--Monochrome-Auxiliary)">(от 3 до 10 штук)</span>
            </span>
          </Button>
        )}
        <input
          ref={inputRef}
          onChange={onFileChange}
          type="file"
          accept="image/*"
          multiple
          hidden
        />
        {carouselItems.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={carouselItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col mt-6 gap-5 list-none pt-1.5 pb-0 w-full max-md:pb-6">
                {carouselItems.map((item, idx) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    idx={idx}
                    onRemove={removeItem}
                    onChangeCaption={onChangeCaption}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </EditorModal>
  );
}
