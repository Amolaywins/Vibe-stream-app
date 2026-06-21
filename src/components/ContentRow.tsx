import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard } from "./MediaCard";
import type { TMDBMovie } from "@/lib/tmdb";

interface ContentRowProps {
  title: string;
  items: TMDBMovie[];
  mediaType: string;
  loading?: boolean;
  onCardClick: (item: TMDBMovie, type: string) => void;
}

export function ContentRow({ title, items, mediaType, loading, onCardClick }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === "right" ? 480 : -480, behavior: "smooth" });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <h2 className="text-base font-semibold text-white/90 tracking-tight">{title}</h2>
        <div className="flex gap-1">
          <button
            data-testid={`btn-scroll-left-${title.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            data-testid={`btn-scroll-right-${title.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 154, minWidth: 154 }}>
                <div className="aspect-[2/3] skeleton rounded-xl" />
                <div className="pt-2 px-1">
                  <div className="h-3 w-24 skeleton rounded mt-1" />
                </div>
              </div>
            ))
          : items.map((item) => (
              <MediaCard
                key={`${item.id}-${mediaType}`}
                item={item}
                mediaType={mediaType}
                onClick={onCardClick}
              />
            ))}
      </div>
    </div>
  );
}
