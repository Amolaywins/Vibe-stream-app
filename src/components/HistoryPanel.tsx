import { X, Clock, Trash2, Film, Tv, Play } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import type { WatchHistoryItem } from "@/hooks/useWatchHistory";
import type { TMDBMovie } from "@/lib/tmdb";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  history: WatchHistoryItem[];
  onPlay: (item: TMDBMovie, type: string) => void;
  onRemove: (id: number, type: string) => void;
  onClear: () => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function HistoryPanel({ open, onClose, history, onPlay, onRemove, onClear }: HistoryPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 modal-backdrop" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col fade-in"
        style={{ background: "#0f0f12", borderLeft: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-white text-sm">Watch History</span>
            {history.length > 0 && (
              <span className="text-xs font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                data-testid="btn-clear-all-history"
                onClick={onClear}
                className="text-xs text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
            <button
              data-testid="btn-history-close"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/50 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Clock className="w-10 h-10 text-white/10 mb-3" />
              <p className="text-sm text-white/30 font-medium">No watch history yet</p>
              <p className="text-xs text-white/20 mt-1">Start watching to see your history here</p>
            </div>
          ) : (
            history.map((item, i) => {
              const title = item.title || item.name || "";
              const posterUrl = tmdb.posterUrl(item.poster_path, "w185");
              const isTV = item.media_type === "tv";

              return (
                <div
                  key={`${item.id}-${item.media_type}-${i}`}
                  data-testid={`history-item-${item.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/4 group cursor-pointer transition-all"
                  onClick={() => { onPlay(item, item.media_type); onClose(); }}
                >
                  {/* Poster */}
                  <div className="relative w-9 h-13 rounded-lg overflow-hidden flex-shrink-0 bg-white/5" style={{ height: "3.25rem" }}>
                    {posterUrl
                      ? <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">{isTV ? <Tv className="w-3 h-3 text-white/20" /> : <Film className="w-3 h-3 text-white/20" />}</div>
                    }
                    <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/85 line-clamp-1 group-hover:text-white transition-colors">{title}</p>
                    {isTV && item.season && item.episode && (
                      <p className="text-[10px] text-white/35 mt-0.5">
                        S{item.season} · E{item.episode}
                        {item.episode_name ? ` — ${item.episode_name}` : ""}
                      </p>
                    )}
                    <p className="text-[10px] text-white/25 mt-0.5">{timeAgo(item.watched_at)}</p>
                  </div>

                  {/* Remove */}
                  <button
                    data-testid={`btn-remove-history-panel-${item.id}`}
                    onClick={(e) => { e.stopPropagation(); onRemove(item.id, item.media_type); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg bg-white/6 hover:bg-destructive/70 flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-3 h-3 text-white/60" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
