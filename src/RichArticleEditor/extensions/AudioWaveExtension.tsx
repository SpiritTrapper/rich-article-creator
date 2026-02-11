import { useRef, useState, useEffect, FC } from "react";

import { Trash2 as TrashIcon, Play as PlayIcon, CirclePause } from "lucide-react";

import Button from "@/RichArticleEditor/components/ui/buttons/button";

import NodeCaption from "../components/NodeCaption";
import { createReactNodeView } from "../pm/react/ReactNodeView";

import type { ReactNodeViewProps } from "../pm/react/ReactNodeView";
import type WaveSurfer from "wavesurfer.js";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const AudioWaveformView: FC<ReactNodeViewProps> = ({
  node,
  deleteNode,
  updateAttributes,
  getPos,
  view,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState((node.attrs.duration as number) || 0);
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    wavesurferRef.current?.destroy();

    let cancelled = false;

    import("wavesurfer.js").then(({ default: WaveSurfer }) => {
      if (cancelled || !containerRef.current) return;

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#888",
        progressColor: "#292D32",
        barWidth: 2,
        height: 16,
      });

      ws.load(node.attrs.src as string);
      ws.on("ready", () => {
        const dur = ws.getDuration() || 0;
        setDuration(dur);
        setRemaining(dur);
        updateAttributes({ duration: Math.round(dur) });
      });
      ws.on("finish", () => setIsPlaying(false));
      ws.on("audioprocess", (time: number) => {
        const total = ws.getDuration() || 0;
        setRemaining(total - time);
      });
      wavesurferRef.current = ws;
    });

    return () => {
      cancelled = true;
      wavesurferRef.current?.destroy();
    };
  }, [node.attrs.src, updateAttributes]);

  const handlePlayPause = () => {
    const ws = wavesurferRef.current;

    if (!ws) {
      return;
    }

    if (isPlaying) {
      ws.pause();
      setIsPlaying(false);
    } else {
      ws.play();
      setIsPlaying(true);
    }
  };

  const handleTrash = () => deleteNode();

  return (
    <div contentEditable={false} className="flex flex-col gap-1.5 my-5">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-(--Monochrome-Spoiler)">
        <Button styleType="blank" onClick={handlePlayPause} className="p-0!">
          {isPlaying ? <CirclePause size={32} /> : <PlayIcon />}
        </Button>
        <div ref={containerRef} style={{ flexGrow: 1 }} />
        <span className="text-(--Monochrome-Auxiliary) text-sm font-medium leading-8">
          {formatDuration(remaining)}
        </span>
        <Button
          styleType="blank"
          onClick={handleTrash}
          className="rounded-full w-8! h-8! bg-[#7e7e7e]! p-0!"
        >
          <TrashIcon />
        </Button>
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

export const audioWaveformNodeView = createReactNodeView(AudioWaveformView);
