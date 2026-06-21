import { ArrowRight } from "lucide-react";

interface Genre {
  id: number;
  name: string;
}

interface GenreGridProps {
  genres: Genre[];
  onSelect: (genreId: string) => void;
  selectedId?: string;
}

const GENRE_EMOJI: Record<string, string> = {
  Action: "🎬",
  Adventure: "🏔️",
  Animation: "🎨",
  Comedy: "😂",
  Crime: "🔫",
  Documentary: "🎥",
  Drama: "🎭",
  Family: "👨‍👩‍👧",
  Fantasy: "✨",
  History: "📜",
  Horror: "👻",
  Music: "🎵",
  Mystery: "🔍",
  Romance: "❤️",
  "Science Fiction": "🚀",
  Thriller: "😱",
  War: "⚔️",
  Western: "🤠",
  "Action & Adventure": "🎬",
  Kids: "🧒",
  News: "📰",
  Reality: "📺",
  "Sci-Fi & Fantasy": "🚀",
  Soap: "🧼",
  Talk: "🎙️",
  "War & Politics": "⚔️",
  "TV Movie": "📽️",
};

export function GenreGrid({ genres, onSelect, selectedId }: GenreGridProps) {
  if (!genres.length) return null;

  return (
    <div className="px-4 md:px-6 mb-8">
      <h2 className="text-base font-semibold text-white/90 tracking-tight mb-4">
        Explore by Genre
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {genres.map((genre) => {
          const isActive = selectedId === String(genre.id);
          const emoji = GENRE_EMOJI[genre.name] ?? "🎞️";
          return (
            <button
              key={genre.id}
              onClick={() => onSelect(isActive ? "" : String(genre.id))}
              style={{
                background: isActive
                  ? "rgba(124,58,237,0.25)"
                  : "rgba(255,255,255,0.04)",
                border: isActive
                  ? "1px solid rgba(124,58,237,0.6)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.07)";
                }
              }}
            >
              <span style={{ fontSize: "24px", lineHeight: 1 }}>{emoji}</span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: isActive ? "rgb(167,139,250)" : "rgba(255,255,255,0.75)",
                  }}
                >
                  {genre.name}
                </span>
                <ArrowRight
                  style={{
                    width: "14px",
                    height: "14px",
                    color: isActive ? "rgb(167,139,250)" : "rgba(255,255,255,0.25)",
                    flexShrink: 0,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
