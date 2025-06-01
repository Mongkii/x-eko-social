
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the feed page, which is now the main content hub.
  redirect('/feed'); 
  
  // This return is technically unreachable due to the redirect,
  // but it's good practice for component structure.
  return null;
}
