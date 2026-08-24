"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Issue } from "@/lib/types";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (issues !== null) return;
    let cancelled = false;
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data: Issue[]) => {
        if (!cancelled) setIssues(data);
      });
    return () => {
      cancelled = true;
    };
  }, [issues]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const results =
    q.length === 0
      ? []
      : (issues ?? []).filter(
          (issue) =>
            issue.title.toLowerCase().includes(q) ||
            issue.description.toLowerCase().includes(q)
        );

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded-full border border-paper/20 bg-ink/40 px-4 py-2 text-paper/70 backdrop-blur-sm focus-within:border-red">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher une revue…"
          className="w-full bg-transparent text-sm text-paper placeholder:text-paper/40 outline-none"
          aria-label="Rechercher une revue"
        />
      </div>

      {open && q.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-paper/15 bg-ink shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-paper/50">
              Aucune revue trouvée pour « {query} ».
            </p>
          ) : (
            <ul className="divide-y divide-paper/10">
              {results.map((issue) => (
                <li key={issue.id}>
                  <Link
                    href={`/catalogue/${issue.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-paper/5"
                  >
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-paper/10">
                      <Image
                        src={issue.coverImageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <span>
                      <span className="block font-display text-sm tracking-wide text-paper">
                        {issue.title}
                      </span>
                      <span className="block font-mono text-xs text-paper/40">
                        N°{issue.issueNumber}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
