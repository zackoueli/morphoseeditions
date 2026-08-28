"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MagnifierOverlay } from "@/components/catalogue/magnifier-overlay";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

// react-pageflip n'exporte pas de types à jour pour l'API impérative (pageFlip()).
type FlipBookHandle = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
    getCurrentPageIndex: () => number;
  };
};

const PRELOAD_AHEAD = 10;
const PRELOAD_BEHIND = 2;
const INITIAL_READY_COUNT = 3;
const BASE_WIDTH_PX = 480;
const PAGE_ASPECT = 733 / 550;
const MIN_ZOOM = 60;
const MAX_ZOOM = 150;
const ZOOM_STEP = 10;

export function FlipbookViewer({
  pageImageUrls,
  title,
  fullscreen = false,
}: {
  pageImageUrls: string[];
  title: string;
  fullscreen?: boolean;
}) {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [pageInput, setPageInput] = useState("1");
  const [magnifierOn, setMagnifierOn] = useState(false);
  const loadedUrls = useRef<Set<string>>(new Set());
  const pageBeforeRemount = useRef(0);
  const ready = readyCount >= Math.min(INITIAL_READY_COUNT, pageImageUrls.length);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setPageInput(String(currentPage + 1));
  }, [currentPage]);

  function handleZoom(next: number) {
    pageBeforeRemount.current = currentPage;
    setZoom(next);
  }

  const pendingFlipTarget = useRef<number | null>(null);

  function goToPage(pageNumber: number) {
    const target = Math.min(Math.max(pageNumber - 1, 0), pageImageUrls.length - 1);
    if (target === currentPage) return;
    pendingFlipTarget.current = target;
    setCurrentPage(target);
  }

  useEffect(() => {
    if (pageImageUrls.length === 0) return;

    const start = Math.max(0, currentPage - PRELOAD_BEHIND);
    const end = Math.min(pageImageUrls.length - 1, currentPage + PRELOAD_AHEAD);
    let cancelled = false;

    for (let i = start; i <= end; i++) {
      const url = pageImageUrls[i];
      if (loadedUrls.current.has(url)) continue;

      const img = new window.Image();
      img.src = url;
      const onDone = () => {
        if (cancelled) return;
        loadedUrls.current.add(url);
        setReadyCount((c) => c + 1);
      };
      img.onload = onDone;
      img.onerror = onDone;
    }

    return () => {
      cancelled = true;
    };
  }, [pageImageUrls, currentPage]);

  useEffect(() => {
    const target = pendingFlipTarget.current;
    if (target === null || target !== currentPage) return;

    const targetUrl = pageImageUrls[target];
    if (!loadedUrls.current.has(targetUrl)) return;

    pendingFlipTarget.current = null;
    bookRef.current?.pageFlip().turnToPage(target);
  }, [currentPage, readyCount, pageImageUrls]);

  if (pageImageUrls.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-lg border-2 border-dashed border-ink/20 bg-ink/5 text-ink/50">
        Lecture en ligne bientôt disponible pour ce numéro.
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-lg border-2 border-ink/10 bg-ink/5">
        <p className="font-display text-lg tracking-wide text-ink/60">
          CHARGEMENT DE LA REVUE…
        </p>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full bg-red transition-all"
            style={{
              width: `${Math.round((readyCount / Math.min(INITIAL_READY_COUNT, pageImageUrls.length)) * 100)}%`,
            }}
          />
        </div>
      </div>
    );
  }

  const widthPx = fullscreen ? Math.round((BASE_WIDTH_PX * zoom) / 100) : 550;
  const heightPx = Math.round(widthPx * PAGE_ASPECT);
  const containerWidthPx = fullscreen && !isMobile ? widthPx * 2 : widthPx;

  return (
    <div className="flex flex-col items-center gap-4">
      {fullscreen && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleZoom(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink/20 font-display text-lg text-ink/70 hover:border-red hover:text-red disabled:opacity-30"
            aria-label="Réduire"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => handleZoom(100)}
            className="font-mono text-xs text-ink/50 hover:text-red"
          >
            {zoom}%
          </button>
          <button
            type="button"
            onClick={() => handleZoom(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink/20 font-display text-lg text-ink/70 hover:border-red hover:text-red disabled:opacity-30"
            aria-label="Agrandir"
          >
            +
          </button>
          <span className="h-6 w-px bg-ink/15" />
          <button
            type="button"
            onClick={() => setMagnifierOn((v) => !v)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-sm ${
              magnifierOn
                ? "border-red bg-red text-paper"
                : "border-ink/20 text-ink/70 hover:border-red hover:text-red"
            }`}
            aria-label="Loupe"
            aria-pressed={magnifierOn}
            title="Loupe pour lire les textes"
          >
            🔍
          </button>
        </div>
      )}

      <div
        ref={bookContainerRef}
        style={fullscreen ? { width: containerWidthPx, maxWidth: "100%" } : undefined}
        className={`relative ${fullscreen ? "" : "w-full max-w-2xl"}`}
      >
        {fullscreen && magnifierOn && (
          <MagnifierOverlay containerRef={bookContainerRef} />
        )}
        {/* @ts-expect-error react-pageflip a des types incomplets pour ses props */}
        <HTMLFlipBook
          key={fullscreen ? `${widthPx}-${isMobile}` : "fixed"}
          ref={bookRef}
          width={widthPx}
          height={heightPx}
          size={fullscreen ? "fixed" : "stretch"}
          usePortrait
          minWidth={280}
          maxWidth={fullscreen ? 2000 : 900}
          minHeight={373}
          maxHeight={fullscreen ? 2666 : 1200}
          showCover
          maxShadowOpacity={0.5}
          className="mx-auto"
          onFlip={(e: { data: number }) => setCurrentPage(e.data)}
          onInit={() => {
            if (pageBeforeRemount.current > 0) {
              bookRef.current?.pageFlip().turnToPage(pageBeforeRemount.current);
              setCurrentPage(pageBeforeRemount.current);
            }
          }}
        >
          {pageImageUrls.map((url, i) => {
            const withinWindow =
              i >= currentPage - PRELOAD_BEHIND && i <= currentPage + PRELOAD_AHEAD;
            const shouldShow = withinWindow || loadedUrls.current.has(url);
            return (
              <div key={url} className="flex items-center justify-center bg-paper">
                {shouldShow ? (
                  <Image
                    src={url}
                    alt={`${title} — page ${i + 1}`}
                    width={550}
                    height={733}
                    loading="eager"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="font-mono text-xs text-ink/30">Page {i + 1}</span>
                )}
              </div>
            );
          })}
        </HTMLFlipBook>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          className="font-display text-sm tracking-widest text-ink/70 hover:text-red"
        >
          ← PRÉCÉDENTE
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToPage(Number(pageInput));
          }}
          className="flex items-center gap-1.5 font-mono text-sm text-ink/50"
        >
          <input
            type="number"
            min={1}
            max={pageImageUrls.length}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => goToPage(Number(pageInput))}
            className="w-14 rounded border border-ink/20 bg-transparent px-2 py-1 text-center outline-none focus:border-red"
            aria-label="Aller à la page"
          />
          <span>/ {pageImageUrls.length}</span>
        </form>
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          className="font-display text-sm tracking-widest text-ink/70 hover:text-red"
        >
          SUIVANTE →
        </button>
      </div>
    </div>
  );
}
