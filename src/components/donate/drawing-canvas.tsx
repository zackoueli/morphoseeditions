"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type DrawingCanvasHandle = {
  exportPng: () => string;
  isBlank: () => boolean;
  clear: () => void;
};

const WIDTH = 640;
const HEIGHT = 420;

export const DrawingCanvas = forwardRef<DrawingCanvasHandle>(
  function DrawingCanvas(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const dirty = useRef(false);
    const [lineWidth, setLineWidth] = useState(3);

    function ctx() {
      return canvasRef.current?.getContext("2d") ?? null;
    }

    function resetSurface() {
      const c = ctx();
      if (!c) return;
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, WIDTH, HEIGHT);
      c.lineCap = "round";
      c.lineJoin = "round";
      c.strokeStyle = "#0d0906";
      dirty.current = false;
    }

    useEffect(() => {
      resetSurface();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function pos(e: React.PointerEvent<HTMLCanvasElement>) {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * WIDTH,
        y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
      };
    }

    function start(e: React.PointerEvent<HTMLCanvasElement>) {
      e.preventDefault();
      const c = ctx();
      if (!c) return;
      drawing.current = true;
      canvasRef.current?.setPointerCapture(e.pointerId);
      const { x, y } = pos(e);
      c.lineWidth = lineWidth;
      c.beginPath();
      c.moveTo(x, y);
    }

    function move(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawing.current) return;
      const c = ctx();
      if (!c) return;
      const { x, y } = pos(e);
      c.lineTo(x, y);
      c.stroke();
      dirty.current = true;
    }

    function end() {
      drawing.current = false;
    }

    useImperativeHandle(ref, () => ({
      exportPng: () => canvasRef.current?.toDataURL("image/png") ?? "",
      isBlank: () => !dirty.current,
      clear: resetSurface,
    }));

    return (
      <div>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full touch-none rounded-md border-2 border-ink/20 bg-white"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        />
        <div className="mt-2 flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-ink/60">
            Trait
            <input
              type="range"
              min={1}
              max={10}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={resetSurface}
            className="rounded-full border-2 border-ink/20 px-3 py-1 font-display text-xs tracking-wide text-ink hover:border-red"
          >
            EFFACER
          </button>
        </div>
      </div>
    );
  }
);
