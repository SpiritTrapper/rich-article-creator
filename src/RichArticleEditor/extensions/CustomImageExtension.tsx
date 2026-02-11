import { useRef, useState, useEffect, CSSProperties, FC } from "react";

import { NodeSelection } from "prosemirror-state";

import MediaControls from "../components/MediaControls";
import NodeCaption from "../components/NodeCaption";
import { createReactNodeView } from "../pm/react/ReactNodeView";

import type { ReactNodeViewProps } from "../pm/react/ReactNodeView";

const ImageNodeView: FC<ReactNodeViewProps> = ({
  node,
  view,
  getPos,
  updateAttributes,
  deleteNode,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWRef = useRef<number>(node.attrs.width as number);
  const startHRef = useRef<number>(node.attrs.height as number);
  const ratioRef = useRef((node.attrs.height as number) / (node.attrs.width as number));
  const previewWRef = useRef<number>(node.attrs.width as number);

  const commitSize = () => {
    const w = Math.round(previewWRef.current);
    const h = Math.round(w * ratioRef.current);
    if (w !== node.attrs.width || h !== node.attrs.height) {
      updateAttributes({ width: w, height: h });
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!resizingRef.current || !wrapperRef.current) {
      return;
    }

    e.preventDefault();

    const dx = e.clientX - startXRef.current;
    const maxW = (view.dom as HTMLElement).clientWidth;

    const newW = Math.max(50, Math.min(startWRef.current + dx, maxW));

    previewWRef.current = newW;
    const el = wrapperRef.current;
    el.style.width = `${newW}px`;
    el.style.height = `${Math.round(newW * ratioRef.current)}px`;
  };

  const onPointerUp = () => {
    if (!resizingRef.current) {
      return;
    }

    resizingRef.current = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    commitSize();
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!wrapperRef.current) {
      return;
    }

    (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);

    const pos = getPos();

    if (pos != null) {
      const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
      view.dispatch(tr);
    }

    setIsActive(true);
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWRef.current = wrapperRef.current.offsetWidth;
    startHRef.current = wrapperRef.current.offsetHeight;
    ratioRef.current = startHRef.current / startWRef.current;
    previewWRef.current = startWRef.current;

    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  };

  const handleDelete = () => {
    deleteNode();
  };

  const setAlign = (mode: "left" | "center" | "right") => {
    updateAttributes({ textAlign: mode });
  };

  const wrapperStyle: CSSProperties = {
    width: node.attrs.width as number,
    margin:
      node.attrs.textAlign === "center"
        ? "20px auto"
        : node.attrs.textAlign === "right"
          ? "20px 0 20px auto"
          : "20px 0",
    display: "block",
    position: "relative",
  };

  const handleClickToSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos();

    if (pos != null) {
      const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
      view.dispatch(tr);
    }
  };

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      const wrap = wrapperRef.current;
      setIsActive(Boolean(wrap && e.target instanceof Node && wrap.contains(e.target)));
    };

    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  useEffect(() => {
    const parentW = wrapperRef.current?.parentElement?.clientWidth;
    if (parentW && (node.attrs.width as number) > parentW) {
      const ratio = (node.attrs.height as number) / (node.attrs.width as number);
      updateAttributes({ width: parentW, height: Math.round(parentW * ratio) });
    }
  }, [node.attrs.height, node.attrs.width, updateAttributes]);

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
  }, []); // eslint-disable-line

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      contentEditable={false}
      className="outline-none flex flex-col gap-1.5 max-w-full select-none"
      onMouseDown={handleClickToSelect}
    >
      <div className="relative outline-none block max-w-full">
        <MediaControls
          setTextAlign={setAlign}
          onClose={handleDelete}
          isSelected={isActive}
          handleResizeStart={handleResizeStart}
        />
        <img
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string) || "Image"}
          width={node.attrs.width as number}
          height={node.attrs.height as number}
          className="overflow-hidden rounded-2xl w-full h-full"
          draggable={false}
          style={{ display: "block", maxWidth: "100%" }}
        />
      </div>
      <NodeCaption
        view={view}
        initCaption={node.attrs.caption as string}
        updateAttributes={updateAttributes}
        getPos={getPos}
      />
    </div>
  );
};

export const customImageNodeView = createReactNodeView(ImageNodeView);
