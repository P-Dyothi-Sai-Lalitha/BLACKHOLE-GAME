import { motion } from "framer-motion";
import type { GameState } from "@/lib/gameLogic";
import { getWinner } from "@/lib/gameLogic";
import { Trophy } from "lucide-react";

const PLAYER_COLORS = [
  "text-[hsl(var(--player-1))]",
  "text-[hsl(var(--player-2))]",
  "text-[hsl(var(--player-3))]",
  "text-[hsl(var(--player-4))]",
];

interface ScoreBoardProps {
  state: GameState;
  onRestart: () => void;
}

export function ScoreBoard({ state, onRestart }: ScoreBoardProps) {
  const winner = getWinner(state);
  const sorted = [...state.players].sort((a, b) => a.score - b.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-auto"
    >
      <h2 className="font-display text-xl text-center mb-1 text-foreground tracking-wider">Game Over</h2>
      <p className="text-center text-muted-foreground text-sm mb-4 font-body">Lowest score wins!</p>

      <div className="space-y-3 mb-6">
        {sorted.map((p, i) => (
          <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${
            i === 0 ? "bg-primary/10 border border-primary/30" : "bg-muted/30"
          }`}>
            <div className="flex items-center gap-2">
              {i === 0 && <Trophy className="w-4 h-4 text-primary" />}
              <span className={`font-display text-sm ${PLAYER_COLORS[p.id]}`}>{p.name}</span>
            </div>
            <span className="font-display text-lg text-foreground">{p.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider
          hover:opacity-90 transition-opacity"
      >
        Play Again
      </button>
    </motion.div>
  );
}
