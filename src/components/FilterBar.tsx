import { ChevronDown } from "lucide-react";
import type { TMDBGenre } from "@/lib/tmdb";

const LANGUAGES = [
  { value: "", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
];

const currentYear = new Date().getFullYear();
const YEARS = ["", ...Array.from({ length: 30 }, (_, i) => String(currentYear - i))];

export interface FilterState {
  genre: string;
  year: string;
  language: string;
  sort: string;
}

interface FilterBarProps {
  genres: TMDBGenre[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

function SelectField({
  value,
  onChange,
  options,
  testId,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  testId: string;
}) {
  return (
    <div className="relative">
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/6 border border-white/10 text-white text-xs rounded-xl pl-3 pr-7 py-2 outline-none focus:border-primary/40 cursor-pointer min-w-28"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0f0f12]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
    </div>
  );
}

export function FilterBar({ genres, filters, onChange }: FilterBarProps) {
  const genreOptions = [
    { value: "", label: "All Genres" },
    ...genres.map((g) => ({ value: String(g.id), label: g.name })),
  ];
  const yearOptions = YEARS.map((y) => ({ value: y, label: y || "All Years" }));

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 md:px-6 mb-6">
      <span className="text-xs text-white/30 mr-1">Filter:</span>
      <SelectField
        value={filters.genre}
        onChange={(v) => onChange({ ...filters, genre: v })}
        options={genreOptions}
        testId="filter-genre"
      />
      <SelectField
        value={filters.year}
        onChange={(v) => onChange({ ...filters, year: v })}
        options={yearOptions}
        testId="filter-year"
      />
      <SelectField
        value={filters.language}
        onChange={(v) => onChange({ ...filters, language: v })}
        options={LANGUAGES}
        testId="filter-language"
      />
      <SelectField
        value={filters.sort}
        onChange={(v) => onChange({ ...filters, sort: v })}
        options={SORT_OPTIONS}
        testId="filter-sort"
      />
      {(filters.genre || filters.year || filters.language || filters.sort !== "popularity.desc") && (
        <button
          data-testid="btn-clear-filters"
          onClick={() => onChange({ genre: "", year: "", language: "", sort: "popularity.desc" })}
          className="text-xs text-primary hover:text-primary/80 transition-colors ml-1"
        >
          Clear
        </button>
      )}
    </div>
  );
}
