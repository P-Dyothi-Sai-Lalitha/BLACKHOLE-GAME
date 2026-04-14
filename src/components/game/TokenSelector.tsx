import { motion } from "framer-motion";
import type { Player } from "@/lib/gameLogic";

const PLAYER_BG = [
  "bg-[hsl(var(--player-1))]",
  "bg-[hsl(var(--player-2))]",
  "bg-[hsl(var(--player-3))]",
  "bg-[hsl(var(--player-4))]",
];

interface TokenSelectorProps {
  player: Player;
  selectedToken: number | null;
  onSelect: (value: number) => void;
  isActive: boolean;
}

export function TokenSelector({ player, selectedToken, onSelect, isActive }: TokenSelectorProps) {
  return (
    <div className={`rounded-xl p-3 transition-all duration-300 ${
      isActive ? "bg-muted border border-primary/30 glow-primary" : "bg-card/50 border border-border/20 opacity-50"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${PLAYER_BG[player.id]}`} />
        <span className="font-display text-xs text-foreground tracking-wider">{player.name}</span>
        {isActive && (
          <span className="text-[10px] font-body text-primary ml-auto uppercase tracking-widest">Your turn</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {player.tokens.map(val => (
          <motion.button
            key={val}
            onClick={() => isActive && onSelect(val)}
            disabled={!isActive}
            whileHover={isActive ? { scale: 1.15 } : {}}
            whileTap={isActive ? { scale: 0.9 } : {}}
            className={`w-8 h-8 rounded-full font-display text-xs font-bold flex items-center justify-center
              transition-all duration-150
              ${selectedToken === val && isActive
                ? `${PLAYER_BG[player.id]} text-primary-foreground scale-110 ring-2 ring-primary-foreground/50`
                : `bg-muted/60 text-muted-foreground hover:text-foreground`
              }
              ${!isActive ? "cursor-default" : "cursor-pointer"}
            `}
          >
            {val}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
