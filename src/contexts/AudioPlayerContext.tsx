
"use client";

import type { EkoPost } from "@/lib/types";
import type { ReactNode} from 'react';
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface TrackDetails extends Pick<EkoPost, 'id' | 'audioURL' | 'username' | 'userAvatarURL' | 'textContent'> {
  // Add any other specific details needed for the player from EkoPost
}

interface AudioPlayerContextType {
  currentTrackDetails: TrackDetails | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number; // 0 to 100
  currentTime: number; // in seconds
  duration: number; // in seconds
  queue: TrackDetails[];
  currentIndexInQueue: number | null;
  playNewTrack: (post: TrackDetails, newQueue?: TrackDetails[], startIndex?: number) => void;
  togglePlayPause: () => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  handleSeek: (newProgress: number) => void; // newProgress is 0-100
  clearPlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrackDetails, setCurrentTrackDetails] = useState<TrackDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [queue, setQueue] = useState<TrackDetails[]>([]);
  const [currentIndexInQueue, setCurrentIndexInQueue] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Define useCallback functions before the useEffect that depends on them

  const playNewTrack = useCallback((post: TrackDetails, newQueue: TrackDetails[] = [], startIndex: number = 0) => {
    const audio = audioRef.current;
    if (!audio || !post.audioURL) return;

    setIsLoading(true);
    setCurrentTrackDetails(post);
    setQueue(newQueue.length > 0 ? newQueue : [post]);
    setCurrentIndexInQueue(newQueue.length > 0 ? startIndex : 0);
    audio.src = post.audioURL;
    audio.load(); // Important to load the new source
    // Play will be triggered by 'loadedmetadata' or 'canplay' if isPlaying was true or becomes true.
    // For explicit play, set isPlaying to true here.
    setIsPlaying(true); 
    audio.play().catch(e => {
      console.error("Error initiating playback:", e);
      setIsLoading(false);
      setIsPlaying(false);
    });
  }, []); // audioRef is stable, state setters are stable

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackDetails) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrackDetails]);

  const playNextTrack = useCallback(() => {
    if (queue.length > 0 && currentIndexInQueue !== null && currentIndexInQueue < queue.length - 1) {
      const nextIndex = currentIndexInQueue + 1;
      playNewTrack(queue[nextIndex], queue, nextIndex);
    } else {
      // End of queue or no queue
      setIsPlaying(false);
      // Optionally clear player or loop current track/queue
    }
  }, [queue, currentIndexInQueue, playNewTrack]);

  const playPreviousTrack = useCallback(() => {
    if (queue.length > 0 && currentIndexInQueue !== null && currentIndexInQueue > 0) {
      const prevIndex = currentIndexInQueue - 1;
      playNewTrack(queue[prevIndex], queue, prevIndex);
    }
  }, [queue, currentIndexInQueue, playNewTrack]);

  const handleSeek = useCallback((newProgress: number) => { // newProgress is 0-100
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = (newProgress / 100) * audio.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newProgress);
  }, []); // audioRef is stable, state setters are stable
  
  const clearPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
        audio.pause();
        audio.src = "";
    }
    setCurrentTrackDetails(null);
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setQueue([]);
    setCurrentIndexInQueue(null);
  }, []); // audioRef is stable, state setters are stable

  useEffect(() => {
    // Create audio element on mount (client-side only)
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if(isPlaying) audio.play().catch(e => console.error("Error playing audio:", e));
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const handleEnded = () => {
      playNextTrack();
    };
    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e: Event) => {
      console.error("Audio Error:", (e.target as HTMLAudioElement).error);
      setIsLoading(false);
      setIsPlaying(false);
      // Optionally: toast error
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);


    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playNextTrack]); // playNextTrack is now defined before this useEffect


  return (
    <AudioPlayerContext.Provider value={{ 
      currentTrackDetails, 
      isPlaying, 
      isLoading, 
      progress, 
      currentTime, 
      duration,
      queue,
      currentIndexInQueue,
      playNewTrack, 
      togglePlayPause,
      playNextTrack,
      playPreviousTrack,
      handleSeek,
      clearPlayer
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
