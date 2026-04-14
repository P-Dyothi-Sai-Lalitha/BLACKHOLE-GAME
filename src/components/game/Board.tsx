import { useMemo } from "react";
import { GameTile } from "./Tile";
import type { GameState } from "@/lib/gameLogic";

interface BoardProps {
  state: GameState;
  onTileClick: (tileId: number) => void;
}

export function Board({ state, onTileClick }: BoardProps) {
  const tileSize = useMemo(() => {
    // Responsive tile sizing
    const maxWidth = Math.min(window.innerWidth - 32, 600);
    const maxTilesInRow = state.rows;
    return Math.min(Math.floor((maxWidth - (maxTilesInRow - 1) * 6) / maxTilesInRow), 56);
  }, [state.rows]);

  const gap = Math.max(4, tileSize * 0.1);

  const rows: number[][] = [];
  for (const tile of state.board) {
    if (!rows[tile.row]) rows[tile.row] = [];
    rows[tile.row].push(tile.id);
  }

  const canClick = (tileId: number) => {
    if (state.phase !== 'playing') return false;
    const tile = state.board.find(t => t.id === tileId);
    return !!tile && !tile.token && state.selectedToken !== null;
  };

  return (
    <div className="flex flex-col items-center" style={{ gap }}>
      {rows.map((tileIds, rowIndex) => (
        <div key={rowIndex} className="flex items-center justify-center" style={{ gap }}>
          {tileIds.map(id => {
            const tile = state.board.find(t => t.id === id)!;
            return (
              <GameTile
                key={id}
                tile={tile}
                size={tileSize}
                isBlackHole={state.blackHoleTileId === id}
                isAdjacentToBlackHole={state.adjacentToBlackHole.includes(id)}
                isClickable={canClick(id)}
                onClick={() => onTileClick(id)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
