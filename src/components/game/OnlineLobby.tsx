import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Plus, LogIn, ArrowLeft } from "lucide-react";

interface OnlineLobbyProps {
  onCreateRoom: (playerCount: number, name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onBack: () => void;
  error: string | null;
}

export function OnlineLobby({ onCreateRoom, onJoinRoom, onBack, error }: OnlineLobbyProps) {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [name, setName] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="min-h-screen star-field flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full"
      >
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm font-body">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Wifi className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground tracking-widest">ONLINE</h2>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-sm text-destructive font-body">
            {error}
          </div>
        )}

        {mode === "choose" && (
          <div className="space-y-3">
            <input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 font-body text-sm
                text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={() => setMode("create")}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider
                flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> CREATE ROOM
            </button>
            <button
              onClick={() => setMode("join")}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-display text-sm tracking-wider
                flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4" /> JOIN ROOM
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4">
            <div>
              <label className="font-display text-xs text-muted-foreground tracking-wider mb-2 block">PLAYERS</label>
              <div className="flex gap-2">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setPlayerCount(n)}
                    className={`flex-1 py-3 rounded-xl font-display text-sm transition-all
                      ${playerCount === n
                        ? "bg-primary text-primary-foreground glow-primary"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => onCreateRoom(playerCount, name.trim())}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider
                hover:opacity-90 transition-opacity glow-primary"
            >
              CREATE
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <input
              placeholder="Room code"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 font-display text-lg text-center tracking-[0.3em]
                text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={() => onJoinRoom(roomCode, name.trim())}
              disabled={roomCode.length < 4}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-display text-sm tracking-wider
                hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              JOIN
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
