import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export type MediaPayload = {
  type: "MEDIA_CHANGE" | "HOST_ENDED";
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
  serverIdx?: number;
};

export type WatchPartyState = {
  isHost: boolean;
  isGuest: boolean;
  partyRoomId: string | null;
  shareUrl: string | null;
  connectedCount: number;
  isConnectedToHost: boolean;
  hostEnded: boolean;
  incomingMedia: Omit<MediaPayload, "type"> | null;
  hostParty: () => void;
  leaveParty: () => void;
  broadcast: (p: Required<Omit<MediaPayload, "type">>) => void;
  clearIncomingMedia: () => void;
};

export function useWatchParty(): WatchPartyState {
  const [isHost, setIsHost] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [partyRoomId, setPartyRoomId] = useState<string | null>(null);
  const [connectedCount, setConnectedCount] = useState(0);
  const [isConnectedToHost, setIsConnectedToHost] = useState(false);
  const [hostEnded, setHostEnded] = useState(false);
  const [incomingMedia, setIncomingMedia] = useState<Omit<MediaPayload, "type"> | null>(null);

  // Read partyRoom from URL once, synchronously, to avoid effect timing issues
  const [autoJoinRoom] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("partyRoom");
  });

  const peerRef = useRef<any>(null);
  const connectionsRef = useRef<any[]>([]);
  const hostConnRef = useRef<any>(null);

  const removeUrlParam = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("partyRoom");
    window.history.replaceState({}, "", url.toString());
  };

  const cleanup = useCallback(() => {
    try { peerRef.current?.destroy(); } catch (_) {}
    peerRef.current = null;
    connectionsRef.current = [];
    hostConnRef.current = null;
    setIsHost(false);
    setIsGuest(false);
    setPartyRoomId(null);
    setConnectedCount(0);
    setIsConnectedToHost(false);
    removeUrlParam();
  }, []);

  const setupGuestConnection = useCallback((peer: any, hostId: string) => {
    const conn = peer.connect(hostId, { reliable: true });
    hostConnRef.current = conn;

    conn.on("open", () => setIsConnectedToHost(true));

    conn.on("data", (raw: unknown) => {
      try {
        const payload = raw as MediaPayload;
        if (payload.type === "HOST_ENDED") {
          setIsConnectedToHost(false);
          setHostEnded(true);
        } else if (payload.type === "MEDIA_CHANGE") {
          setIncomingMedia({
            tmdbId: payload.tmdbId,
            mediaType: payload.mediaType,
            season: payload.season,
            episode: payload.episode,
            serverIdx: payload.serverIdx,
          });
        }
      } catch (_) {}
    });

    conn.on("close", () => {
      setIsConnectedToHost(false);
      setHostEnded(true);
    });

    conn.on("error", () => {
      setIsConnectedToHost(false);
      setHostEnded(true);
    });
  }, []);

  const hostParty = useCallback(async () => {
    try {
      const { Peer } = await import("peerjs");
      const peer = new Peer({ debug: 0 });
      peerRef.current = peer;

      const failTimer = setTimeout(() => {
        try { peer.destroy(); } catch (_) {}
        peerRef.current = null;
        toast.error("Watch Party server busy. Please try again later.");
      }, 10000);

      peer.on("open", (id: string) => {
        clearTimeout(failTimer);
        setIsHost(true);
        setPartyRoomId(id);
        const url = new URL(window.location.href);
        url.searchParams.set("partyRoom", id);
        window.history.replaceState({}, "", url.toString());
      });

      peer.on("connection", (conn: any) => {
        conn.on("open", () => {
          connectionsRef.current.push(conn);
          setConnectedCount((c) => c + 1);
        });
        conn.on("close", () => {
          connectionsRef.current = connectionsRef.current.filter((c) => c !== conn);
          setConnectedCount((c) => Math.max(0, c - 1));
        });
        conn.on("error", () => {
          connectionsRef.current = connectionsRef.current.filter((c) => c !== conn);
          setConnectedCount((c) => Math.max(0, c - 1));
        });
      });

      peer.on("error", () => {
        toast.error("Watch Party server busy. Please try again later.");
        cleanup();
      });
    } catch (_) {
      toast.error("Watch Party server busy. Please try again later.");
    }
  }, [cleanup]);

  const joinParty = useCallback(async (hostId: string) => {
    try {
      const { Peer } = await import("peerjs");
      const peer = new Peer({ debug: 0 });
      peerRef.current = peer;

      const failTimer = setTimeout(() => {
        try { peer.destroy(); } catch (_) {}
        peerRef.current = null;
        toast.error("Watch Party server busy. Please try again later.");
      }, 10000);

      peer.on("open", () => {
        clearTimeout(failTimer);
        setIsGuest(true);
        setPartyRoomId(hostId);
        setupGuestConnection(peer, hostId);
      });

      peer.on("error", () => {
        toast.error("Watch Party server busy. Please try again later.");
        cleanup();
      });
    } catch (_) {
      toast.error("Watch Party server busy. Please try again later.");
    }
  }, [cleanup, setupGuestConnection]);

  // Auto-join on mount if URL has partyRoom param
  useEffect(() => {
    if (autoJoinRoom) {
      joinParty(autoJoinRoom);
    }
  // joinParty is stable; only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaveParty = useCallback(() => {
    if (isHost) {
      const msg: MediaPayload = { type: "HOST_ENDED" };
      connectionsRef.current.forEach((conn) => {
        try { if (conn.open) conn.send(msg); } catch (_) {}
      });
    }
    cleanup();
  }, [isHost, cleanup]);

  const broadcast = useCallback((p: Required<Omit<MediaPayload, "type">>) => {
    if (!isHost) return;
    const msg: MediaPayload = { type: "MEDIA_CHANGE", ...p };
    connectionsRef.current.forEach((conn) => {
      try { if (conn.open) conn.send(msg); } catch (_) {}
    });
  }, [isHost]);

  const clearIncomingMedia = useCallback(() => setIncomingMedia(null), []);

  const shareUrl =
    isHost && partyRoomId
      ? `${window.location.origin}${window.location.pathname}?partyRoom=${partyRoomId}`
      : null;

  return {
    isHost, isGuest, partyRoomId, shareUrl,
    connectedCount, isConnectedToHost, hostEnded,
    incomingMedia, hostParty, leaveParty, broadcast, clearIncomingMedia,
  };
}
