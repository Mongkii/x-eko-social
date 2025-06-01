
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
