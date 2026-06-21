import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { TMDBMovie } from "@/lib/tmdb";

export interface WatchHistoryItem extends TMDBMovie {
  media_type: string;
  watched_at: string;
  season?: number;
  episode?: number;
  episode_name?: string;
}

export function useWatchHistory() {
  const [history, setHistory] = useLocalStorage<WatchHistoryItem[]>("vibestream_history", []);

  const recordWatch = useCallback(
    (
      item: TMDBMovie,
      mediaType: string,
      opts?: { season?: number; episode?: number; episode_name?: string }
    ) => {
      setHistory((prev) => {
        const filtered = prev.filter(
          (h) => !(h.id === item.id && h.media_type === mediaType &&
            h.season === opts?.season && h.episode === opts?.episode)
        );
        const entry: WatchHistoryItem = {
          ...item,
          media_type: mediaType,
          watched_at: new Date().toISOString(),
          ...(opts || {}),
        };
        return [entry, ...filtered].slice(0, 50);
      });
    },
    [setHistory]
  );

  const removeFromHistory = useCallback(
    (id: number, mediaType: string) => {
      setHistory((prev) => prev.filter((h) => !(h.id === id && h.media_type === mediaType)));
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const isInHistory = useCallback(
    (id: number, mediaType: string) => history.some((h) => h.id === id && h.media_type === mediaType),
    [history]
  );

  const getLastWatched = useCallback(
    (id: number, mediaType: string) =>
      history.find((h) => h.id === id && h.media_type === mediaType) ?? null,
    [history]
  );

  return { history, recordWatch, removeFromHistory, clearHistory, isInHistory, getLastWatched };
}
