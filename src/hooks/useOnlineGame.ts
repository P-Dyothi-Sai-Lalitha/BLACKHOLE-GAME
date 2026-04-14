import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { initGameState, placeToken, type GameState } from "@/lib/gameLogic";
import type { Json } from "@/integrations/supabase/types";

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePlayerId(): string {
  let id = localStorage.getItem("blackhole_player_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("blackhole_player_id", id);
  }
  return id;
}

// Serialize/deserialize game state to/from JSON
function gameStateToJson(state: GameState): Json {
  return JSON.parse(JSON.stringify(state)) as Json;
}

function jsonToGameState(json: Json): GameState {
  return json as unknown as GameState;
}

export type OnlinePhase = "menu" | "creating" | "waiting" | "playing" | "finished";

export interface OnlineRoom {
  id: string;
  roomCode: string;
  playerCount: number;
  playerNames: string[];
  playerIds: string[];
  status: string;
}

export function useOnlineGame() {
  const [phase, setPhase] = useState<OnlinePhase>("menu");
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const playerId = useRef(generatePlayerId());

  // Subscribe to room changes
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          const data = payload.new;
          setRoom(prev => prev ? {
            ...prev,
            playerNames: data.player_names as string[],
            playerIds: data.player_ids as string[],
            status: data.status as string,
          } : null);

          if (data.game_state) {
            setGameState(jsonToGameState(data.game_state as Json));
          }

          // Update my player index
          const ids = data.player_ids as string[];
          const idx = ids.indexOf(playerId.current);
          if (idx !== -1) setMyPlayerIndex(idx);

          if (data.status === "playing" && phase === "waiting") {
            setPhase("playing");
          }
          if (data.status === "finished") {
            setPhase("finished");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, phase]);

  const createRoom = useCallback(async (playerCount: number, hostName: string) => {
    setError(null);
    const code = generateRoomCode();
    const pid = playerId.current;

    const { data, error: err } = await supabase
      .from("game_rooms")
      .insert({
        room_code: code,
        host_player_id: pid,
        player_count: playerCount,
        player_names: [hostName],
        player_ids: [pid],
        status: "waiting",
      })
      .select()
      .single();

    if (err || !data) {
      setError(err?.message || "Failed to create room");
      return;
    }

    setRoom({
      id: data.id,
      roomCode: data.room_code,
      playerCount: data.player_count,
      playerNames: data.player_names,
      playerIds: data.player_ids,
      status: data.status,
    });
    setMyPlayerIndex(0);
    setPhase("waiting");
  }, []);

  const joinRoom = useCallback(async (code: string, playerName: string) => {
    setError(null);
    const pid = playerId.current;

    const { data, error: err } = await supabase
      .from("game_rooms")
      .select()
      .eq("room_code", code.toUpperCase())
      .single();

    if (err || !data) {
      setError("Room not found");
      return;
    }

    if (data.status !== "waiting") {
      setError("Game already started");
      return;
    }

    const ids = data.player_ids as string[];
    if (ids.includes(pid)) {
      // Already in room, just re-sync
      const idx = ids.indexOf(pid);
      setRoom({
        id: data.id,
        roomCode: data.room_code,
        playerCount: data.player_count,
        playerNames: data.player_names,
        playerIds: data.player_ids,
        status: data.status,
      });
      setMyPlayerIndex(idx);
      setPhase("waiting");
      return;
    }

    if (ids.length >= data.player_count) {
      setError("Room is full");
      return;
    }

    const newNames = [...(data.player_names as string[]), playerName];
    const newIds = [...ids, pid];

    const { error: updateErr } = await supabase
      .from("game_rooms")
      .update({ player_names: newNames, player_ids: newIds })
      .eq("id", data.id);

    if (updateErr) {
      setError("Failed to join room");
      return;
    }

    setRoom({
      id: data.id,
      roomCode: data.room_code,
      playerCount: data.player_count,
      playerNames: newNames,
      playerIds: newIds,
      status: data.status,
    });
    setMyPlayerIndex(newIds.indexOf(pid));
    setPhase("waiting");
  }, []);

  const startGame = useCallback(async () => {
    if (!room) return;
    const state = initGameState(room.playerCount, room.playerNames);

    await supabase
      .from("game_rooms")
      .update({
        status: "playing",
        game_state: gameStateToJson(state),
      })
      .eq("id", room.id);

    setGameState(state);
    setPhase("playing");
  }, [room]);

  const makeMove = useCallback(async (tileId: number, tokenValue: number) => {
    if (!gameState || !room) return;
    if (gameState.currentPlayerIndex !== myPlayerIndex) return;

    const newState = placeToken(gameState, tileId, tokenValue);
    if (newState === gameState) return; // invalid move

    const status = newState.phase === "finished" ? "finished" : "playing";

    await supabase
      .from("game_rooms")
      .update({
        game_state: gameStateToJson(newState),
        status,
      })
      .eq("id", room.id);

    setGameState(newState);
    if (status === "finished") setPhase("finished");
  }, [gameState, room, myPlayerIndex]);

  const reset = useCallback(() => {
    setPhase("menu");
    setRoom(null);
    setGameState(null);
    setMyPlayerIndex(-1);
    setError(null);
  }, []);

  return {
    phase,
    room,
    gameState,
    myPlayerIndex,
    error,
    isMyTurn: gameState ? gameState.currentPlayerIndex === myPlayerIndex : false,
    createRoom,
    joinRoom,
    startGame,
    makeMove,
    reset,
  };
}
