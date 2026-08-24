"use client";

import { useRef, useState } from "react";

const LENS_SIZE = 240;
const MAGNIFICATION = 2.5;

export function MagnifierOverlay({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [lens, setLens] = useState<{
    cursorX: number;
    cursorY: number;
    bgUrl: string;
    bgWidth: number;
    bgHeight: number;
    bgX: number;
    bgY: number;
  } | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const overlay = overlayRef.current;
    if (overlay) overlay.style.pointerEvents = "none";
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (overlay) overlay.style.pointerEvents = "";

    const img = target?.closest("img") as HTMLImageElement | null;
    if (!img || !img.src) {
      setLens(null);
      return;
    }

    const imgRect = img.getBoundingClientRect();
    const offsetXInImg = e.clientX - imgRect.left;
    const offsetYInImg = e.clientY - imgRect.top;

    setLens({
      cursorX: e.clientX - containerRect.left,
      cursorY: e.clientY - containerRect.top,
      bgUrl: img.src,
      bgWidth: imgRect.width * MAGNIFICATION,
      bgHeight: imgRect.height * MAGNIFICATION,
      bgX: -(offsetXInImg * MAGNIFICATION - LENS_SIZE / 2),
      bgY: -(offsetYInImg * MAGNIFICATION - LENS_SIZE / 2),
    });
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10 cursor-crosshair"
      onMouseMove={handleMove}
      onMouseLeave={() => setLens(null)}
    >
      {lens && (
        <div
          className="pointer-events-none absolute rounded-full border-4 border-red shadow-2xl"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lens.cursorX - LENS_SIZE / 2,
            top: lens.cursorY - LENS_SIZE / 2,
            backgroundImage: `url(${lens.bgUrl})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${lens.bgWidth}px ${lens.bgHeight}px`,
            backgroundPosition: `${lens.bgX}px ${lens.bgY}px`,
          }}
        />
      )}
    </div>
  );
}
