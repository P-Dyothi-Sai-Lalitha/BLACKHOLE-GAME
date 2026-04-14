import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Board } from "./Board";
import { TokenSelector } from "./TokenSelector";
import { ScoreBoard } from "./ScoreBoard";
import { GameSetup } from "./GameSetup";
import { OnlineLobby } from "./OnlineLobby";
import { WaitingRoom } from "./WaitingRoom";
import { InstallPrompt } from "./InstallPrompt";
import { HowToPlayModal } from "./HowToPlayModal";
import { initGameState, placeToken, getNextRequiredToken, type GameState } from "@/lib/gameLogic";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { RotateCcw, Wifi, Monitor, HelpCircle } from "lucide-react";
import { AudioToggle } from "./AudioToggle";
import { playClick, playPlace, playGameStart, playGameEnd, startMusic, stopMusic, isMusicPlaying } from "@/lib/audioManager";

type Mode = "menu" | "local" | "online";

export function GameRoom() {
  const [mode, setMode] = useState<Mode>("menu");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [localState, setLocalState] = useState<GameState | null>(null);

  // Online game hook
  const online = useOnlineGame();

  // ─── Local handlers ───
  const handleLocalStart = useCallback((playerCount: number, names: string[]) => {
    const state = initGameState(playerCount, names);
    const firstPlayer = state.players[state.currentPlayerIndex];
    const nextToken = getNextRequiredToken(firstPlayer);
    setLocalState({ ...state, selectedToken: nextToken });
    // Audio: game start sound + background music
    playGameStart();
    startMusic();
  }, []);

  const handleLocalSelectToken = useCallback((value: number) => {
    setLocalState(prev => prev ? { ...prev, selectedToken: value } : null);
  }, []);

  const handleLocalTileClick = useCallback((tileId: number) => {
    setLocalState(prev => {
      if (!prev || prev.selectedToken === null) return prev;
      const newState = placeToken(prev, tileId, prev.selectedToken);
      if (newState === prev) return prev; // invalid move
      // Audio: tile placement
      playPlace();
      if (newState.phase === 'finished') {
        playGameEnd();
        stopMusic();
      }
      if (newState.phase === 'playing') {
        const nextPlayer = newState.players[newState.currentPlayerIndex];
        const nextToken = getNextRequiredToken(nextPlayer);
        return { ...newState, selectedToken: nextToken };
      }
      return newState;
    });
  }, []);

  // ─── Online handlers ───
  const [onlineSelectedToken, setOnlineSelectedToken] = useState<number | null>(null);

  const handleOnlineTileClick = useCallback((tileId: number) => {
    if (!online.gameState) return;
    const currentPlayer = online.gameState.players[online.gameState.currentPlayerIndex];
    const required = getNextRequiredToken(currentPlayer);
    playPlace();
    online.makeMove(tileId, required);
  }, [online]);

  // ─── Mode Menu ───
  if (mode === "menu") {
    return (
      <div className="min-h-screen star-field flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
        >
          <h1 className="font-display text-3xl text-foreground tracking-widest mb-2">BLACK HOLE</h1>
          <p className="text-muted-foreground font-body text-sm mb-8">Strategy game · Lowest score wins</p>
          <div className="space-y-3">
            <button
              onClick={() => { playClick(); setMode("local"); }}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider
                flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-primary"
            >
              <Monitor className="w-4 h-4" /> LOCAL MULTIPLAYER
            </button>
            <button
              onClick={() => { playClick(); setMode("online"); }}
              className="w-full py-4 rounded-xl bg-secondary text-secondary-foreground font-display text-sm tracking-wider
                flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-secondary"
            >
              <Wifi className="w-4 h-4" /> ONLINE MULTIPLAYER
            </button>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="w-full py-3 rounded-xl border border-border text-muted-foreground font-display text-sm tracking-wider
                flex items-center justify-center gap-2 hover:text-foreground hover:border-primary/40 transition-all"
            >
              <HelpCircle className="w-4 h-4" /> HOW TO PLAY
            </button>
          </div>
        </motion.div>

        {/* Install & Credits */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <InstallPrompt />
          <p className="text-xs text-muted-foreground font-body">
            Inspired by The Tabletop Family from YouTube
          </p>
        </div>

        <HowToPlayModal open={showHowToPlay} onOpenChange={setShowHowToPlay} />
      </div>
    );
  }

  // ─── Local Mode ───
  if (mode === "local") {
    if (!localState) {
      return <GameSetup onStart={handleLocalStart} />;
    }

    if (localState.phase === "finished") {
      return (
        <div className="min-h-screen star-field flex flex-col items-center justify-center p-4 gap-6">
          <Board state={localState} onTileClick={() => {}} />
          <ScoreBoard state={localState} onRestart={() => { setLocalState(null); setMode("menu"); }} />
        </div>
      );
    }

    return (
      <div className="min-h-screen star-field flex flex-col">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-display text-sm text-foreground tracking-widest">BLACK HOLE</h1>
          <div className="flex items-center gap-2">
            <AudioToggle />
            <button 
              onClick={() => { stopMusic(); setLocalState(null); setMode("menu"); }} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <motion.div key={localState.currentPlayerIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4 pb-3">
          <p className="font-body text-sm text-muted-foreground">
            {localState.selectedToken
              ? `Place token ${localState.selectedToken} — tap a tile`
              : "Select a token below, then tap a tile"}
          </p>
        </motion.div>
        <div className="flex-1 flex items-center justify-center px-4 py-2">
          <Board state={localState} onTileClick={handleLocalTileClick} />
        </div>
        <div className="p-4 space-y-2 max-h-[40vh] overflow-y-auto">
          {localState.players.map(p => (
            <TokenSelector
              key={p.id}
              player={p}
              selectedToken={localState.currentPlayerIndex === p.id ? localState.selectedToken : null}
              onSelect={handleLocalSelectToken}
              isActive={localState.currentPlayerIndex === p.id}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Online Mode ───
  if (online.phase === "menu") {
    return (
      <OnlineLobby
        onCreateRoom={online.createRoom}
        onJoinRoom={online.joinRoom}
        onBack={() => { online.reset(); setMode("menu"); }}
        error={online.error}
      />
    );
  }

  if (online.phase === "waiting" && online.room) {
    return (
      <WaitingRoom
        room={online.room}
        isHost={online.myPlayerIndex === 0}
        onStart={online.startGame}
      />
    );
  }

  if ((online.phase === "playing" || online.phase === "finished") && online.gameState) {
    const gs = online.gameState;

    // Start music on first render of online playing phase
    if (gs.phase === "playing" && !isMusicPlaying()) {
      playGameStart();
      startMusic();
    }
    if (gs.phase === "finished" && isMusicPlaying()) {
      playGameEnd();
      stopMusic();
    }

    // Auto-select the required token for online play
    const autoSelectedToken = online.isMyTurn
      ? getNextRequiredToken(gs.players[gs.currentPlayerIndex])
      : null;

    // Inject selected token for display
    const displayState: GameState = {
      ...gs,
      selectedToken: autoSelectedToken,
    };

    if (gs.phase === "finished") {
      return (
        <div className="min-h-screen star-field flex flex-col items-center justify-center p-4 gap-6">
          <Board state={displayState} onTileClick={() => {}} />
          <ScoreBoard state={displayState} onRestart={() => { online.reset(); setMode("menu"); }} />
        </div>
      );
    }

    return (
      <div className="min-h-screen star-field flex flex-col">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-display text-sm text-foreground tracking-widest">BLACK HOLE</h1>
          <div className="flex items-center gap-2">
            {online.room && (
              <span className="font-display text-xs text-muted-foreground tracking-wider">{online.room.roomCode}</span>
            )}
            <AudioToggle />
            <button onClick={() => { stopMusic(); online.reset(); setMode("menu"); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <motion.div key={gs.currentPlayerIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4 pb-3">
          <p className="font-body text-sm text-muted-foreground">
            {online.isMyTurn
              ? `Place token ${autoSelectedToken} — tap a tile`
              : `Waiting for ${gs.players[gs.currentPlayerIndex]?.name}...`
            }
          </p>
        </motion.div>
        <div className="flex-1 flex items-center justify-center px-4 py-2">
          <Board state={displayState} onTileClick={handleOnlineTileClick} />
        </div>
        <div className="p-4 space-y-2 max-h-[40vh] overflow-y-auto">
          {gs.players.map(p => (
            <TokenSelector
              key={p.id}
              player={p}
              selectedToken={online.isMyTurn && gs.currentPlayerIndex === p.id ? onlineSelectedToken : null}
              onSelect={v => online.isMyTurn && gs.currentPlayerIndex === p.id && setOnlineSelectedToken(v)}
              isActive={online.isMyTurn && gs.currentPlayerIndex === p.id}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
