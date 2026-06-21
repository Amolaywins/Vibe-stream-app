import { useEffect, useRef, useState } from "react";
import { Search, X, Film, Tv, TrendingUp } from "lucide-react";
import { tmdb, GENRE_MAP } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";
import { useSearch, useTrending } from "@/hooks/useTMDB";
import { Star } from "lucide-react";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: TMDBMovie, type: string) => void;
}

function ResultCard({ item, onSelect, onClose }: { item: TMDBMovie; onSelect: (i: TMDBMovie, t: string) => void; onClose: () => void }) {
  const type = item.media_type || "movie";
  const title = item.title || item.name || "";
  const posterUrl = tmdb.posterUrl(item.poster_path, "w185");
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const genres = (item.genre_ids || []).slice(0, 2).map((id) => GENRE_MAP[id]).filter(Boolean);

  return (
    <button
      data-testid={`search-result-${item.id}`}
      onClick={() => { onSelect(item, type); onClose(); }}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/6 transition-all text-left group"
    >
      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
        {posterUrl
          ? <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-white/20" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${type === "tv" ? "bg-blue-500/15 text-blue-400" : "bg-yellow-500/15 text-yellow-400"}`}>
            {type === "tv" ? "TV" : "MOVIE"}
          </span>
          {year && <span className="text-xs text-white/35">{year}</span>}
          {genres.length > 0 && <span className="text-xs text-white/30">{genres.join(" · ")}</span>}
        </div>
      </div>
      {item.vote_average > 0 && (
        <span className="flex items-center gap-1 text-xs text-yellow-400 flex-shrink-0">
          <Star className="w-3 h-3 fill-yellow-400" />
          {item.vote_average.toFixed(1)}
        </span>
      )}
    </button>
  );
}

export function SearchOverlay({ open, onClose, onSelect }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: searchData, loading: searchLoading } = useSearch(query);
  const { data: trending } = useTrending("all");

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const results = (searchData?.results || []).filter(
    (r) => r.media_type !== "person" && (r.poster_path || r.backdrop_path)
  );
  const trendingItems = (trending?.results || []).slice(0, 6);
  const showResults = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col modal-backdrop bg-black/75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl mx-auto mt-16 md:mt-24 mx-4 rounded-2xl overflow-hidden fade-in"
        style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.08)", maxWidth: "42rem", margin: "5rem auto 0" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/6">
          <Search className="w-5 h-5 text-white/35 flex-shrink-0" />
          <input
            ref={inputRef}
            data-testid="search-overlay-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, shows, anime…"
            className="flex-1 bg-transparent text-white placeholder-white/30 text-base outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            data-testid="btn-search-close"
            onClick={onClose}
            className="text-xs text-white/30 hover:text-white border border-white/10 px-2 py-1 rounded-lg transition-colors ml-1"
          >
            ESC
          </button>
        </div>

        {/* Results / suggestions */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {showResults ? (
            searchLoading ? (
              <div className="px-4 py-8 text-center text-white/30 text-sm">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/30 text-sm">No results for "{query}"</div>
            ) : (
              <>
                <p className="px-4 py-1.5 text-xs font-semibold text-white/25 uppercase tracking-widest">Results</p>
                {results.slice(0, 10).map((item) => (
                  <ResultCard key={`${item.id}-${item.media_type}`} item={item} onSelect={onSelect} onClose={onClose} />
                ))}
              </>
            )
          ) : (
            <>
              <div className="flex items-center gap-1.5 px-4 py-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-white/25" />
                <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">Trending</p>
              </div>
              {trendingItems.map((item) => (
                <ResultCard key={`${item.id}-${item.media_type}`} item={item} onSelect={onSelect} onClose={onClose} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
