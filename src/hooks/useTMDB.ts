import { useState, useEffect } from "react";
import { tmdb } from "@/lib/tmdb";
import type { TMDBResponse, TMDBMovieDetail, TMDBShowDetail, TMDBSeasonDetail, TMDBGenreResponse } from "@/lib/tmdb";

export function useTMDBFetch<T>(endpoint: string, params: Record<string, string | number> = {}, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    tmdb.get<T>(endpoint, params)
      .then((res) => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(String(e)); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, ...deps]);

  return { data, loading, error };
}

export function useTrending(mediaType: "all" | "movie" | "tv" = "all") {
  return useTMDBFetch<TMDBResponse>(`/trending/${mediaType}/day`, {}, [mediaType]);
}

export function usePopularMovies(page = 1) {
  return useTMDBFetch<TMDBResponse>("/movie/popular", { page }, [page]);
}

export function useTopRatedMovies(page = 1) {
  return useTMDBFetch<TMDBResponse>("/movie/top_rated", { page }, [page]);
}

export function useNowPlayingMovies() {
  return useTMDBFetch<TMDBResponse>("/movie/now_playing", {}, []);
}

export function useUpcomingMovies() {
  return useTMDBFetch<TMDBResponse>("/movie/upcoming", {}, []);
}

export function usePopularShows(page = 1) {
  return useTMDBFetch<TMDBResponse>("/tv/popular", { page }, [page]);
}

export function useTopRatedShows(page = 1) {
  return useTMDBFetch<TMDBResponse>("/tv/top_rated", { page }, [page]);
}

export function useAiringToday() {
  return useTMDBFetch<TMDBResponse>("/tv/airing_today", {}, []);
}

export function useMovieDetail(id: number | null) {
  const [data, setData] = useState<TMDBMovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    tmdb.get<TMDBMovieDetail>(`/movie/${id}`, { append_to_response: "release_dates" })
      .then((res) => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(String(e)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error };
}

export function useShowDetail(id: number | null) {
  const [data, setData] = useState<TMDBShowDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    tmdb.get<TMDBShowDetail>(`/tv/${id}`, { append_to_response: "content_ratings" })
      .then((res) => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(String(e)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error };
}

export function useSeasonDetail(showId: number | null, seasonNumber: number | null) {
  const [data, setData] = useState<TMDBSeasonDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showId || seasonNumber === null) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    tmdb.get<TMDBSeasonDetail>(`/tv/${showId}/season/${seasonNumber}`)
      .then((res) => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [showId, seasonNumber]);

  return { data, loading };
}

export function useMovieGenres() {
  return useTMDBFetch<TMDBGenreResponse>("/genre/movie/list", {}, []);
}

export function useShowGenres() {
  return useTMDBFetch<TMDBGenreResponse>("/genre/tv/list", {}, []);
}

export function useDiscover(
  mediaType: "movie" | "tv",
  params: Record<string, string | number>
) {
  const key = JSON.stringify(params);
  return useTMDBFetch<TMDBResponse>(`/discover/${mediaType}`, params, [key]);
}

export function useSearch(query: string, page = 1) {
  const [data, setData] = useState<TMDBResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    tmdb.get<TMDBResponse>("/search/multi", { query, page })
      .then((res) => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query, page]);

  return { data, loading };
}
