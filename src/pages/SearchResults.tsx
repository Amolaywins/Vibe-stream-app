import { useState } from "react";
import { Search } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";
import { MediaModal } from "@/components/MediaModal";
import { useSearch } from "@/hooks/useTMDB";
import type { TMDBMovie } from "@/lib/tmdb";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [selected, setSelected] = useState<{ item: TMDBMovie; type: string } | null>(null);
  const { data, loading } = useSearch(query);

  const results = (data?.results || []).filter(
    (r) => r.media_type !== "person" && r.poster_path
  );

  return (
    <div className="min-h-screen pt-6 px-4 md:px-6 fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-white/40" />
          <h2 className="text-lg font-semibold text-white/80">
            Results for <span className="text-white">"{query}"</span>
          </h2>
        </div>
        {!loading && (
          <p className="text-sm text-white/30">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="aspect-[2/3] skeleton rounded-xl" />
              <div className="pt-2">
                <div className="h-3 w-20 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-white/30">
          <Search className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No results found for "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
          {results.map((item) => (
            <MediaCard
              key={`${item.id}-${item.media_type}`}
              item={item}
              mediaType={item.media_type || "movie"}
              onClick={(i, t) => setSelected({ item: i, type: t })}
            />
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
