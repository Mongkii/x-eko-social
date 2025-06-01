
import type { ReactNode } from 'react';
import Link from 'next/link';
import { AppLogoIcon } from '@/components/icons/app-logo-icon';
import { Home, Users, MessageSquareWarning, BarChart3, ShieldCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from './_components/user-nav'; // Placeholder for admin user dropdown

// export const metadata = {
//   title: 'Eko Admin Dashboard',
// };

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/content-moderation', label: 'Content Moderation', icon: MessageSquareWarning },
  { href: '/admin/reports', label: 'Reports Queue', icon: ShieldCheck },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Basic auth check placeholder - replace with actual Firebase Auth check
  // const isAdmin = true; // Assume admin for now
  // if (!isAdmin) {
  //   if (typeof window !== 'undefined') window.location.href = '/auth/login'; // Redirect if not admin
  //   return null;
  // }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/admin"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-10 md:w-10 md:text-base"
          >
            <AppLogoIcon className="h-6 w-6 transition-all group-hover:scale-110" />
            <span className="sr-only">Eko Admin</span>
          </Link>
          {adminNavLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              // Add active state styling here based on pathname
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-72 flex-grow"> {/* Adjusted pl for fixed sidebar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* Mobile Nav Trigger can go here */}
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search bar can go here */}
          </div>
          <ThemeToggle />
          <UserNav />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
