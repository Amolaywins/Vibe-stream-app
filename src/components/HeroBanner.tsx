import { useState, useEffect } from "react";
import { Play, Plus, Check, Star, Info, Search, Clock } from "lucide-react";
import { tmdb, GENRE_MAP } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";
import { useWatchlist } from "@/hooks/useWatchlist";

interface HeroBannerProps {
  items: TMDBMovie[];
  onWatch: (item: TMDBMovie, type: string) => void;
  onOpenSearch?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export function HeroBanner({ items, onWatch, onOpenSearch, onOpenHistory, historyCount = 0 }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % Math.min(items.length, 5));
    }, 9000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) {
    return (
      <div className="relative w-full h-[60vh] md:h-[85vh] skeleton rounded-none" />
    );
  }

  const item = items[current];
  const title = item.title || item.name || "";
  const type = item.media_type || "movie";
  const backdropUrl = tmdb.backdropUrl(item.backdrop_path, "original");
  const genres = (item.genre_ids || []).slice(0, 4).map((id) => GENRE_MAP[id]).filter(Boolean);
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const rating = item.vote_average?.toFixed(1);
  const inWatchlist = isInWatchlist(item.id, type);

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        {backdropUrl && (
          <img
            key={item.id}
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-top transition-opacity duration-1000"
          />
        )}
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Top-right action buttons (search + history) */}
      {(onOpenSearch || onOpenHistory) && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {onOpenHistory && (
            <button
              data-testid="btn-hero-history"
              onClick={onOpenHistory}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white hover:text-primary transition-all"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
            >
              <Clock className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center">
                  {historyCount > 9 ? "9+" : historyCount}
                </span>
              )}
            </button>
          )}
          {onOpenSearch && (
            <button
              data-testid="btn-hero-search"
              onClick={onOpenSearch}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white hover:text-primary transition-all"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-4 md:px-10 pb-16 md:pb-0 fade-in">
        <div className="max-w-xl">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded border border-yellow-500/60 text-yellow-400 bg-yellow-500/10">
              {type === "movie" ? "MOVIE" : "TV SHOW"}
            </span>
            {year && (
              <span className="text-xs text-white/50 font-medium">{year}</span>
            )}
            {rating && (
              <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                {rating}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3 drop-shadow-2xl">
            {title}
          </h1>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {genres.map((g) => (
                <span key={g} className="text-xs text-white/60 bg-white/8 px-2 py-0.5 rounded-full border border-white/10">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="text-sm text-white/70 leading-relaxed mb-6 line-clamp-3 max-w-lg">
            {item.overview}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              data-testid="btn-hero-watch"
              onClick={() => onWatch(item, type)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm glow-primary transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Now
            </button>
            <button
              data-testid="btn-hero-watchlist"
              onClick={() => toggleWatchlist(item, type)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 border ${
                inWatchlist
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/8 border-white/15 text-white hover:bg-white/15"
              }`}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {inWatchlist ? "Saved" : "Watchlist"}
            </button>
            <button
              data-testid="btn-hero-info"
              onClick={() => onWatch(item, type)}
              className="w-10 h-10 rounded-xl bg-white/8 border border-white/15 text-white hover:bg-white/15 flex items-center justify-center transition-all"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-4 md:left-10 flex gap-1.5">
        {Array.from({ length: Math.min(items.length, 5) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all rounded-full ${
              i === current ? "w-6 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
