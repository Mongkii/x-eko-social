
"use client";

import Image from 'next/image';
import type { FeedItemData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsDown, Plus, Check, ThumbsUp, MessageCircle, Share2, PlayCircle, Facebook, Twitter, Instagram, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { enUS, arSA, es, fr, hi, ru, de } from 'date-fns/locale'; // Import locales

// Map next-intl locales to date-fns locales
const dateFnsLocales: { [key: string]: Locale } = {
  en: enUS,
  ar: arSA,
  es: es,
  fr: fr,
  hi: hi,
  ru: ru,
  de: de,
  // Add ur, zh, tl if date-fns supports them or use a fallback
};

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
  const t = useTranslations('FeedItemCard');
  const currentLocale = useLocale();
  const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const SWIPE_THRESHOLD = 80;

  useEffect(() => {
    if (videoElementRef.current) {
      audioRef(videoElementRef.current); // Pass ref up to parent
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
      // Assuming timestamp is Firestore Timestamp-like or ISO string
      const date = timestamp?.toDate ? timestamp.toDate() : parseISO(timestamp);
      const locale = dateFnsLocales[currentLocale] || enUS;
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "some time ago";
    }
  };

  const itemTranscript = item.transcript?.[currentLocale] || item.transcript?.['en'] || item.description;
  const itemTitle = item.title || item.transcript?.[currentLocale]?.substring(0, 50) || item.transcript?.['en']?.substring(0, 50) || t('audioBy', {user: item.userId});


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
            {item.audioUrl ? (
              <>
                <video
                  ref={videoElementRef}
                  src={item.audioUrl} // Using HTML5 video for audio playback control
                  poster={item.posterUrl}
                  loop={false} // Continuous play handled by parent
                  muted={false} // User controls volume, or app global mute
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
            ) : item.posterUrl ? ( // Fallback to image if no audio
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
              {item.type === 'ad' && <Badge variant="destructive">{t('adBadge')}</Badge>}
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
          {item.advertiser && <p className="text-xs text-muted-foreground">{t('sponsoredBy', {advertiser: item.advertiser})}</p>}
          <CardDescription className="text-sm">{itemTranscript}</CardDescription>
          <p className="text-xs text-muted-foreground">{t('postedOn', {date: getFormattedDate(item.createdAt)})}</p>
          
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{t('hashtags')}</p>
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
              {item.type === 'ad' ? t('rateThisAdLabel') : t('rateThisContentLabel')}:
            </p>
            <StarRating currentRating={item.userRating} onRatingChange={(rating) => onRate(item.id, rating)} size={20} />
          </div>
          <div className="flex w-full justify-around items-center">
            <Button variant="ghost" size="icon" onClick={() => onToggleDislike(item.id)} className={cn(item.isDisliked && "text-destructive")}>
              <ThumbsDown className={cn(item.isDisliked && "fill-destructive")} />
              <span className="sr-only">{t('dislikeAction')}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onToggleLike(item.id)} className={cn(item.isLiked && "text-primary")}>
              <Heart className={cn(item.isLiked && "fill-primary")}/>
              <span className="sr-only">{t('likeAction')}</span>
            </Button>
             <Button variant="ghost" size="icon">
              <MessageCircle />
              <span className="sr-only">{t('commentAction')}</span>
            </Button>
            {item.type !== 'ad' && (
              <Button variant="ghost" size="icon">
                <Share2 />
                <span className="sr-only">{t('shareAction')}</span>
              </Button>
            )}
          </div>

          {item.type === 'ad' && (
            <div className="w-full">
              <div className="flex w-full justify-center items-center gap-4">
                <Button variant="outline" size="icon" aria-label={t('shareOnFacebook')} className="rounded-full">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" aria-label={t('shareOnTwitter')} className="rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" aria-label={t('shareOnInstagram')} className="rounded-full">
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
