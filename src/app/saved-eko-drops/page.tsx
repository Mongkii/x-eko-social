
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

export default function RootSavedEkoDropsPage() {
  redirect(`/${defaultLocale}/saved-eko-drops`);
}
