import { useState } from "react";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { MediaCard } from "@/components/MediaCard";
import { MediaModal } from "@/components/MediaModal";
import { ContentRow } from "@/components/ContentRow";
import { GenreGrid } from "@/components/GenreGrid";
import {
  useMovieGenres,
  useDiscover,
  usePopularMovies,
  useTopRatedMovies,
  useNowPlayingMovies,
  useUpcomingMovies,
} from "@/hooks/useTMDB";
import type { TMDBMovie } from "@/lib/tmdb";
import { Film } from "lucide-react";

interface MoviesProps {
  onRecordWatch: (item: TMDBMovie, type: string, opts?: { season?: number; episode?: number; episode_name?: string }) => void;
}

export default function Movies({ onRecordWatch }: MoviesProps) {
  const [selected, setSelected] = useState<{ item: TMDBMovie; type: string } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    genre: "", year: "", language: "", sort: "popularity.desc",
  });

  const { data: genreData } = useMovieGenres();

  const isFiltered = !!(filters.genre || filters.year || filters.language || filters.sort !== "popularity.desc");

  const params: Record<string, string | number> = {
    sort_by: filters.sort,
    ...(filters.genre ? { with_genres: filters.genre } : {}),
    ...(filters.year ? { primary_release_year: filters.year } : {}),
    ...(filters.language ? { with_original_language: filters.language } : {}),
    "vote_count.gte": 100,
  };

  const { data: filteredData, loading: filteredLoading } = useDiscover("movie", params);
  const { data: popular, loading: popularLoading } = usePopularMovies(1);
  const { data: popular2, loading: popular2Loading } = usePopularMovies(2);
  const { data: topRated, loading: topLoading } = useTopRatedMovies(1);
  const { data: topRated2, loading: topLoading2 } = useTopRatedMovies(2);
  const { data: nowPlaying, loading: nowLoading } = useNowPlayingMovies();
  const { data: upcoming, loading: upcomingLoading } = useUpcomingMovies();

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
          <Film className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black text-white">Movies</h1>
        </div>
        <p className="text-sm text-white/40">Discover and explore films from around the world</p>
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
                <MediaCard key={item.id} item={item} mediaType="movie" onClick={handleCardClick} />
              ))}
            </div>
          )}
          {!filteredLoading && !filteredData?.results?.length && (
            <div className="flex flex-col items-center justify-center py-24 text-white/30">
              <Film className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No movies match these filters</p>
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
            mediaType="movie"
            loading={popularLoading && popular2Loading}
            onCardClick={handleCardClick}
          />
          <ContentRow
            title="Top Rated All Time"
            items={topRatedItems}
            mediaType="movie"
            loading={topLoading && topLoading2}
            onCardClick={handleCardClick}
          />
          <ContentRow
            title="Now Playing in Theaters"
            items={nowPlaying?.results || []}
            mediaType="movie"
            loading={nowLoading}
            onCardClick={handleCardClick}
          />
          <ContentRow
            title="Coming Soon"
            items={upcoming?.results || []}
            mediaType="movie"
            loading={upcomingLoading}
            onCardClick={handleCardClick}
          />
        </>
      )}

      <MediaModal
        item={selected?.item || null}
        mediaType={selected?.type || "movie"}
        onClose={() => setSelected(null)}
        onRecordWatch={onRecordWatch}
      />
    </div>
  );
}
