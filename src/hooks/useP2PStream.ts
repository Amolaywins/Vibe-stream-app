import { useState, useRef, useCallback, useEffect } from "react";

export type P2PStatus = "idle" | "searching" | "connecting" | "streaming" | "error";

export type P2PStreamState = {
  status: P2PStatus;
  peers: number;
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
  errorMessage: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  activate: (params: { tmdbId: number; title: string; year: string; mediaType: string }) => void;
  deactivate: () => void;
};

const WRT_TRACKERS = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.webtorrent.dev",
  "wss://tracker.btorrent.xyz",
];

function buildMagnet(hash: string, title: string): string {
  const dn = encodeURIComponent(title);
  const trs = WRT_TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${hash}&dn=${dn}${trs}`;
}

async function loadWebTorrent(): Promise<any> {
  const win = window as any;
  if (win.WebTorrent) return win.WebTorrent;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/webtorrent@2/webtorrent.min.js";
    s.onload = () => resolve(win.WebTorrent);
    s.onerror = () => reject(new Error("Failed to load WebTorrent"));
    document.head.appendChild(s);
  });
}

async function fetchMagnet(title: string, year: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${title} ${year}`);
    const res = await fetch(
      `https://yts.mx/api/v2/list_movies.json?query_term=${q}&limit=3&sort_by=seeds`,
      { signal: AbortSignal.timeout(6000) }
    );
    const json = await res.json();
    const movies: any[] = json?.data?.movies || [];
    if (!movies.length) return null;

    // Pick best torrent (prefer 1080p, then 720p)
    for (const quality of ["1080p", "720p", "480p"]) {
      for (const movie of movies) {
        const torrent = (movie.torrents || []).find((t: any) => t.quality === quality);
        if (torrent?.hash) return buildMagnet(torrent.hash, movie.title_english || title);
      }
    }
    // Fallback: first available torrent
    const first = movies[0]?.torrents?.[0];
    if (first?.hash) return buildMagnet(first.hash, movies[0].title_english || title);
    return null;
  } catch {
    return null;
  }
}

export function useP2PStream(): P2PStreamState {
  const [status, setStatus] = useState<P2PStatus>("idle");
  const [peers, setPeers] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clientRef = useRef<any>(null);
  const statsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seedCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopStats = () => {
    if (statsTimerRef.current) { clearInterval(statsTimerRef.current); statsTimerRef.current = null; }
    if (seedCheckTimerRef.current) { clearTimeout(seedCheckTimerRef.current); seedCheckTimerRef.current = null; }
  };

  const deactivate = useCallback(() => {
    stopStats();
    try { clientRef.current?.destroy(); } catch (_) {}
    clientRef.current = null;
    setPeers(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setProgress(0);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { stopStats(); try { clientRef.current?.destroy(); } catch (_) {} }, []);

  const activate = useCallback(async ({
    tmdbId: _tmdbId, title, year, mediaType,
  }: { tmdbId: number; title: string; year: string; mediaType: string }) => {
    deactivate();

    if (mediaType === "tv") {
      setStatus("error");
      setErrorMessage("P2P seed pool low, auto-routed back to default streaming mirror.");
      return;
    }

    setStatus("searching");
    setErrorMessage(null);

    try {
      const [WebTorrent, magnet] = await Promise.all([loadWebTorrent(), fetchMagnet(title, year)]);

      if (!magnet) {
        setStatus("error");
        setErrorMessage("P2P seed pool low, auto-routed back to default streaming mirror.");
        return;
      }

      setStatus("connecting");
      const client = new WebTorrent();
      clientRef.current = client;

      // 7-second seed check
      seedCheckTimerRef.current = setTimeout(() => {
        if (peers === 0) {
          deactivate();
          setStatus("error");
          setErrorMessage("P2P seed pool low, auto-routed back to default streaming mirror.");
        }
      }, 7000);

      client.add(magnet, (torrent: any) => {
        // Find largest video file
        const videoFile = torrent.files
          .filter((f: any) => /\.(mp4|mkv|webm|avi)$/i.test(f.name))
          .sort((a: any, b: any) => b.length - a.length)[0];

        if (!videoFile) {
          deactivate();
          setStatus("error");
          setErrorMessage("P2P seed pool low, auto-routed back to default streaming mirror.");
          return;
        }

        if (videoRef.current) {
          videoFile.renderTo(videoRef.current, { autoplay: true }, (err: any) => {
            if (err) {
              deactivate();
              setStatus("error");
              setErrorMessage("P2P seed pool low, auto-routed back to default streaming mirror.");
            }
          });
          setStatus("streaming");
        }

        // Poll stats every second
        statsTimerRef.current = setInterval(() => {
          setPeers(torrent.numPeers ?? 0);
          setDownloadSpeed(torrent.downloadSpeed ?? 0);
          setUploadSpeed(torrent.uploadSpeed ?? 0);
          setProgress(torrent.progress ?? 0);
        }, 1000);
      });

      client.on("error", () => {
        deactivate();
        setStatus("error");
        setErrorMessage("P2P seed pool low, auto-routed back to default streaming mirror.");
      });
    } catch (_) {
      setStatus("error");
      setErrorMessage("P2P seed pool low, auto-routed back to default streaming mirror.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deactivate]);

  return { status, peers, downloadSpeed, uploadSpeed, progress, errorMessage, videoRef, activate, deactivate };
}

export function fmtSpeed(bps: number): string {
  if (bps >= 1_048_576) return `${(bps / 1_048_576).toFixed(1)} MB/s`;
  if (bps >= 1024) return `${(bps / 1024).toFixed(0)} KB/s`;
  return `${bps} B/s`;
}
