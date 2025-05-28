
"use client";

import { FeedItemData, Transcript } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, PlayCircle, Tag, UserCircle, Gift, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { arSA } from 'date-fns/locale'; // For Arabic date formatting

interface FeedItemCardProps {
  item: FeedItemData;
  isLiked: boolean;
  onInteraction: (itemId: string, interactionType: 'like' | 'dislike' | 'unlike') => void;
  onToggleFollowCategory: (category: string, isFollowing: boolean) => void; // Assuming category is a string for now
  isPlaying: boolean;
  onPlayRequest: (itemId: string) => void;
  onAudioEnded: (itemId: string) => void;
  audioRef: (el: HTMLVideoElement | null) => void;
}

export function FeedItemCard({
  item,
  isLiked,
  onInteraction,
  onToggleFollowCategory,
  isPlaying,
  onPlayRequest,
  onAudioEnded,
  audioRef,
}: FeedItemCardProps) {
  const [swipeState, setSwipeState] = useState<'left' | 'right' | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);

  // Simplified for Arabic only
  const currentLocale = 'ar'; 
  const transcriptText = typeof item.transcript === 'object' ? (item.transcript as Transcript)[currentLocale] || item.transcript?.['en'] || "لا يوجد نص" : item.transcript || "لا يوجد نص";


  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return "منذ فترة";
    try {
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : (timestamp?.toDate ? timestamp.toDate() : new Date(timestamp));
      if (isNaN(date.getTime())) return "تاريخ غير صالح";
      return formatDistanceToNow(date, { addSuffix: true, locale: arSA });
    } catch (e) {
      console.error("Error formatting date in FeedItemCard:", e);
      return "مؤخرًا";
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === 0) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartX.current;
    setTranslateX(diffX);

    if (diffX > 50) setSwipeState('right');
    else if (diffX < -50) setSwipeState('left');
    else setSwipeState(null);
  };

  const handleTouchEnd = () => {
    if (swipeState === 'right') {
      onInteraction(item.id, isLiked ? 'unlike' : 'like');
    } else if (swipeState === 'left') {
      onInteraction(item.id, 'dislike');
    }
    setTranslateX(0);
    setSwipeState(null);
    touchStartX.current = 0;
  };
  
  const cardContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying && cardContentRef.current) {
      // Scroll into view or manage focus if needed
    }
  }, [isPlaying]);


  return (
    <Card 
      className={cn(
        "w-full max-w-md mx-auto shadow-lg rounded-xl overflow-hidden relative transition-transform duration-300 ease-out",
        swipeState === 'right' && 'bg-green-100 dark:bg-green-900',
        swipeState === 'left' && 'bg-red-100 dark:bg-red-900',
      )}
      style={{ transform: `translateX(${translateX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader className="relative p-0">
        {item.isAd && item.videoUrl ? (
           <div className="aspect-square w-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex flex-col items-center justify-center text-white p-4">
            <Gift className="w-16 h-16 mb-4 opacity-80" />
            <h3 className="text-xl font-bold text-center mb-2">شاهد إعلاناً بمكافأة!</h3>
            <p className="text-sm text-center mb-4">شاهد هذا الفيديو القصير لتربح مكافأة.</p>
            <Button 
              onClick={() => onPlayRequest(item.id)}
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <PlayCircle className="rtl:ml-2 ltr:mr-2 h-5 w-5" /> شاهد الإعلان
            </Button>
            <Badge variant="destructive" className="absolute top-2 right-2 rtl:right-auto rtl:left-2">إعلان بمكافأة</Badge>
          </div>
        ) : item.videoUrl ? (
          <div className="aspect-square w-full relative bg-slate-900">
            <video
              ref={audioRef}
              src={item.videoUrl}
              poster={item.imageUrl || "https://placehold.co/600x600.png?text=EkoDrop"}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              onEnded={() => onAudioEnded(item.id)}
              onClick={() => onPlayRequest(item.id)} // Also play/pause on click
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={() => onPlayRequest(item.id)}>
                <PlayCircle className="w-16 h-16 text-white/70 hover:text-white transition-colors" />
              </div>
            )}
             {item.isAd && <Badge variant="secondary" className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/50 text-white">إعلان</Badge>}
          </div>
        ) : item.imageUrl ? (
           <div className="aspect-square w-full relative">
            <img
              src={item.imageUrl}
              alt={item.title || "إيكو دروب"}
              className="w-full h-full object-cover"
              data-ai-hint="social media audio"
            />
            {item.isAd && <Badge variant="secondary" className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/50 text-white">إعلان</Badge>}
           </div>
        ) : (
          <div className="aspect-square w-full bg-muted flex items-center justify-center">
            <Info className="w-12 h-12 text-muted-foreground" />
            <p className="absolute bottom-2 text-xs text-muted-foreground">لا يوجد وسائط لهذا الإيكو دروب.</p>
             {item.isAd && <Badge variant="secondary" className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/50 text-white">إعلان</Badge>}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3" ref={cardContentRef}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
          <UserCircle className="w-5 h-5" />
          <span>{item.userId || "مستخدم غير معروف"}</span>
          <span className="text-xs">&bull; {getFormattedDate(item.createdAt)}</span>
        </div>
        
        <CardTitle className="text-lg font-semibold line-clamp-2">{item.title || "مشاركة صوتية"}</CardTitle>
        
        {transcriptText && <p className="text-sm text-muted-foreground line-clamp-3">{transcriptText}</p>}
        
        {item.duration && <p className="text-xs text-muted-foreground">المدة: {Math.round(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</p>}

        {item.hashtags && item.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <Tag className="w-3 h-3 text-muted-foreground"/>
            {item.hashtags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
        
        {item.isAd && item.advertiser && (
          <p className="text-xs text-muted-foreground">برعاية {item.advertiser}</p>
        )}
        
        {item.isAd && (
          <div className="mt-2">
            <p className="text-xs font-semibold mb-1">قيّم هذا الإعلان:</p>
            <StarRating currentRating={item.rating || 0} onRatingChange={(newRating) => console.log('Ad rating:', newRating)} size={20} />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 border-t flex justify-around items-center">
        <Button variant="ghost" size="icon" onClick={() => onInteraction(item.id, isLiked ? 'unlike' : 'like')} className={cn(isLiked && "text-primary")}>
          <ThumbsUp className="w-5 h-5" />
          <span className="sr-only">أعجبني</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onInteraction(item.id, 'dislike')}>
          <ThumbsDown className="w-5 h-5" />
          <span className="sr-only">لم يعجبني</span>
        </Button>
        <Button variant="ghost" size="icon">
          <MessageCircle className="w-5 h-5" />
          <span className="sr-only">تعليق</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="w-5 h-5" />
          <span className="sr-only">مشاركة</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
