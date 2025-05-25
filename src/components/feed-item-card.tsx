
"use client";

import Image from 'next/image';
import type { FeedItemData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsDown, Plus, Check, ThumbsUp, MessageCircle, Share2, Play, Pause, Gift, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

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
    if (!timestamp) { // Guard against null or undefined timestamp
      return "some time ago";
    }
    try {
      // Check if it's a Firebase Timestamp-like object
      if (timestamp && typeof timestamp === 'object' && typeof timestamp.toDate === 'function') {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
      }
      // Assume it's an ISO string or can be parsed by Date
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      if (isNaN(date.getTime())) { // Check if date is valid
        console.error("Error formatting date: Invalid date value", timestamp);
        return "a while ago";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error("Error formatting date:", e, "Timestamp:", timestamp);
      return "recently"; // Fallback for other errors
    }
  };


  const itemTranscript = item.transcript?.['en'] || item.description || "No description available.";
  const itemTitle = item.title || item.transcript?.['en']?.substring(0, 50) || `Item ${item.id}`;


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
            {item.type === 'ad' && item.videoUrl ? (
              <>
                <video
                  ref={videoElementRef}
                  src={item.videoUrl}
                  poster={item.sourceUrl}
                  loop
                  muted
                  autoPlay
                  playsInline
                  onEnded={onAudioEnded}
                  className="object-cover w-full h-full"
                  data-ai-hint={item.dataAiHint}
                />
                 <div className="absolute top-2 right-2">
                   <Badge variant="destructive">Ad</Badge>
                 </div>
              </>
            ) : item.audioUrl ? ( // For content EkoDrops (voice posts)
              <>
                {/* Display a poster image for audio, or a placeholder */}
                {item.posterUrl ? (
                   <Image
                    src={item.posterUrl}
                    alt={itemTitle}
                    fill
                    className="object-cover"
                    data-ai-hint={item.dataAiHint}
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    Voice Post
                  </div>
                )}
                <video // Hidden video element for audio control
                  ref={videoElementRef}
                  src={item.audioUrl}
                  onEnded={onAudioEnded}
                  className="hidden"
                />
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={() => onPlayRequest(item.id)}
                  >
                  {isPlaying ? <Pause className="w-12 h-12 text-white/70" /> : <PlayCircle className="w-16 h-16 text-white/70 opacity-80" />}
                </div>
              </>
            ) : item.sourceUrl ? ( // Fallback for content items that are images (not typical for Eko BRD)
              <Image
                src={item.sourceUrl}
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
          <p className="text-xs text-muted-foreground">
            Posted {getFormattedDate(item.createdAt)} {item.userId && `by ${item.userId}`}
          </p>

          {(item.categories || item.hashtags) && (item.categories?.length || 0) + (item.hashtags?.length || 0) > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Categories:</p>
              <div className="flex flex-wrap gap-2">
                {(item.categories || item.hashtags)?.map((category) => (
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
              <Heart className={cn(item.isLiked && "fill-primary")} />
              <span className="sr-only">Like</span>
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle />
              <span className="sr-only">Comment</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 />
              <span className="sr-only">Share</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

