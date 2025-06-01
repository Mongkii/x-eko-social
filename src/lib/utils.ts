
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to process text and identify hashtags for rendering
export function processHashtags(text: string): Array<{ type: 'text' | 'hashtag'; content: string }> {
  if (!text) return [{ type: 'text', content: '' }];
  
  const hashtagRegex = /(#\w+)/g;
  const parts = text.split(hashtagRegex);
  const result: Array<{ type: 'text' | 'hashtag'; content: string }> = [];

  for (const part of parts) {
    if (hashtagRegex.test(part)) {
      result.push({ type: 'hashtag', content: part });
    } else if (part) { // Ensure empty strings from split aren't added if they are meaningless
      result.push({ type: 'text', content: part });
    }
  }
  return result;
}
