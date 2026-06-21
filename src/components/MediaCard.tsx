import { Star, Plus, Check } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";
import { useWatchlist } from "@/hooks/useWatchlist";

interface MediaCardProps {
  item: TMDBMovie;
  mediaType: string;
  onClick: (item: TMDBMovie, type: string) => void;
}

export function MediaCard({ item, mediaType, onClick }: MediaCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const type = item.media_type || mediaType;
  const title = item.title || item.name || "Unknown";
  const posterUrl = tmdb.posterUrl(item.poster_path, "w342");
  const inWatchlist = isInWatchlist(item.id, type);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(item, type);
  };

  return (
    <div
      data-testid={`card-media-${item.id}`}
      className="relative flex-shrink-0 cursor-pointer group card-hover rounded-xl overflow-hidden"
      style={{ width: 154, minWidth: 154 }}
      onClick={() => onClick(item, type)}
    >
      {/* Poster */}
      <div className="aspect-[2/3] bg-white/5 relative overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-white/20 text-xs text-center px-2">{title}</span>
          </div>
        )}

        {/* Rating overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-white">
            {item.vote_average?.toFixed(1) ?? "—"}
          </span>
        </div>

        {/* Watchlist button */}
        <button
          data-testid={`btn-watchlist-${item.id}`}
          onClick={handleWatchlist}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
            inWatchlist
              ? "bg-primary text-white"
              : "bg-black/70 backdrop-blur-sm text-white hover:bg-primary"
          }`}
        >
          {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <div className="px-1 pt-2 pb-1">
        <p className="text-xs font-medium text-white/80 leading-tight line-clamp-2">{title}</p>
      </div>
    </div>
  );
}
