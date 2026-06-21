import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { TMDBMovie } from "@/lib/tmdb";

export interface WatchlistItem extends TMDBMovie {
  added_at: string;
  media_type: string;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useLocalStorage<WatchlistItem[]>("streamly_watchlist", []);

  const addToWatchlist = useCallback(
    (item: TMDBMovie, mediaType: string) => {
      setWatchlist((prev) => {
        const exists = prev.some((w) => w.id === item.id && w.media_type === mediaType);
        if (exists) return prev;
        return [{ ...item, media_type: mediaType, added_at: new Date().toISOString() }, ...prev];
      });
    },
    [setWatchlist]
  );

  const removeFromWatchlist = useCallback(
    (id: number, mediaType: string) => {
      setWatchlist((prev) => prev.filter((w) => !(w.id === id && w.media_type === mediaType)));
    },
    [setWatchlist]
  );

  const isInWatchlist = useCallback(
    (id: number, mediaType: string) => watchlist.some((w) => w.id === id && w.media_type === mediaType),
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (item: TMDBMovie, mediaType: string) => {
      if (isInWatchlist(item.id, mediaType)) {
        removeFromWatchlist(item.id, mediaType);
      } else {
        addToWatchlist(item, mediaType);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist };
}
