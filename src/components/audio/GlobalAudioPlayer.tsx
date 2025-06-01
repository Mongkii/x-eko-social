
"use client";

import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, SkipForward, SkipBack, Loader2, X } from "lucide-react";
import Link from "next/link";
import { formatTimestampSimple } from "@/lib/format-timestamp";
import { cn } from "@/lib/utils";

export function GlobalAudioPlayer() {
  const {
    currentTrackDetails,
    isPlaying,
    isLoading,
    progress,
    currentTime,
    duration,
    togglePlayPause,
    playNextTrack,
    playPreviousTrack,
    handleSeek,
    clearPlayer,
    queue,
    currentIndexInQueue
  } = useAudioPlayer();

  if (!currentTrackDetails) {
    return null; 
  }

  const hasPrevious = currentIndexInQueue !== null && currentIndexInQueue > 0;
  const hasNext = currentIndexInQueue !== null && currentIndexInQueue < queue.length - 1;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-background/90 backdrop-blur-md border-t border-border/60",
      "p-3 shadow-lg transition-transform duration-300 ease-in-out",
      currentTrackDetails ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3 flex-shrink-0 w-1/4 max-w-xs">
          <Avatar className="h-10 w-10" data-ai-hint="user avatar">
            <AvatarImage src={currentTrackDetails.userAvatarURL || ""} alt={currentTrackDetails.username} />
            <AvatarFallback>{currentTrackDetails.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium truncate" title={currentTrackDetails.textContent}>
                {currentTrackDetails.textContent ? 
                    (currentTrackDetails.textContent.length > 30 ? currentTrackDetails.textContent.substring(0, 30) + "..." : currentTrackDetails.textContent) 
                    : "Audio EkoDrop"
                }
            </p>
            <Link href={`/profile/${currentTrackDetails.username.toLowerCase()}`} passHref>
              <span className="text-xs text-muted-foreground hover:underline cursor-pointer">
                @{currentTrackDetails.username}
              </span>
            </Link>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPreviousTrack}
              disabled={!hasPrevious || isLoading}
              aria-label="Previous track"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading || !currentTrackDetails.audioURL}
              className="h-10 w-10"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playNextTrack}
              disabled={!hasNext || isLoading}
              aria-label="Next track"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <div className="w-full flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTimestampSimple(currentTime)}
            </span>
            <Slider
              value={[progress]}
              onValueChange={(value) => handleSeek(value[0])}
              max={100}
              step={0.1}
              className="flex-grow"
              disabled={isLoading || !duration}
              aria-label="Seek audio"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTimestampSimple(duration)}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={clearPlayer} aria-label="Close player">
                <X className="h-5 w-5"/>
            </Button>
        </div>

      </div>
    </div>
  );
}
