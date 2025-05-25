
"use client";

import Image from 'next/image';
import type { FeedItemData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsDown, Plus, Check, ThumbsUp, MessageCircle, Share2, PlayCircle, Facebook, Twitter, Instagram, Play, Pause, Gift } from 'lucide-react'; // Added Gift
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
// Removed date-fns locale imports as we are English-only now

interface FeedItemCardProps {
  item: FeedItemData;
  followedCategories: Set<string>;
  onRate: (itemId: string, rating: number) => void;
  onToggleLike: (itemId: string) => void;
  onToggleDislike: (itemId: string) => void;
  onToggleFollowCategory: (category: string) => void;
  isPlaying: boolean;
  onPlayRequest: (itemId: string) => void;
  onAudioEnded: () => void;
  audioRef: (el: HTMLVideoElement | null) => void;
}

export function FeedItemCard({
  item,
  followedCategories,
  onRate,
  onToggleLike,
  onToggleDislike,
  onToggleFollowCategory,
  isPlaying,
  onPlayRequest,
  onAudioEnded,
  audioRef,
}: FeedItemCardProps) {
  const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const SWIPE_THRESHOLD = 80;

  useEffect(() => {
    if (videoElementRef.current) {
      audioRef(videoElementRef.current); 
      if (isPlaying) {
        videoElementRef.current.play().catch(e => console.warn("Autoplay prevented:", e));
      } else {
        videoElementRef.current.pause();
      }
    }
  }, [isPlaying, audioRef]);


  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    touchStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    document.body.style.overflow = 'hidden'; 
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (touchStartX.current === 0) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - touchStartX.current;
    setTranslateX(deltaX);
    if (deltaX > SWIPE_THRESHOLD / 2) setSwipeState('right'); 
    else if (deltaX < -SWIPE_THRESHOLD / 2) setSwipeState('left'); 
    else setSwipeState(null);
  };

  const handleTouchEnd = () => {
    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      if (translateX > 0) onToggleLike(item.id);
      else onToggleDislike(item.id);
    }
    setTranslateX(0);
    setSwipeState(null);
    touchStartX.current = 0;
    document.body.style.overflow = ''; 
  };
  
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const handleMouseDown = (e: MouseEvent) => handleTouchStart(e as unknown as React.MouseEvent<HTMLDivElement>);
    const handleMouseMove = (e: MouseEvent) => handleTouchMove(e as unknown as React.MouseEvent<HTMLDivElement>);
    const handleMouseUp = () => handleTouchEnd();
    const handleMouseLeave = () => { 
      if (touchStartX.current !== 0) handleTouchEnd();
    };

    cardElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove); 
    document.addEventListener('mouseup', handleMouseUp);     
    cardElement.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      cardElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      cardElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [item.id, onToggleLike, onToggleDislike, translateX]);

  const getFormattedDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : parseISO(timestamp);
      return formatDistanceToNow(date, { addSuffix: true }); // Default locale (English)
    } catch (e) {
      console.error("Error formatting date:", e);
      return "some time ago";
    }
  };

  const itemTranscript = item.transcript?.['en'] || item.description; // Default to English transcript
  const itemTitle = item.title || item.transcript?.['en']?.substring(0, 50) || `Audio by ${item.userId}`;


  return (
    <div 
      ref={cardRef}
      className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center select-none p-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card
        className={cn(
          "w-full max-w-md mx-auto h-full flex flex-col shadow-2xl transition-transform duration-200 ease-out",
          item.type === 'ad' ? 'border-primary border-2' : ''
        )}
        style={{ transform: `translateX(${translateX}px) rotate(${translateX / 20}deg)` }}
      >
        <CardHeader className="relative p-0">
          <div className="aspect-square w-full relative bg-secondary overflow-hidden rounded-t-lg">
            {item.videoUrl ? ( // Prioritize videoUrl
              <>
                <video
                  ref={videoElementRef}
                  src={item.videoUrl}
                  poster={item.posterUrl} // Use posterUrl as poster for video
                  loop={item.type === 'ad'} // Loop ads, non-loop content (or parent controlled)
                  muted={item.type === 'ad'}  // Mute ads by default
                  playsInline
                  autoPlay={item.type === 'ad' || isPlaying} // Autoplay ads or if specifically playing
                  onEnded={onAudioEnded}
                  className="object-cover w-full h-full"
                  data-ai-hint={item.dataAiHint}
                />
                {!isPlaying && item.type === 'content' && ( // Show play button for content if not playing
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={() => onPlayRequest(item.id)}
                  >
                    <PlayCircle className="w-16 h-16 text-white/70 opacity-80" />
                  </div>
                )}
              </>
            ) : item.audioUrl ? ( // Fallback to audioUrl if videoUrl is not present
              <>
                <video // Using video tag for audio as well for consistent controls/events
                  ref={videoElementRef}
                  src={item.audioUrl}
                  poster={item.posterUrl}
                  loop={false}
                  muted={false}
                  playsInline
                  onEnded={onAudioEnded}
                  className="object-cover w-full h-full" 
                  data-ai-hint={item.dataAiHint}
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  onClick={() => onPlayRequest(item.id)}
                >
                  {!isPlaying && <PlayCircle className="w-16 h-16 text-white/70 opacity-80" />}
                </div>
              </>
            ) : item.posterUrl ? ( 
              <Image
                src={item.posterUrl}
                alt={itemTitle}
                fill
                className="object-cover"
                data-ai-hint={item.dataAiHint}
                priority 
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No media</p>
              </div>
            )}
             <div className="absolute top-2 right-2">
              {item.type === 'ad' && <Badge variant="destructive">Ad</Badge>}
            </div>
            {swipeState === 'right' && (
              <div className="absolute top-1/2 left-8 -translate-y-1/2 opacity-80">
                <ThumbsUp className="w-16 h-16 text-green-500" />
              </div>
            )}
            {swipeState === 'left' && (
              <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-80">
                <ThumbsDown className="w-16 h-16 text-red-500" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-4 space-y-2 overflow-y-auto">
          <CardTitle className="text-lg">{itemTitle}</CardTitle>
          {item.advertiser && <p className="text-xs text-muted-foreground">Sponsored by {item.advertiser}</p>}
          <CardDescription className="text-sm">{itemTranscript}</CardDescription>
          <p className="text-xs text-muted-foreground">Posted {getFormattedDate(item.createdAt)}</p>
          
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Hashtags:</p>
              <div className="flex flex-wrap gap-2">
                {item.hashtags.map((category) => (
                  <Button
                    key={category}
                    variant={followedCategories.has(category) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onToggleFollowCategory(category)}
                    className="text-xs h-7 px-2 py-1 rounded-full"
                  >
                    {followedCategories.has(category) ? <Check size={14} className="mr-1" /> : <Plus size={14} className="mr-1" />}
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-3 p-4 border-t">
          <div className="w-full">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {item.type === 'ad' ? "Rate this ad:" : "Rate this content:"}
            </p>
            <StarRating currentRating={item.userRating} onRatingChange={(rating) => onRate(item.id, rating)} size={20} />
          </div>
          <div className="flex w-full justify-around items-center">
            <Button variant="ghost" size="icon" onClick={() => onToggleDislike(item.id)} className={cn(item.isDisliked && "text-destructive")}>
              <ThumbsDown className={cn(item.isDisliked && "fill-destructive")} />
              <span className="sr-only">Dislike</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onToggleLike(item.id)} className={cn(item.isLiked && "text-primary")}>
              <Heart className={cn(item.isLiked && "fill-primary")}/>
              <span className="sr-only">Like</span>
            </Button>
             <Button variant="ghost" size="icon">
              <MessageCircle />
              <span className="sr-only">Comment</span>
            </Button>
            {item.type !== 'ad' && (
              <Button variant="ghost" size="icon">
                <Share2 />
                <span className="sr-only">Share</span>
              </Button>
            )}
          </div>

          {item.type === 'ad' && ( // Social share for ads
            <div className="w-full">
              <div className="flex w-full justify-center items-center gap-4">
                <Button variant="outline" size="icon" aria-label="Share on Facebook" className="rounded-full">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Share on Twitter" className="rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Share on Instagram" className="rounded-full">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
