import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Play, ChevronLeft } from "lucide-react";

interface GameSetupProps {
  onStart: (playerCount: number, names: string[]) => void;
  onBack: () => void;
}

export function GameSetup({ onStart, onBack }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState<string[]>(["", "", "", ""]);

  const handleStart = () => {
    const finalNames = names.slice(0, playerCount).map((n, i) => n.trim() || `Player ${i + 1}`);
    onStart(playerCount, finalNames);
  };

  return (
    <div className="min-h-screen star-field flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full relative"
      >
        {/* Back Button matching Online Mode style */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-display tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-display text-3xl text-center mb-2 text-foreground tracking-widest mt-4">
          BLACK HOLE
        </h1>
        <p className="text-center text-muted-foreground font-body text-sm mb-8">
          Strategy game · Place tokens wisely · Lowest score wins
        </p>

        <div className="mb-6">
          <label className="font-display text-xs text-muted-foreground tracking-wider mb-3 block">
            <Users className="w-3.5 h-3.5 inline mr-1.5" />
            PLAYERS
          </label>
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

        <div className="space-y-3 mb-8">
          {Array.from({ length: playerCount }, (_, i) => (
            <input
              key={i}
              placeholder={`Player ${i + 1}`}
              value={names[i]}
              onChange={e => {
                const next = [...names];
                next[i] = e.target.value;
                setNames(next);
              }}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 font-body text-sm
                text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-widest
            flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-primary"
        >
          <Play className="w-4 h-4" />
          START GAME
        </motion.button>
      </motion.div>
    </div>
  );
}
