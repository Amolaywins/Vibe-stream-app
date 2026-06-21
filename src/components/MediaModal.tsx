import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Play, Plus, Check, Star, ChevronDown, Monitor,
  RefreshCw, Users, Copy, Link2, Zap, WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { tmdb, GENRE_MAP } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";
import { useMovieDetail, useShowDetail, useSeasonDetail } from "@/hooks/useTMDB";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchParty } from "@/hooks/useWatchParty";
import { useP2PStream, fmtSpeed } from "@/hooks/useP2PStream";

interface MediaModalProps {
  item: TMDBMovie | null;
  mediaType: string;
  onClose: () => void;
  onRecordWatch?: (item: TMDBMovie, type: string, opts?: { season?: number; episode?: number; episode_name?: string }) => void;
}

interface EmbedServer {
  id: string;
  label: string;
  movie: (id: number) => string;
  tv: (id: number, s: number, e: number) => string;
}

const SERVERS: EmbedServer[] = [
  {
    id: "vidsrc-me",
    label: "Server 1",
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "vidsrc-pro",
    label: "Server 2",
    movie: (id) => `https://vidsrc.pro/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "embed-su",
    label: "Server 3",
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-xyz",
    label: "Server 4",
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "vidsrc-cc",
    label: "Server 5",
    movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidlink",
    label: "Server 6",
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-rip",
    label: "Server 7",
    movie: (id) => `https://vidsrc.rip/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.rip/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "smashy",
    label: "Server 8",
    movie: (id) => `https://player.smashy.stream/movie/${id}`,
    tv: (id, s, e) => `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}`,
  },
  {
    id: "moviesapi",
    label: "Server 9",
    movie: (id) => `https://moviesapi.club/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.club/tv/${id}-${s}-${e}`,
  },
];

const AUTO_SWITCH_SECONDS = 8;

function getPlayerUrl(mediaType: string, tmdbId: number, serverIdx: number, season?: number, episode?: number) {
  const server = SERVERS[serverIdx];
  if (!server) return "";
  if (mediaType === "tv" && season && episode) return server.tv(tmdbId, season, episode);
  return server.movie(tmdbId);
}

export function MediaModal({ item, mediaType, onClose, onRecordWatch }: MediaModalProps) {
  const [serverIdx, setServerIdx] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [playerActive, setPlayerActive] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoSwitchPaused, setAutoSwitchPaused] = useState(false);
  const [p2pMode, setP2pMode] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const party = useWatchParty();
  const p2p = useP2PStream();

  const isTV = mediaType === "tv";
  const { data: movieDetail, loading: movieLoading } = useMovieDetail(!isTV && item ? item.id : null);
  const { data: showDetail, loading: showLoading } = useShowDetail(isTV && item ? item.id : null);
  const { data: seasonDetail, loading: seasonLoading } = useSeasonDetail(
    isTV && item ? item.id : null,
    isTV ? selectedSeason : null
  );
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const detail = isTV ? showDetail : movieDetail;
  const loading = isTV ? showLoading : movieLoading;

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setCountdown(null);
  }, []);

  // Auto-switch countdown
  useEffect(() => {
    if (!playerActive || autoSwitchPaused || p2pMode) {
      stopCountdown();
      return;
    }
    setCountdown(AUTO_SWITCH_SECONDS);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          setServerIdx((i) => (i + 1) % SERVERS.length);
          return AUTO_SWITCH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    countdownRef.current = id;
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerActive, autoSwitchPaused, p2pMode]);

  // Reset on new item
  useEffect(() => {
    setPlayerActive(false);
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setServerIdx(0);
    setAutoSwitchPaused(false);
    setP2pMode(false);
    p2p.deactivate();
    stopCountdown();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  // iframe loading indicator
  useEffect(() => {
    if (!playerActive || p2pMode) return;
    setIframeLoading(true);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => setIframeLoading(false), 8000);
    return () => { if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current); };
  }, [playerActive, serverIdx, selectedSeason, selectedEpisode, p2pMode]);

  // Popup-ad interceptor
  useEffect(() => {
    if (!playerActive || p2pMode) return;
    const refocus = () => { window.focus(); };
    window.addEventListener("blur", refocus);
    return () => window.removeEventListener("blur", refocus);
  }, [playerActive, p2pMode]);

  // ── Watch Party: broadcast when host changes media ──────────────────────
  useEffect(() => {
    if (!party.isHost || !playerActive || !item) return;
    party.broadcast({
      tmdbId: item.id,
      mediaType: mediaType as "movie" | "tv",
      season: selectedSeason,
      episode: selectedEpisode,
      serverIdx,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverIdx, selectedSeason, selectedEpisode]);

  // ── Watch Party: apply incoming media when guest ────────────────────────
  useEffect(() => {
    if (!party.incomingMedia) return;
    const { serverIdx: si, season, episode } = party.incomingMedia;
    if (si !== undefined) { setServerIdx(si); setAutoSwitchPaused(true); }
    if (season !== undefined) setSelectedSeason(season);
    if (episode !== undefined) setSelectedEpisode(episode);
    setPlayerActive(true);
    setP2pMode(false);
    party.clearIncomingMedia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [party.incomingMedia]);

  // P2P: auto-fallback when error triggers
  useEffect(() => {
    if (p2p.status === "error") {
      setP2pMode(false);
      setServerIdx(0);
      setPlayerActive(true);
    }
  }, [p2p.status]);

  useEffect(() => {
    document.body.style.overflow = item ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  if (!item) return null;

  const title = item.title || item.name || "";
  const releaseYear = (item.release_date || item.first_air_date || "").slice(0, 4);
  const backdropUrl = tmdb.backdropUrl(item.backdrop_path, "w1280");
  const posterUrl = tmdb.posterUrl(item.poster_path, "w342");
  const type = mediaType;
  const inWatchlist = isInWatchlist(item.id, type);

  const genres = (() => {
    if (detail && "genres" in detail) return detail.genres?.map((g) => g.name) || [];
    return (item.genre_ids || []).map((id) => GENRE_MAP[id]).filter(Boolean);
  })();

  const seasons = showDetail?.seasons?.filter((s) => s.season_number > 0) || [];
  const playerUrl = getPlayerUrl(type, item.id, serverIdx,
    isTV ? selectedSeason : undefined,
    isTV ? selectedEpisode : undefined
  );

  const certification = (() => {
    if (!isTV && movieDetail?.release_dates) {
      const us = movieDetail.release_dates.results.find((r) => r.iso_3166_1 === "US");
      return us?.release_dates[0]?.certification || null;
    }
    if (isTV && showDetail?.content_ratings) {
      const us = showDetail.content_ratings.results.find((r) => r.iso_3166_1 === "US");
      return us?.rating || null;
    }
    return null;
  })();

  const handleServerClick = (idx: number) => {
    setServerIdx(idx);
    setAutoSwitchPaused(true);
    stopCountdown();
    setPlayerActive(true);
    setP2pMode(false);
    p2p.deactivate();
    if (item && onRecordWatch) {
      const epName = isTV ? seasonDetail?.episodes?.find(e => e.episode_number === selectedEpisode)?.name : undefined;
      onRecordWatch(item, mediaType, isTV ? { season: selectedSeason, episode: selectedEpisode, episode_name: epName } : undefined);
    }
  };

  const handlePlay = () => {
    setPlayerActive(true);
    setAutoSwitchPaused(false);
    if (item && onRecordWatch) {
      const epName = isTV ? seasonDetail?.episodes?.find(e => e.episode_number === selectedEpisode)?.name : undefined;
      onRecordWatch(item, mediaType, isTV ? { season: selectedSeason, episode: selectedEpisode, episode_name: epName } : undefined);
    }
  };

  const handleActivateP2P = () => {
    setP2pMode(true);
    setPlayerActive(true);
    stopCountdown();
    p2p.activate({ tmdbId: item.id, title, year: releaseYear, mediaType });
  };

  const handleCopyPartyLink = () => {
    if (party.shareUrl) {
      navigator.clipboard.writeText(party.shareUrl);
      toast.success("Watch Party link copied!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        data-testid="media-modal"
        className="relative w-full md:max-w-4xl max-h-[95vh] overflow-y-auto rounded-t-2xl md:rounded-2xl fade-in"
        style={{ background: "#0f0f12", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Close */}
        <button
          data-testid="btn-modal-close"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Player / Backdrop ─────────────────────────────────────────── */}
        <div className="relative w-full aspect-video bg-black rounded-t-2xl overflow-hidden">
          {playerActive ? (
            <>
              {/* P2P video element */}
              {p2pMode ? (
                <video
                  ref={p2p.videoRef as React.RefObject<HTMLVideoElement>}
                  id="vibe-p2p-player"
                  controls
                  className="w-full h-full rounded-t-2xl bg-black"
                  style={{ border: "1px solid rgba(124,58,237,0.2)" }}
                />
              ) : (
                <iframe
                  key={`${serverIdx}-${selectedSeason}-${selectedEpisode}`}
                  src={playerUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  referrerPolicy="no-referrer"
                  title={title}
                  onLoad={() => {
                    setIframeLoading(false);
                    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
                  }}
                />
              )}

              {/* iframe Loading overlay */}
              {iframeLoading && !p2pMode && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
                  style={{ background: "rgba(10,10,14,0.85)", backdropFilter: "blur(4px)" }}
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#7c3aed" }} />
                  </div>
                  <p className="text-white/70 text-sm font-medium">Connecting to {SERVERS[serverIdx].label}…</p>
                  <p className="text-white/35 text-xs">This may take a few seconds</p>
                </div>
              )}

              {/* P2P loading / connecting overlay */}
              {p2pMode && (p2p.status === "searching" || p2p.status === "connecting") && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
                  style={{ background: "rgba(10,10,14,0.9)", backdropFilter: "blur(4px)" }}
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#7c3aed" }} />
                  </div>
                  <p className="text-purple-300 text-sm font-semibold">
                    {p2p.status === "searching" ? "🔍 Finding P2P sources…" : "⚡ Connecting to swarm…"}
                  </p>
                  <p className="text-white/35 text-xs">Decentralized high-bitrate stream</p>
                </div>
              )}

              {/* P2P swarm stats overlay */}
              {p2pMode && p2p.status === "streaming" && (
                <div
                  className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-xl text-[11px] pointer-events-none"
                  style={{
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    boxShadow: "0 0 12px rgba(124,58,237,0.15)",
                  }}
                >
                  <span style={{ color: "#a855f7" }}>⚡ P2P</span>
                  <span className="text-green-400">🟢 Peers: {p2p.peers}</span>
                  <span className="text-blue-300">⬇ {fmtSpeed(p2p.downloadSpeed)}</span>
                  <span className="text-purple-300">⬆ {fmtSpeed(p2p.uploadSpeed)}</span>
                  {p2p.progress > 0 && (
                    <span className="text-white/50">{(p2p.progress * 100).toFixed(1)}%</span>
                  )}
                </div>
              )}

              {/* Auto-switch countdown overlay */}
              {countdown !== null && !autoSwitchPaused && !p2pMode && (
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full text-xs text-white/90 pointer-events-auto"
                  style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                  <span>
                    {SERVERS[serverIdx].label} not loading — switching to {SERVERS[(serverIdx + 1) % SERVERS.length].label} in{" "}
                    <span className="font-bold text-primary">{countdown}s</span>
                  </span>
                  <button
                    onClick={() => { setAutoSwitchPaused(true); stopCountdown(); }}
                    className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                    style={{ background: "rgba(124,58,237,0.4)", border: "1px solid rgba(124,58,237,0.6)" }}
                  >
                    Keep this server
                  </button>
                </div>
              )}

              {/* Auto-switch paused indicator */}
              {autoSwitchPaused && !p2pMode && (
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs pointer-events-auto"
                  style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span className="text-white/60">{SERVERS[serverIdx].label} — auto-switch off</span>
                  <button onClick={() => setAutoSwitchPaused(false)} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Re-enable
                  </button>
                </div>
              )}

              {/* Watch Party: Guest connected badge */}
              {party.isGuest && party.isConnectedToHost && (
                <div
                  className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs pointer-events-none"
                  style={{
                    background: "rgba(16,16,24,0.75)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(124,58,237,0.4)",
                    boxShadow: "0 0 16px rgba(124,58,237,0.2)",
                  }}
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-purple-200 font-semibold">👥 Connected to Watch Party</span>
                </div>
              )}

              {/* Watch Party: Host ended banner */}
              {party.hostEnded && (
                <div
                  className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs pointer-events-auto"
                  style={{
                    background: "rgba(220,38,38,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(220,38,38,0.4)",
                  }}
                >
                  <WifiOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300 font-medium">Host has ended the session</span>
                </div>
              )}
            </>
          ) : (
            <>
              {backdropUrl && <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button
                  data-testid="btn-modal-play"
                  onClick={handlePlay}
                  className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center glow-primary transition-all active:scale-95"
                >
                  <Play className="w-7 h-7 fill-white text-white ml-1" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Server selector + feature buttons ───────────────────────── */}
        <div className="px-5 pt-4 pb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-white/40 flex items-center gap-1 mr-1">
              <Monitor className="w-3.5 h-3.5" /> Server:
            </span>

            {SERVERS.map((server, idx) => (
              <button
                key={server.id}
                data-testid={`btn-source-${server.id}`}
                onClick={() => handleServerClick(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  serverIdx === idx && playerActive && !p2pMode
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {server.label}
              </button>
            ))}

            {/* Divider */}
            <span className="w-px h-4 bg-white/10 mx-1" />

            {/* ⚡ P2P Direct Stream button */}
            <button
              onClick={() => {
                if (p2pMode) {
                  setP2pMode(false);
                  p2p.deactivate();
                  setPlayerActive(false);
                } else {
                  handleActivateP2P();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                p2pMode
                  ? "border-purple-500/60 text-purple-300"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-purple-300 hover:border-purple-500/40"
              }`}
              style={p2pMode ? { background: "rgba(124,58,237,0.15)", boxShadow: "0 0 8px rgba(124,58,237,0.2)" } : {}}
            >
              <Zap className="w-3 h-3" />
              P2P Direct
            </button>

            {/* Watch Party button */}
            {!party.isGuest && (
              <button
                onClick={() => {
                  if (party.isHost) {
                    setShowPartyModal((v) => !v);
                  } else {
                    party.hostParty();
                    setShowPartyModal(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  party.isHost
                    ? "border-pink-500/60 text-pink-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-pink-300 hover:border-pink-500/40"
                }`}
                style={party.isHost ? { background: "rgba(236,72,153,0.12)", boxShadow: "0 0 8px rgba(236,72,153,0.15)" } : {}}
              >
                <Users className="w-3 h-3" />
                {party.isHost ? `Party (${party.connectedCount})` : "Watch Party"}
              </button>
            )}

            {/* Guest indicator */}
            {party.isGuest && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-500/40 text-purple-300"
                style={{ background: "rgba(124,58,237,0.1)" }}>
                <Users className="w-3 h-3" />
                {party.isConnectedToHost ? "In Party" : "Connecting…"}
              </span>
            )}
          </div>

          {/* P2P error message */}
          {p2p.errorMessage && !p2pMode && (
            <p className="mt-2 text-xs text-amber-400/80 flex items-center gap-1.5">
              <WifiOff className="w-3 h-3" />
              {p2p.errorMessage}
            </p>
          )}
        </div>

        {/* ── Watch Party share modal ──────────────────────────────────── */}
        {party.isHost && showPartyModal && party.shareUrl && (
          <div
            className="mx-5 mt-3 mb-1 p-4 rounded-2xl"
            style={{
              background: "rgba(236,72,153,0.08)",
              border: "1px solid rgba(236,72,153,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-semibold text-pink-300">Watch Party Active</span>
                {party.connectedCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full text-pink-200"
                    style={{ background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.3)" }}>
                    {party.connectedCount} watching
                  </span>
                )}
              </div>
              <button
                onClick={() => { party.leaveParty(); setShowPartyModal(false); }}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                End party
              </button>
            </div>
            <p className="text-xs text-white/50 mb-2">Share this link to watch together in sync:</p>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 text-xs text-white/60 px-3 py-2 rounded-xl overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {party.shareUrl}
              </div>
              <button
                onClick={handleCopyPartyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                style={{ background: "rgba(236,72,153,0.3)", border: "1px solid rgba(236,72,153,0.5)" }}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
          </div>
        )}

        {/* ── Details ──────────────────────────────────────────────────── */}
        <div className="p-5">
          <div className="flex gap-4">
            <div className="hidden sm:block flex-shrink-0">
              <img src={posterUrl || ""} alt={title} className="w-28 rounded-xl object-cover" style={{ aspectRatio: "2/3" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap mb-2">
                {certification && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded border border-white/30 text-white/70">{certification}</span>
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isTV ? "border-blue-500/50 text-blue-400" : "border-yellow-500/50 text-yellow-400"}`}>
                  {isTV ? "TV SHOW" : "MOVIE"}
                </span>
                {item.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    {item.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mb-1">{title}</h2>
              {genres.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {genres.map((g) => (
                    <span key={g} className="text-xs text-white/50 bg-white/6 px-2 py-0.5 rounded-full border border-white/8">{g}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-4">
                {loading ? "Loading details..." : (detail?.overview || item.overview)}
              </p>
              <div className="flex gap-2">
                <button
                  data-testid="btn-modal-watchlist"
                  onClick={() => toggleWatchlist(item, type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    inWatchlist
                      ? "bg-primary/20 border-primary/30 text-primary"
                      : "bg-white/6 border-white/10 text-white hover:bg-white/12"
                  }`}
                >
                  {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {inWatchlist ? "In Watchlist" : "+ Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── TV Episode Selector ───────────────────────────────────────── */}
        {isTV && (
          <div className="px-5 pb-5 border-t border-white/5 pt-4">
            <h3 className="text-sm font-semibold text-white/70 mb-3">Episodes</h3>
            <div className="relative mb-3">
              <select
                data-testid="select-season"
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(Number(e.target.value));
                  setSelectedEpisode(1);
                  setPlayerActive(false);
                  setAutoSwitchPaused(false);
                  stopCountdown();
                }}
                className="w-full md:w-56 appearance-none bg-white/6 border border-white/12 text-white text-sm rounded-xl px-4 py-2.5 pr-8 outline-none focus:border-primary/40 cursor-pointer"
              >
                {seasons.length > 0
                  ? seasons.map((s) => (
                      <option key={s.season_number} value={s.season_number} className="bg-[#0f0f12]">
                        Season {s.season_number} ({s.episode_count} episodes)
                      </option>
                    ))
                  : Array.from({ length: showDetail?.number_of_seasons || 1 }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-[#0f0f12]">Season {i + 1}</option>
                    ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {seasonLoading
                ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)
                : (seasonDetail?.episodes || []).map((ep) => (
                    <button
                      key={ep.episode_number}
                      data-testid={`btn-episode-${ep.episode_number}`}
                      onClick={() => {
                        setSelectedEpisode(ep.episode_number);
                        setPlayerActive(true);
                        setServerIdx(0);
                        setAutoSwitchPaused(false);
                        setP2pMode(false);
                        p2p.deactivate();
                        if (item && onRecordWatch) {
                          onRecordWatch(item, mediaType, { season: selectedSeason, episode: ep.episode_number, episode_name: ep.name });
                        }
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border ${
                        selectedEpisode === ep.episode_number
                          ? "bg-primary/15 border-primary/25"
                          : "bg-white/4 border-white/6 hover:bg-white/8"
                      }`}
                    >
                      {ep.still_path && (
                        <img src={tmdb.posterUrl(ep.still_path, "w185") || ""} alt={ep.name} className="w-20 h-12 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-white/40">E{ep.episode_number}</span>
                          {ep.runtime && <span className="text-xs text-white/30">{ep.runtime}m</span>}
                          {ep.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-400/70">
                              <Star className="w-2.5 h-2.5 fill-yellow-400/70" />
                              {ep.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white/85 line-clamp-1">{ep.name}</p>
                        <p className="text-xs text-white/40 line-clamp-2 mt-0.5">{ep.overview}</p>
                      </div>
                    </button>
                  ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
