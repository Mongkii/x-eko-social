
import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNowStrict, format } from 'date-fns';

export function formatTimestamp(timestamp: Timestamp | undefined | null, detailed: boolean = false): string {
  if (!timestamp) {
    return 'just now';
  }
  try {
    const date = timestamp.toDate();
    if (detailed) {
      return format(date, 'PPpp'); // e.g., Sep 21, 2021, 4:30:21 PM
    }
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return 'invalid date';
  }
}

// New function to format duration in MM:SS
export function formatTimestampSimple(totalSeconds: number | undefined | null): string {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
