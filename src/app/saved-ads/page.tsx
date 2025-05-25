
// This file will be deleted or become a redirector
// Placeholder for deletion
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

export default function RootSavedAdsPage() {
  redirect(`/${defaultLocale}/saved-eko-drops`);
}
