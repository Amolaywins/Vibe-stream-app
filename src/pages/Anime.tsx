import { useState } from "react";
import { MediaCard } from "@/components/MediaCard";
import { MediaModal } from "@/components/MediaModal";
import { ContentRow } from "@/components/ContentRow";
import { useDiscover } from "@/hooks/useTMDB";
import type { TMDBMovie } from "@/lib/tmdb";
import { Sparkles } from "lucide-react";

const ANIME_PARAMS_TV = {
  with_genres: "16",
  with_original_language: "ja",
  sort_by: "popularity.desc",
  "vote_count.gte": 50,
};
const ANIME_PARAMS_MOVIE = {
  with_genres: "16",
  with_original_language: "ja",
  sort_by: "popularity.desc",
  "vote_count.gte": 20,
};
const ANIME_TOPRATED = {
  with_genres: "16",
  with_original_language: "ja",
  sort_by: "vote_average.desc",
  "vote_count.gte": 200,
};

interface AnimeProps {
  onRecordWatch: (item: TMDBMovie, type: string, opts?: { season?: number; episode?: number; episode_name?: string }) => void;
}

export default function Anime({ onRecordWatch }: AnimeProps) {
  const [selected, setSelected] = useState<{ item: TMDBMovie; type: string } | null>(null);

  const { data: animeSeries, loading: tvLoading } = useDiscover("tv", ANIME_PARAMS_TV);
  const { data: animeMovies, loading: movieLoading } = useDiscover("movie", ANIME_PARAMS_MOVIE);
  const { data: topRated, loading: trLoading } = useDiscover("tv", ANIME_TOPRATED);

  const handleOpen = (item: TMDBMovie, type: string) => setSelected({ item, type });

  return (
    <div className="pt-6">
      <div className="px-4 md:px-6 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black text-white">Anime</h1>
        </div>
        <p className="text-sm text-white/40">Japanese animation — series and films</p>
      </div>

      <ContentRow
        title="Popular Anime Series"
        items={animeSeries?.results || []}
        mediaType="tv"
        loading={tvLoading}
        onCardClick={handleOpen}
      />
      <ContentRow
        title="Top Rated Anime"
        items={topRated?.results || []}
        mediaType="tv"
        loading={trLoading}
        onCardClick={handleOpen}
      />
      <ContentRow
        title="Anime Movies"
        items={animeMovies?.results || []}
        mediaType="movie"
        loading={movieLoading}
        onCardClick={handleOpen}
      />

      <div className="px-4 md:px-6 mt-4">
        <h2 className="text-base font-semibold text-white/90 mb-4">All Anime Series</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
          {tvLoading
            ? Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <div className="aspect-[2/3] skeleton rounded-xl" />
                </div>
              ))
            : (animeSeries?.results || []).map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  mediaType="tv"
                  onClick={handleOpen}
                />
              ))}
        </div>
      </div>

      <MediaModal
        item={selected?.item || null}
        mediaType={selected?.type || "tv"}
        onClose={() => setSelected(null)}
        onRecordWatch={onRecordWatch}
      />
    </div>
  );
}
