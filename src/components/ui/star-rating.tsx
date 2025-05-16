"use client";

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface StarRatingProps {
  currentRating?: number;
  maxRating?: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  className?: string;
  readOnly?: boolean;
}

export function StarRating({
  currentRating = 0,
  maxRating = 5,
  onRatingChange,
  size = 24,
  className,
  readOnly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(currentRating);

  useEffect(() => {
    setRating(currentRating);
  }, [currentRating]);

  const handleStarClick = (index: number) => {
    if (readOnly) return;
    const newRating = index + 1;
    setRating(newRating);
    onRatingChange(newRating);
  };

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              "cursor-pointer transition-colors",
              isFilled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground",
              readOnly ? "cursor-default" : "hover:text-yellow-300"
            )}
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          />
        );
      })}
    </div>
  );
}
