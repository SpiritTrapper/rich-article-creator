import { useRef, useEffect, CSSProperties, useState, FC } from "react";

import { Play as PlayIcon } from "lucide-react";
import { NodeSelection } from "prosemirror-state";

import MediaControls from "../components/MediaControls";
import NodeCaption from "../components/NodeCaption";
import { createReactNodeView } from "../pm/react/ReactNodeView";

import type { ReactNodeViewProps } from "../pm/react/ReactNodeView";

const VideoNodeView: FC<ReactNodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  view,
  getPos,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWRef = useRef<number>(node.attrs.width as number);
  const startHRef = useRef<number>(node.attrs.height as number);
  const ratioRef = useRef((node.attrs.height as number) / (node.attrs.width as number));
  const previewWRef = useRef<number>(node.attrs.width as number);

  const [isPlaying, setIsPlaying] = useState(false);

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

    const dx = e.clientX - startXRef.current;
    const maxW = wrapperRef.current.parentElement?.clientWidth ?? Infinity;
    const newW = Math.max(50, Math.min(startWRef.current + dx, maxW));

    previewWRef.current = newW;

    const newH = Math.round(newW * ratioRef.current);
    const el = wrapperRef.current;

    el.style.width = `${newW}px`;
    el.style.height = `${newH}px`;
  };

  const onPointerUp = () => {
    if (!resizingRef.current) {
      return;
    }

    resizingRef.current = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    commitSize();
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!wrapperRef.current) {
      return;
    }

    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWRef.current = wrapperRef.current.offsetWidth;
    startHRef.current = wrapperRef.current.offsetHeight;
    ratioRef.current = startHRef.current / startWRef.current;
    previewWRef.current = startWRef.current;

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerup", onPointerUp);
  };

  const handleDelete = () => {
    deleteNode();
  };

  const setAlign = (mode: "left" | "center" | "right") => {
    updateAttributes({ textAlign: mode });
  };

  const onHitPlay = async (event: React.MouseEvent) => {
    event.stopPropagation();
    await videoRef.current?.play();
    setIsPlaying(true);
  };

  const onHitStop = (event: React.MouseEvent) => {
    event.stopPropagation();
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const handleClickToSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos();

    if (pos != null) {
      const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
      view.dispatch(tr);
    }
  };

  const wrapperStyle: CSSProperties = {
    width: node.attrs.width as number,
    aspectRatio: `${node.attrs.width}/${node.attrs.height}`,
    margin:
      node.attrs.textAlign === "center"
        ? "20px auto"
        : node.attrs.textAlign === "right"
          ? "20px 0 20px auto"
          : "20px 0",
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
    };
  }, []); // eslint-disable-line

  return (
    <div
      contentEditable={false}
      ref={wrapperRef}
      style={wrapperStyle}
      className="outline-none flex flex-col gap-1.5 max-w-full select-none"
      onMouseDown={handleClickToSelect}
    >
      <div className="relative outline-none block max-w-full" onClick={onHitStop}>
        <MediaControls
          setTextAlign={setAlign}
          onClose={handleDelete}
          isSelected={isActive}
          handleResizeStart={handleResizeStart}
        />
        <video
          ref={videoRef}
          src={node.attrs.src as string}
          className="block w-full h-full overflow-hidden rounded-2xl select-none"
          preload="metadata"
        />
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-1 overflow-hidden rounded-2xl select-none">
            <button
              className="bg-transparent border-none cursor-pointer p-2 z-2"
              onClick={onHitPlay}
            >
              <PlayIcon />
            </button>
          </div>
        )}
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

export const customVideoNodeView = createReactNodeView(VideoNodeView);
