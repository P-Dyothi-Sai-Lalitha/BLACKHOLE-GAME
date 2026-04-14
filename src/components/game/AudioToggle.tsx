import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { toggleMute, getMuted, startMusic } from "@/lib/audioManager";

export function AudioToggle() {
  const [muted, setMuted] = useState(getMuted());

  // ─── Auto-play Logic ───
  useEffect(() => {
    // Attempt to start music whenever the toggle is mounted
    // Browsers usually allow this after the first click anywhere on the page
    if (!muted) {
      startMusic();
    }
  }, [muted]);

  const handleToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
    
    // If we just unmuted, make sure the music starts playing
    if (!newState) {
      startMusic();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-all border border-transparent ${
        muted 
          ? "text-muted-foreground hover:text-red-400" 
          : "text-primary hover:text-primary-foreground hover:bg-primary/20 glow-primary-sm"
      }`}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      title={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4 animate-pulse-subtle" />
      )}
    </button>
  );
}
