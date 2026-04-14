import { motion } from "framer-motion";
import type { Tile as TileType } from "@/lib/gameLogic";

const PLAYER_COLORS = [
  "hsl(var(--player-1))",
  "hsl(var(--player-2))",
  "hsl(var(--player-3))",
  "hsl(var(--player-4))",
];

const PLAYER_GLOW_CLASSES = [
  "glow-player-1",
  "glow-player-2",
  "glow-player-3",
  "glow-player-4",
];

interface TileProps {
  tile: TileType;
  size: number;
  isBlackHole: boolean;
  isAdjacentToBlackHole: boolean;
  isClickable: boolean;
  onClick: () => void;
}

export function GameTile({ tile, size, isBlackHole, isAdjacentToBlackHole, isClickable, onClick }: TileProps) {
  const hasToken = !!tile.token;

  let bgStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: "hsl(var(--tile-empty))",
  };

  let glowClass = "";

  if (isBlackHole) {
    bgStyle.background = "radial-gradient(circle, hsl(270 90% 8%), hsl(270 90% 3%))";
    glowClass = "glow-blackhole";
  } else if (hasToken) {
    const pid = tile.token!.playerId;
    bgStyle.background = `radial-gradient(circle at 35% 35%, ${PLAYER_COLORS[pid]}dd, ${PLAYER_COLORS[pid]}88)`;
    glowClass = PLAYER_GLOW_CLASSES[pid];
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isClickable}
      className={`rounded-full flex items-center justify-center font-display font-bold
        transition-colors duration-200 relative
        ${glowClass}
        ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-default"}
        ${isAdjacentToBlackHole && !isBlackHole ? "ring-2 ring-accent/60" : ""}
        ${!hasToken && !isBlackHole && isClickable ? "hover:bg-[hsl(var(--tile-hover))] border border-primary/20" : ""}
        ${!hasToken && !isBlackHole && !isClickable ? "border border-border/30" : ""}
      `}
      style={bgStyle}
      whileHover={isClickable ? { scale: 1.1 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      layout
    >
      {hasToken && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-primary-foreground drop-shadow-lg"
          style={{ fontSize: size * 0.35 }}
        >
          {tile.token!.value}
        </motion.span>
      )}
      {isBlackHole && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-2 rounded-full border-2 border-primary/30"
        />
      )}
    </motion.button>
  );
}
