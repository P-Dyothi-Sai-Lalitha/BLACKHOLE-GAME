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
import {
  initGameState,
  placeToken,
  getNextRequiredToken,
  type GameState,
} from "@/lib/gameLogic";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import {
  RotateCcw,
  Wifi,
  Monitor,
  HelpCircle,
} from "lucide-react";
import { AudioToggle } from "./AudioToggle";
import {
  playClick,
  playPlace,
  playGameStart,
  playGameEnd,
  startMusic,
  stopMusic,
} from "@/lib/audioManager";

type Mode = "menu" | "local" | "online";

export function GameRoom() {
  const [mode, setMode] = useState<Mode>("menu");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [localState, setLocalState] = useState<GameState | null>(null);

  const online = useOnlineGame();

  const handleLocalStart = useCallback(
    (playerCount: number, names: string[]) => {
      const state = initGameState(playerCount, names);
      const firstPlayer = state.players[state.currentPlayerIndex];
      const nextToken = getNextRequiredToken(firstPlayer);

      setLocalState({
        ...state,
        selectedToken: nextToken,
      });

      playGameStart();
      startMusic();
    },
    []
  );

  const handleLocalSelectToken = useCallback((value: number) => {
    setLocalState((prev) =>
      prev ? { ...prev, selectedToken: value } : null
    );
  }, []);

  const handleLocalTileClick = useCallback((tileId: number) => {
    setLocalState((prev) => {
      if (!prev || prev.selectedToken === null) return prev;

      const newState = placeToken(
        prev,
        tileId,
        prev.selectedToken
      );

      if (newState === prev) return prev;

      playPlace();

      if (newState.phase === "finished") {
        playGameEnd();
        stopMusic();
      }

      if (newState.phase === "playing") {
        const nextPlayer =
          newState.players[newState.currentPlayerIndex];
        const nextToken = getNextRequiredToken(nextPlayer);

        return {
          ...newState,
          selectedToken: nextToken,
        };
      }

      return newState;
    });
  }, []);

  const handleOnlineTileClick = useCallback(
    (tileId: number) => {
      if (!online.gameState) return;

      const currentPlayer =
        online.gameState.players[
          online.gameState.currentPlayerIndex
        ];

      const required = getNextRequiredToken(currentPlayer);

      playPlace();
      online.makeMove(tileId, required);
    },
    [online]
  );

  const [onlineSelectedToken, setOnlineSelectedToken] =
    useState<number | null>(null);

  // ───────────────── MENU ─────────────────
  if (mode === "menu") {
    return (
      <div className="min-h-screen star-field flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
        >
          <h1 className="font-display text-3xl tracking-widest mb-2">
            BLACK HOLE
          </h1>

          <p className="text-muted-foreground text-sm mb-8">
            Strategy game · Lowest score wins
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                playClick();
                setMode("local");
              }}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              LOCAL MULTIPLAYER
            </button>

            <button
              onClick={() => {
                playClick();
                setMode("online");
              }}
              className="w-full py-4 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              ONLINE MULTIPLAYER
            </button>

            <button
              onClick={() => setShowHowToPlay(true)}
              className="w-full py-3 rounded-xl border border-border flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              HOW TO PLAY
            </button>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <InstallPrompt />
        </div>

        <HowToPlayModal
          open={showHowToPlay}
          onOpenChange={setShowHowToPlay}
        />
      </div>
    );
  }

  // ───────────────── LOCAL MODE ─────────────────
  if (mode === "local") {
    if (!localState) {
      return (
        <div className="min-h-screen star-field flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMode("menu")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>

              <h1 className="font-display text-sm tracking-widest">
                BLACK HOLE
              </h1>

              <div className="w-10" />
            </div>

            <GameSetup onStart={handleLocalStart} />
          </motion.div>
        </div>
      );
    }

    if (localState.phase === "finished") {
      return (
        <div className="min-h-screen star-field flex flex-col items-center justify-center p-4 gap-6">
          <Board state={localState} onTileClick={() => {}} />
          <ScoreBoard
            state={localState}
            onRestart={() => {
              setLocalState(null);
              setMode("menu");
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen star-field flex flex-col">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => {
              stopMusic();
              setLocalState(null);
              setMode("menu");
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>

          <h1 className="font-display text-sm tracking-widest">
            BLACK HOLE
          </h1>

          <div className="flex items-center gap-2">
            <AudioToggle />
            <button
              onClick={() => {
                stopMusic();
                setLocalState(null);
                setMode("menu");
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <motion.div className="text-center px-4 pb-3">
          <p className="text-sm text-muted-foreground">
            {localState.selectedToken
              ? `Place token ${localState.selectedToken}`
              : "Select a token"}
          </p>
        </motion.div>

        <div className="flex-1 flex items-center justify-center px-4">
          <Board
            state={localState}
            onTileClick={handleLocalTileClick}
          />
        </div>

        <div className="p-4 space-y-2">
          {localState.players.map((p) => (
            <TokenSelector
              key={p.id}
              player={p}
              selectedToken={
                localState.currentPlayerIndex === p.id
                  ? localState.selectedToken
                  : null
              }
              onSelect={handleLocalSelectToken}
              isActive={
                localState.currentPlayerIndex === p.id
              }
            />
          ))}
        </div>
      </div>
    );
  }

  // ───────────────── ONLINE MODE ─────────────────
  if (online.phase === "menu") {
    return (
      <OnlineLobby
        onCreateRoom={online.createRoom}
        onJoinRoom={online.joinRoom}
        onBack={() => {
          online.reset();
          setMode("menu");
        }}
        error={online.error}
      />
    );
  }

  return null;
}
