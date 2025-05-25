
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

// This page will redirect to the default localized homepage.
// The main homepage content is now in src/app/[locale]/page.tsx
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
