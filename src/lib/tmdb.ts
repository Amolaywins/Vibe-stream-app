const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

export const tmdb = {
  posterUrl: (path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w342") =>
    path ? `${IMG_BASE}/${size}${path}` : null,

  backdropUrl: (path: string | null, size: "w780" | "w1280" | "original" = "w1280") =>
    path ? `${IMG_BASE}/${size}${path}` : null,

  async get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set("api_key", API_KEY);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    return res.json();
  },
};

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
  adult?: boolean;
  original_language?: string;
  popularity?: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

export interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  runtime: number | null;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
}

export interface TMDBSeasonDetail {
  id: number;
  season_number: number;
  name: string;
  episodes: TMDBEpisode[];
}

export interface TMDBShowDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genres: TMDBGenre[];
  seasons: TMDBSeason[];
  number_of_seasons: number;
  content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genres: TMDBGenre[];
  runtime: number | null;
  release_dates?: {
    results: {
      iso_3166_1: string;
      release_dates: { certification: string; type: number }[];
    }[];
  };
}

export const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};
