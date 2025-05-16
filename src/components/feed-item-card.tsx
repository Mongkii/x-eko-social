
"use client";

import Image from 'next/image';
import { FeedItemData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, ThumbsDown, Plus, Check, ThumbsUp, MessageCircle, Share2, PlayCircle, Facebook, Twitter, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';

interface FeedItemCardProps {
  item: FeedItemData;
  followedCategories: Set<string>;
  onRate: (itemId: string, rating: number) => void;
  onToggleLike: (itemId: string) => void;
  onToggleDislike: (itemId: string) => void;
  onToggleFollowCategory: (category: string) => void;
}

export function FeedItemCard({
  item,
  followedCategories,
  onRate,
  onToggleLike,
  onToggleDislike,
  onToggleFollowCategory,
}: FeedItemCardProps) {
  const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80; // pixels

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    touchStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    document.body.style.overflow = 'hidden'; // Prevent page scroll during swipe
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (touchStartX.current === 0) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - touchStartX.current;
    setTranslateX(deltaX);
    if (deltaX > SWIPE_THRESHOLD / 2) {
      setSwipeState('right'); // Like
    } else if (deltaX < -SWIPE_THRESHOLD / 2) {
      setSwipeState('left'); // Dislike
    } else {
      setSwipeState(null);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      if (translateX > 0) {
        onToggleLike(item.id);
      } else {
        onToggleDislike(item.id);
      }
    }
    setTranslateX(0);
    setSwipeState(null);
    touchStartX.current = 0;
    document.body.style.overflow = ''; // Re-enable page scroll
  };
  
  // Effect for mouse events on desktop for swipe simulation (optional)
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const handleMouseDown = (e: MouseEvent) => handleTouchStart(e as unknown as React.MouseEvent<HTMLDivElement>);
    const handleMouseMove = (e: MouseEvent) => handleTouchMove(e as unknown as React.MouseEvent<HTMLDivElement>);
    const handleMouseUp = () => handleTouchEnd();
    const handleMouseLeave = () => { // Reset if mouse leaves card during swipe
      if (touchStartX.current !== 0) {
        handleTouchEnd();
      }
    };

    cardElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove); // Listen on document for wider swipe area
    document.addEventListener('mouseup', handleMouseUp);     // Listen on document
    cardElement.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      cardElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      cardElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, onToggleLike, onToggleDislike, translateX]);


  return (
    <div 
      ref={cardRef}
      className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card
        className={cn(
          "w-full max-w-md mx-auto h-[calc(100%-80px)] md:h-[calc(100%-100px)] flex flex-col shadow-2xl transition-transform duration-200 ease-out",
          item.type === 'ad' ? 'border-primary border-2' : ''
        )}
        style={{ transform: `translateX(${translateX}px) rotate(${translateX / 20}deg)` }}
      >
        <CardHeader className="relative p-0">
          <div className="aspect-[9/16] w-full relative bg-secondary overflow-hidden rounded-t-lg">
            <Image
              src={item.sourceUrl}
              alt={item.title}
              fill
              className="object-cover"
              data-ai-hint={item.dataAiHint}
              priority // For LCP on first items
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute top-4 left-4">
              {item.type === 'ad' && <Badge variant="destructive">AD</Badge>}
            </div>
             <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white/70" />
            </div>
            {/* Swipe indicators */}
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
        
        <CardContent className="flex-grow p-4 space-y-3 overflow-y-auto">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          {item.advertiser && <p className="text-xs text-muted-foreground">Sponsored by {item.advertiser}</p>}
          <CardDescription className="text-sm">{item.description}</CardDescription>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Categories:</p>
            <div className="flex flex-wrap gap-2">
              {item.categories.map((category) => (
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
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-3 p-4 border-t">
          <div className="w-full">
            <p className="text-xs font-medium text-muted-foreground mb-1">Rate this {item.type === 'ad' ? 'ad' : 'content'}:</p>
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
            <Button variant="ghost" size="icon">
              <Share2 />
              <span className="sr-only">Share</span>
            </Button>
          </div>

          {/* Conditional Social Media Share for Ads */}
          {item.type === 'ad' && (
            <>
              <Separator className="my-2 mx-auto w-11/12" />
              <div className="w-full">
                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
                  Share this ad:
                </p>
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
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

