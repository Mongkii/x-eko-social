
"use client";

import Image from 'next/image';
import type { FeedItemData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsDown, Plus, Check, ThumbsUp, MessageCircle, Share2, PlayCircle, PauseCircle, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';

interface FeedItemCardProps {
  item: FeedItemData;
  currentLocale: string;
  followedCategories: Set<string>;
  onRate: (itemId: string, rating: number) => void;
  onToggleLike: (itemId: string) => void;
  onToggleDislike: (itemId: string) => void;
  onToggleFollowCategory: (category: string) => void;
  isPlaying: boolean;
  onPlayRequest: (itemId: string) => void;
  onAudioEnded: () => void;
  audioRef: (el: HTMLVideoElement | null) => void; // Using <video> for audio for better UI control
  onSimulatedReward?: () => void; // For rewarded ad simulation
}

export function FeedItemCard({
  item,
  currentLocale,
  followedCategories,
  onRate,
  onToggleLike,
  onToggleDislike,
  onToggleFollowCategory,
  isPlaying,
  onPlayRequest,
  onAudioEnded,
  audioRef,
  onSimulatedReward,
}: FeedItemCardProps) {
  const t = useTranslations('FeedItemCard');
  const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLVideoElement | null>(null); // Using <video> for audio

  const SWIPE_THRESHOLD = 80; // Pixels

  // Attach ref and manage play/pause state
  useEffect(() => {
    if (audioElementRef.current) {
      audioRef(audioElementRef.current); // Pass the ref up to parent
      if (isPlaying) {
        audioElementRef.current.play().catch(e => console.warn("Autoplay prevented for item:", item.id, e));
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isPlaying, audioRef, item.id]);


  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    touchStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    document.body.style.overflow = 'hidden'; // Prevent page scroll during card swipe
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
      if (translateX > 0) onToggleLike(item.id); // Swipe right to like
      else onToggleDislike(item.id); // Swipe left to dislike
    }
    setTranslateX(0);
    setSwipeState(null);
    touchStartX.current = 0;
    document.body.style.overflow = ''; // Re-enable page scroll
  };
  
  // Mouse event handlers for desktop swipe simulation
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const handleMouseDown = (e: MouseEvent) => handleTouchStart(e as unknown as React.MouseEvent<HTMLDivElement>);
    const handleMouseMove = (e: MouseEvent) => handleTouchMove(e as unknown as React.MouseEvent<HTMLDivElement>);
    const handleMouseUp = () => handleTouchEnd();
    const handleMouseLeave = () => { // If mouse leaves card mid-swipe
      if (touchStartX.current !== 0) handleTouchEnd();
    };

    cardElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove); // Listen on document for wider swipe area
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
    if (!timestamp) return t('dateUnknown');
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : (typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp));
      if (isNaN(date.getTime())) return t('dateInvalid');
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error("Error formatting date:", e, "Timestamp:", timestamp);
      return t('dateRecently');
    }
  };

  const itemTitle = item.transcript?.[currentLocale]?.substring(0, 70) || item.transcript?.['en']?.substring(0, 70) || `EkoDrop ${item.id}`;
  const itemDescription = item.transcript?.[currentLocale] || item.transcript?.['en'] || t('noDescription');

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
          item.isAd ? 'border-primary border-2' : ''
        )}
        style={{ transform: `translateX(${translateX}px) rotate(${translateX / 20}deg)` }}
      >
        <CardHeader className="relative p-0">
          <div className="aspect-square w-full relative bg-muted overflow-hidden rounded-t-lg">
            {item.audioURL ? (
              <>
                {item.posterUrl ? (
                  <Image src={item.posterUrl} alt={itemTitle} fill className="object-cover" data-ai-hint={item.dataAiHint || "audio waveform"} priority />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-primary/30 flex items-center justify-center text-card-foreground/70">
                    <span className="text-lg font-semibold">{t('voicePost')}</span>
                  </div>
                )}
                {/* Hidden video element used for audio playback control */}
                <video
                  ref={audioElementRef}
                  src={item.audioURL}
                  onEnded={onAudioEnded}
                  className="hidden"
                  playsInline /* Important for mobile */
                  preload="auto"
                />
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group"
                    onClick={() => onPlayRequest(item.id)}
                  >
                  {isPlaying 
                    ? <PauseCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors" /> 
                    : <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors" />
                  }
                </div>
                {item.isAd && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive">{t('adBadge')}</Badge>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">{t('noMedia')}</p>
              </div>
            )}

            {/* Swipe indicators */}
            {swipeState === 'right' && <div className="absolute top-1/2 left-8 -translate-y-1/2 opacity-80"><ThumbsUp className="w-16 h-16 text-green-500" /></div>}
            {swipeState === 'left' && <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-80"><ThumbsDown className="w-16 h-16 text-red-500" /></div>}
          </div>
        </CardHeader>

        <CardContent className="flex-grow p-4 space-y-2 overflow-y-auto">
          <CardTitle className="text-lg">{itemTitle}</CardTitle>
          {item.isAd && item.advertiserName && <p className="text-xs text-muted-foreground">{t('sponsoredBy', { advertiser: item.advertiserName })}</p>}
          <CardDescription className="text-sm whitespace-pre-wrap">{itemDescription}</CardDescription>
          <p className="text-xs text-muted-foreground">
            {t('postedDate', { date: getFormattedDate(item.createdAt) })} {item.userId && `${t('byUser')} ${item.userId}`}
          </p>
           <p className="text-xs text-muted-foreground">{t('durationLabel')}: {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</p>

          {item.hashtags && item.hashtags.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs font-medium text-muted-foreground">{t('categoriesLabel')}:</p>
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
          {item.isAd && onSimulatedReward && (
            <Button onClick={onSimulatedReward} variant="outline" className="w-full mb-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900">
              <Gift className="mr-2 h-4 w-4" /> {t('watchRewardedAdButton')}
            </Button>
          )}
          <div className="w-full">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {item.isAd ? t('rateThisAdLabel') : t('rateThisContentLabel')}
            </p>
            <StarRating currentRating={item.userRating || 0} onRatingChange={(rating) => onRate(item.id, rating)} size={20} />
          </div>
          <div className="flex w-full justify-around items-center">
            <Button variant="ghost" size="icon" onClick={() => onToggleDislike(item.id)} className={cn(item.isDisliked && "text-destructive")}>
              <ThumbsDown className={cn("h-5 w-5", item.isDisliked && "fill-destructive")} />
              <span className="sr-only">{t('dislikeAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onToggleLike(item.id)} className={cn(item.isLiked && "text-primary")}>
              <Heart className={cn("h-5 w-5", item.isLiked && "fill-primary")} />
              <span className="sr-only">{t('likeAction')}</span>
            </Button>
            <Button variant="ghost" size="icon"> {/* Placeholder */}
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">{t('commentAction')}</span>
            </Button>
            <Button variant="ghost" size="icon"> {/* Placeholder */}
              <Share2 className="h-5 w-5" />
              <span className="sr-only">{t('shareAction')}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
