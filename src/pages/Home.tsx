import { useState } from "react";
import { HeroBanner } from "@/components/HeroBanner";
import { ContentRow } from "@/components/ContentRow";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { MediaModal } from "@/components/MediaModal";
import { useTrending, usePopularMovies, useTopRatedMovies, usePopularShows, useNowPlayingMovies } from "@/hooks/useTMDB";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import type { TMDBMovie } from "@/lib/tmdb";

interface HomeProps {
  onRecordWatch: (item: TMDBMovie, type: string, opts?: { season?: number; episode?: number; episode_name?: string }) => void;
  onOpenSearch?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export default function Home({ onRecordWatch, onOpenSearch, onOpenHistory, historyCount = 0 }: HomeProps) {
  const [selected, setSelected] = useState<{ item: TMDBMovie; type: string } | null>(null);
  const { data: trending, loading: trendingLoading } = useTrending("all");
  const { data: popularMovies, loading: pmLoading } = usePopularMovies();
  const { data: topRated, loading: trLoading } = useTopRatedMovies();
  const { data: popularShows, loading: psLoading } = usePopularShows();
  const { data: nowPlaying, loading: npLoading } = useNowPlayingMovies();
  const { history, removeFromHistory, clearHistory } = useWatchHistory();

  const handleOpen = (item: TMDBMovie, type: string) => setSelected({ item, type });
  const handleClose = () => setSelected(null);

  return (
    <div>
      <HeroBanner
        items={trending?.results?.slice(0, 5) || []}
        onWatch={handleOpen}
        onOpenSearch={onOpenSearch}
        onOpenHistory={onOpenHistory}
        historyCount={historyCount}
      />

      <div className="mt-4">
        <ContinueWatchingRow
          items={history}
          onPlay={handleOpen}
          onRemove={removeFromHistory}
          onClearAll={clearHistory}
        />
        <ContentRow title="Trending Now" items={trending?.results || []} mediaType="movie" loading={trendingLoading} onCardClick={handleOpen} />
        <ContentRow title="Now Playing" items={nowPlaying?.results || []} mediaType="movie" loading={npLoading} onCardClick={handleOpen} />
        <ContentRow title="Popular Movies" items={popularMovies?.results || []} mediaType="movie" loading={pmLoading} onCardClick={handleOpen} />
        <ContentRow title="Top Rated Movies" items={topRated?.results || []} mediaType="movie" loading={trLoading} onCardClick={handleOpen} />
        <ContentRow title="Popular TV Shows" items={popularShows?.results || []} mediaType="tv" loading={psLoading} onCardClick={handleOpen} />
      </div>

      <MediaModal item={selected?.item || null} mediaType={selected?.type || "movie"} onClose={handleClose} onRecordWatch={onRecordWatch} />
    </div>
  );
}
