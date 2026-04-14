
-- Game rooms table for online multiplayer
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_player_id TEXT NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 2 CHECK (player_count BETWEEN 2 AND 4),
  player_names TEXT[] NOT NULL DEFAULT '{}',
  player_ids TEXT[] NOT NULL DEFAULT '{}',
  game_state JSONB,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Everyone can read rooms (needed for joining)
CREATE POLICY "Anyone can view game rooms" ON public.game_rooms FOR SELECT USING (true);

-- Anyone can create rooms
CREATE POLICY "Anyone can create game rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);

-- Anyone can update rooms (game state updates)
CREATE POLICY "Anyone can update game rooms" ON public.game_rooms FOR UPDATE USING (true);

-- Anyone can delete rooms
CREATE POLICY "Anyone can delete game rooms" ON public.game_rooms FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;

-- Index for room code lookups
CREATE INDEX idx_game_rooms_code ON public.game_rooms (room_code);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
