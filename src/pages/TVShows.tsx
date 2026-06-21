import { useState } from "react";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { MediaCard } from "@/components/MediaCard";
import { MediaModal } from "@/components/MediaModal";
import { ContentRow } from "@/components/ContentRow";
import { GenreGrid } from "@/components/GenreGrid";
import {
  useShowGenres,
  useDiscover,
  usePopularShows,
  useTopRatedShows,
  useAiringToday,
  useTMDBFetch,
} from "@/hooks/useTMDB";
import type { TMDBMovie, TMDBResponse } from "@/lib/tmdb";
import { Tv } from "lucide-react";

interface TVShowsProps {
  onRecordWatch: (item: TMDBMovie, type: string, opts?: { season?: number; episode?: number; episode_name?: string }) => void;
}

export default function TVShows({ onRecordWatch }: TVShowsProps) {
  const [selected, setSelected] = useState<{ item: TMDBMovie; type: string } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    genre: "", year: "", language: "", sort: "popularity.desc",
  });

  const { data: genreData } = useShowGenres();

  const isFiltered = !!(filters.genre || filters.year || filters.language || filters.sort !== "popularity.desc");

  const params: Record<string, string | number> = {
    sort_by: filters.sort,
    ...(filters.genre ? { with_genres: filters.genre } : {}),
    ...(filters.year ? { first_air_date_year: filters.year } : {}),
    ...(filters.language ? { with_original_language: filters.language } : {}),
    "vote_count.gte": 50,
  };

  const { data: filteredData, loading: filteredLoading } = useDiscover("tv", params);
  const { data: popular, loading: popularLoading } = usePopularShows(1);
  const { data: popular2, loading: popular2Loading } = usePopularShows(2);
  const { data: topRated, loading: topLoading } = useTopRatedShows(1);
  const { data: topRated2, loading: topLoading2 } = useTopRatedShows(2);
  const { data: airingToday, loading: airingLoading } = useAiringToday();
  const { data: onTheAir, loading: onAirLoading } = useTMDBFetch<TMDBResponse>("/tv/on_the_air", {}, []);

  const popularItems = [
    ...(popular?.results || []),
    ...(popular2?.results || []),
  ];
  const topRatedItems = [
    ...(topRated?.results || []),
    ...(topRated2?.results || []),
  ];

  const handleCardClick = (item: TMDBMovie, type: string) => setSelected({ item, type });

  const handleGenreSelect = (genreId: string) => {
    setFilters((f) => ({ ...f, genre: genreId, sort: genreId ? "popularity.desc" : f.sort }));
  };

  return (
    <div className="pt-6">
      <div className="px-4 md:px-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Tv className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black text-white">TV Shows</h1>
        </div>
        <p className="text-sm text-white/40">Browse series, seasons and episodes</p>
      </div>

      <FilterBar
        genres={genreData?.genres || []}
        filters={filters}
        onChange={setFilters}
      />

      {isFiltered ? (
        <div className="px-4 md:px-6">
          {filteredLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <div className="aspect-[2/3] skeleton rounded-xl" />
                  <div className="pt-2"><div className="h-3 w-20 skeleton rounded" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
              {(filteredData?.results || []).map((item) => (
                <MediaCard key={item.id} item={item} mediaType="tv" onClick={handleCardClick} />
              ))}
            </div>
          )}
          {!filteredLoading && !filteredData?.results?.length && (
            <div className="flex flex-col items-center justify-center py-24 text-white/30">
              <Tv className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No shows match these filters</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <GenreGrid
            genres={genreData?.genres || []}
            onSelect={handleGenreSelect}
            selectedId={filters.genre}
          />

          <ContentRow
            title="Popular Right Now"
            items={popularItems}
            mediaType="tv"
            loading={popularLoading && popular2Loading}
            onCardClick={handleCardClick}
          />
          <ContentRow
            title="Top Rated Series"
            items={topRatedItems}
            mediaType="tv"
            loading={topLoading && topLoading2}
            onCardClick={handleCardClick}
          />
          <ContentRow
            title="Airing Today"
            items={airingToday?.results || []}
            mediaType="tv"
            loading={airingLoading}
            onCardClick={handleCardClick}
          />
          <ContentRow
            title="Currently On Air"
            items={onTheAir?.results || []}
            mediaType="tv"
            loading={onAirLoading}
            onCardClick={handleCardClick}
          />
        </>
      )}

      <MediaModal
        item={selected?.item || null}
        mediaType={selected?.type || "tv"}
        onClose={() => setSelected(null)}
        onRecordWatch={onRecordWatch}
      />
    </div>
  );
}
