import { useRef } from "react";
import { Clock, ChevronLeft, ChevronRight, X, Play, Trash2 } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import type { WatchHistoryItem } from "@/hooks/useWatchHistory";
import type { TMDBMovie } from "@/lib/tmdb";

interface ContinueWatchingRowProps {
  items: WatchHistoryItem[];
  onPlay: (item: TMDBMovie, type: string) => void;
  onRemove: (id: number, type: string) => void;
  onClearAll: () => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ContinueWatchingRow({ items, onPlay, onRemove, onClearAll }: ContinueWatchingRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  if (!items.length) return null;

  const scroll = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({ left: dir === "right" ? 480 : -480, behavior: "smooth" });
  };

  return (
    <div className="mb-8 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-white/90 tracking-tight">Continue Watching</h2>
          <span className="text-xs font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="btn-clear-history"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-white/35 hover:text-white/70 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
          <button onClick={() => scroll("left")} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll("right")} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div ref={rowRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2">
        {items.map((item) => {
          const title = item.title || item.name || "";
          const posterUrl = tmdb.posterUrl(item.poster_path, "w342");
          const isTV = item.media_type === "tv";

          return (
            <div
              key={`${item.id}-${item.media_type}-${item.season}-${item.episode}`}
              data-testid={`continue-watching-${item.id}`}
              className="relative flex-shrink-0 group rounded-xl overflow-hidden cursor-pointer"
              style={{ width: 154, minWidth: 154 }}
              onClick={() => onPlay(item, item.media_type)}
            >
              {/* Poster */}
              <div className="aspect-[2/3] bg-white/5 relative overflow-hidden rounded-xl">
                {posterUrl ? (
                  <img src={posterUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/20 text-xs text-center px-2">{title}</span>
                  </div>
                )}

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom gradient + progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2">
                  <div className="h-0.5 rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.random() * 50 + 20}%` }}
                    />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  data-testid={`btn-remove-history-${item.id}`}
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id, item.media_type); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Label */}
              <div className="px-1 pt-1.5 pb-0.5">
                <p className="text-xs font-medium text-white/80 leading-tight line-clamp-1">{title}</p>
                {isTV && item.season && item.episode && (
                  <p className="text-[10px] text-white/35 mt-0.5">
                    S{item.season} E{item.episode}
                    {item.episode_name ? ` · ${item.episode_name}` : ""}
                  </p>
                )}
                <p className="text-[10px] text-white/25 mt-0.5">{timeAgo(item.watched_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
