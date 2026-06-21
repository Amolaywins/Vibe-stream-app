import { useState, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Search, Clock } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SearchOverlay } from "@/components/SearchOverlay";
import { HistoryPanel } from "@/components/HistoryPanel";
import { MediaModal } from "@/components/MediaModal";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Movies from "@/pages/Movies";
import TVShows from "@/pages/TVShows";
import Anime from "@/pages/Anime";
import Watchlist from "@/pages/Watchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import type { TMDBMovie } from "@/lib/tmdb";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [quickPlay, setQuickPlay] = useState<{ item: TMDBMovie; type: string } | null>(null);

  const { history, recordWatch, removeFromHistory, clearHistory } = useWatchHistory();

  const handleRecordWatch = useCallback(
    (item: TMDBMovie, type: string, opts?: { season?: number; episode?: number; episode_name?: string }) => {
      recordWatch(item, type, opts);
    },
    [recordWatch]
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0a0c" }}>
      <Sidebar />

      {/* Fixed top-right action buttons — always visible over all content */}
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
        <button
          data-testid="btn-open-history"
          onClick={() => setHistoryOpen(true)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: "rgba(124,58,237,0.35)", border: "1px solid rgba(124,58,237,0.7)", backdropFilter: "blur(12px)" }}
        >
          <Clock className="w-5 h-5 text-white" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center">
              {history.length > 9 ? "9+" : history.length}
            </span>
          )}
        </button>
        <button
          data-testid="btn-open-search"
          onClick={() => setSearchOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: "rgba(124,58,237,0.35)", border: "1px solid rgba(124,58,237,0.7)", backdropFilter: "blur(12px)" }}
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 md:ml-56 mb-16 md:mb-0 min-h-screen flex flex-col">
        {/* Page content */}
        <main className="flex-1">

          <Switch>
            <Route path="/">
              {() => (
                <Home
                  onRecordWatch={handleRecordWatch}
                  onOpenSearch={() => setSearchOpen(true)}
                  onOpenHistory={() => setHistoryOpen(true)}
                  historyCount={history.length}
                />
              )}
            </Route>
            <Route path="/movies">
              {() => <Movies onRecordWatch={handleRecordWatch} />}
            </Route>
            <Route path="/tv">
              {() => <TVShows onRecordWatch={handleRecordWatch} />}
            </Route>
            <Route path="/anime">
              {() => <Anime onRecordWatch={handleRecordWatch} />}
            </Route>
            <Route path="/watchlist" component={Watchlist} />
            <Route>
              <div className="flex items-center justify-center min-h-[60vh] text-white/30">
                Page not found
              </div>
            </Route>
          </Switch>
        </main>

        <Footer />
      </div>

      {/* Search overlay */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(item, type) => {
          setQuickPlay({ item, type });
          setSearchOpen(false);
        }}
      />

      {/* History panel */}
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onPlay={(item, type) => { setQuickPlay({ item, type }); setHistoryOpen(false); }}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      {/* Quick play modal (from search / history) */}
      {quickPlay && (
        <MediaModal
          item={quickPlay.item}
          mediaType={quickPlay.type}
          onClose={() => setQuickPlay(null)}
          onRecordWatch={handleRecordWatch}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppLayout />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
