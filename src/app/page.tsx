
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/feed');
  // This return is technically unreachable due to the redirect,
  // but it's good practice for component structure.
  // You could also return null or a loading indicator if the redirect
  // was conditional, but for an immediate redirect, this is fine.
  return null;
}
