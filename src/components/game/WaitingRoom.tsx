import { motion } from "framer-motion";
import { Copy, Check, Users, Play } from "lucide-react";
import { useState } from "react";
import type { OnlineRoom } from "@/hooks/useOnlineGame";

interface WaitingRoomProps {
  room: OnlineRoom;
  isHost: boolean;
  onStart: () => void;
}

export function WaitingRoom({ room, isHost, onStart }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = room.playerIds.length === room.playerCount;

  return (
    <div className="min-h-screen star-field flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
      >
        <h2 className="font-display text-lg text-foreground tracking-widest mb-6">WAITING ROOM</h2>

        <div className="mb-6">
          <p className="text-muted-foreground font-body text-xs mb-2">Share this code</p>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 bg-muted rounded-xl px-6 py-3 font-display text-2xl tracking-[0.4em] text-foreground
              hover:bg-muted/80 transition-colors"
          >
            {room.roomCode}
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs font-body mb-3">
            <Users className="w-3 h-3" />
            {room.playerIds.length} / {room.playerCount} players
          </div>
          <div className="space-y-2">
            {room.playerNames.map((name, i) => (
              <div key={i} className="bg-muted/50 rounded-lg py-2 px-4 font-body text-sm text-foreground">
                {name} {i === 0 && <span className="text-primary text-xs">(host)</span>}
              </div>
            ))}
            {Array.from({ length: room.playerCount - room.playerIds.length }, (_, i) => (
              <div key={`empty-${i}`} className="border border-dashed border-border rounded-lg py-2 px-4 font-body text-sm text-muted-foreground">
                Waiting...
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider
              flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity glow-primary"
          >
            <Play className="w-4 h-4" /> START GAME
          </button>
        )}

        {!isHost && (
          <p className="text-muted-foreground font-body text-sm">Waiting for host to start...</p>
        )}
      </motion.div>
    </div>
  );
}
