// ─── Types ───────────────────────────────────────────────────────────────────

export interface Tile {
  id: number;
  row: number;
  col: number;
  token: { playerId: number; value: number } | null;
}

export interface Player {
  id: number;
  name: string;
  tokens: number[]; // remaining tokens
  usedTokens: number[];
  score: number;
}

export interface GameState {
  players: Player[];
  board: Tile[];
  rows: number;
  currentPlayerIndex: number;
  selectedToken: number | null;
  phase: 'setup' | 'playing' | 'finished';
  blackHoleTileId: number | null;
  adjacentToBlackHole: number[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

export const PLAYER_CONFIG: Record<number, { rows: number; tokensPerPlayer: number }> = {
  2: { rows: 6, tokensPerPlayer: 10 },
  3: { rows: 7, tokensPerPlayer: 9 },
  4: { rows: 9, tokensPerPlayer: 11 },
};

// ─── Board Generation ────────────────────────────────────────────────────────

export function generateBoard(rows: number): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      tiles.push({ id: id++, row, col, token: null });
    }
  }
  return tiles;
}

// ─── Adjacency ───────────────────────────────────────────────────────────────

export function getAdjacentTileIds(tileId: number, board: Tile[]): number[] {
  const tile = board.find(t => t.id === tileId);
  if (!tile) return [];

  const { row, col } = tile;
  const neighbors: [number, number][] = [
    [row, col - 1],     // left in same row
    [row, col + 1],     // right in same row
    [row - 1, col - 1], // upper-left
    [row - 1, col],     // upper-right
    [row + 1, col],     // lower-left
    [row + 1, col + 1], // lower-right
  ];

  return neighbors
    .map(([r, c]) => board.find(t => t.row === r && t.col === c))
    .filter((t): t is Tile => t !== undefined)
    .map(t => t.id);
}

// ─── Players ─────────────────────────────────────────────────────────────────

export function createPlayers(count: number, names?: string[]): Player[] {
  const { tokensPerPlayer } = PLAYER_CONFIG[count];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: names?.[i] || `Player ${i + 1}`,
    tokens: Array.from({ length: tokensPerPlayer }, (_, j) => j + 1),
    usedTokens: [],
    score: 0,
  }));
}

// ─── Move ────────────────────────────────────────────────────────────────────

export function getNextRequiredToken(player: Player): number {
  // Players must place tokens in ascending order starting from 1
  return player.usedTokens.length + 1;
}

export function placeToken(
  state: GameState,
  tileId: number,
  tokenValue: number
): GameState {
  const tile = state.board.find(t => t.id === tileId);
  if (!tile || tile.token) return state;

  const player = state.players[state.currentPlayerIndex];
  if (!player.tokens.includes(tokenValue)) return state;

  // Enforce ascending order: player must place the next number in sequence
  const requiredToken = getNextRequiredToken(player);
  if (tokenValue !== requiredToken) return state;

  const newBoard = state.board.map(t =>
    t.id === tileId
      ? { ...t, token: { playerId: player.id, value: tokenValue } }
      : t
  );

  const newPlayers = state.players.map(p =>
    p.id === player.id
      ? {
          ...p,
          tokens: p.tokens.filter(t => t !== tokenValue),
          usedTokens: [...p.usedTokens, tokenValue],
        }
      : p
  );

  const emptyTiles = newBoard.filter(t => !t.token);

  // Game finished — one tile left
  if (emptyTiles.length === 1) {
    const blackHole = emptyTiles[0];
    const adjIds = getAdjacentTileIds(blackHole.id, newBoard);
    const adjacentTiles = newBoard.filter(t => adjIds.includes(t.id) && t.token);

    const scoredPlayers = newPlayers.map(p => ({
      ...p,
      score: adjacentTiles
        .filter(t => t.token!.playerId === p.id)
        .reduce((sum, t) => sum + t.token!.value, 0),
    }));

    return {
      ...state,
      board: newBoard,
      players: scoredPlayers,
      phase: 'finished',
      blackHoleTileId: blackHole.id,
      adjacentToBlackHole: adjIds,
      selectedToken: null,
      currentPlayerIndex: state.currentPlayerIndex,
    };
  }

  return {
    ...state,
    board: newBoard,
    players: newPlayers,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    selectedToken: null,
  };
}

// ─── Init ────────────────────────────────────────────────────────────────────

export function initGameState(playerCount: number, names?: string[]): GameState {
  const config = PLAYER_CONFIG[playerCount];
  return {
    players: createPlayers(playerCount, names),
    board: generateBoard(config.rows),
    rows: config.rows,
    currentPlayerIndex: 0,
    selectedToken: null,
    phase: 'playing',
    blackHoleTileId: null,
    adjacentToBlackHole: [],
  };
}

export function getWinner(state: GameState): Player | null {
  if (state.phase !== 'finished') return null;
  return [...state.players].sort((a, b) => a.score - b.score)[0];
}
