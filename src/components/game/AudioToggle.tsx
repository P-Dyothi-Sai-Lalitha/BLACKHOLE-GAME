/**
 * AudioToggle — mute/unmute button matching the space theme.
 * Placed in the top-right corner of game screens.
 */
import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { toggleMute, getMuted } from "@/lib/audioManager";

export function AudioToggle() {
  const [muted, setMuted] = useState(getMuted());

  const handleToggle = () => {
    toggleMute();
    setMuted(getMuted());
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      title={muted ? "Unmute" : "Mute"}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
}
