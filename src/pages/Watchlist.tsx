import { useState } from "react";
import { Bookmark, Trash2, Film, Tv } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";
import { MediaModal } from "@/components/MediaModal";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { TMDBMovie } from "@/lib/tmdb";

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [selected, setSelected] = useState<{ item: TMDBMovie; type: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const filtered = watchlist.filter((item) =>
    filter === "all" ? true : item.media_type === filter
  );

  const movies = watchlist.filter((w) => w.media_type === "movie");
  const shows = watchlist.filter((w) => w.media_type === "tv");

  return (
    <div className="pt-6 px-4 md:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Bookmark className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black text-white">My Watchlist</h1>
        </div>
        <p className="text-sm text-white/40">
          {watchlist.length} saved — {movies.length} movies, {shows.length} shows
        </p>
      </div>

      {watchlist.length > 0 && (
        <div className="flex gap-2 mb-6">
          {(["all", "movie", "tv"] as const).map((f) => (
            <button
              key={f}
              data-testid={`filter-watchlist-${f}`}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === f
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-white/5 border-white/8 text-white/50 hover:text-white"
              }`}
            >
              {f === "movie" && <Film className="w-3.5 h-3.5" />}
              {f === "tv" && <Tv className="w-3.5 h-3.5" />}
              {f === "all" ? "All" : f === "movie" ? "Movies" : "TV Shows"}
              <span className="text-xs opacity-60 ml-1">
                {f === "all" ? watchlist.length : f === "movie" ? movies.length : shows.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Bookmark className="w-9 h-9 text-white/20" />
          </div>
          <h2 className="text-lg font-semibold text-white/50 mb-2">
            {watchlist.length === 0 ? "Your watchlist is empty" : "No items match this filter"}
          </h2>
          <p className="text-sm text-white/25 max-w-sm">
            {watchlist.length === 0
              ? "Browse movies and shows, then click + Watchlist to save them here"
              : "Try switching to 'All' to see all your saved items"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
          {filtered.map((item) => (
            <div key={`${item.id}-${item.media_type}`} className="relative group/wl">
              <MediaCard
                item={item}
                mediaType={item.media_type || "movie"}
                onClick={(i, t) => setSelected({ item: i, type: t })}
              />
              <button
                data-testid={`btn-remove-watchlist-${item.id}`}
                onClick={() => removeFromWatchlist(item.id, item.media_type || "movie")}
                className="absolute bottom-8 right-1 opacity-0 group-hover/wl:opacity-100 transition-opacity w-7 h-7 rounded-full bg-destructive/80 hover:bg-destructive flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaModal
        item={selected?.item || null}
        mediaType={selected?.type || "movie"}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
