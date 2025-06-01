
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { EditProfileForm } from '@/components/profile/EditProfileForm';
import type { UserProfile } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfileEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile: authUserProfile, loading: authLoading } = useAuth();
  const [profileDataForEdit, setProfileDataForEdit] = useState<UserProfile | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const usernameFromUrl = typeof params.username === 'string' ? decodeURIComponent(params.username) : null;

  useEffect(() => {
    if (authLoading) {
      return; // Wait for authentication to complete
    }

    if (!user || !authUserProfile) {
      // Not logged in, or profile hasn't loaded yet
      router.push(`/auth/login?redirect=/profile/${usernameFromUrl}/edit`);
      return;
    }

    if (usernameFromUrl && authUserProfile.username_lowercase === usernameFromUrl.toLowerCase()) {
      setProfileDataForEdit(authUserProfile);
      setIsAuthorized(true);
    } else if (usernameFromUrl) {
      // Logged in, but trying to edit someone else's profile
      setIsAuthorized(false);
    }
    setIsLoadingPage(false);
  }, [user, authUserProfile, authLoading, usernameFromUrl, router]);

  if (isLoadingPage || authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-accent" />
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
              <CardTitle>Unauthorized</CardTitle>
              <CardDescription>You are not authorized to edit this profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }
  
  if (!profileDataForEdit) {
     // Should be covered by loading or unauthorized, but as a fallback
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
            <p>Profile data not found.</p>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Edit Your Profile</CardTitle>
            <CardDescription>Update your public information and appearance.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditProfileForm userProfile={profileDataForEdit} />
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
