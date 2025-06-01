
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { UserProfileClient } from "@/components/profile/UserProfileClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24"> {/* Added pb-24 for player */}
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-16 w-16 animate-spin text-accent" />
          </div>
        }>
          <UserProfileClient username={decodeURIComponent(username)} />
        </Suspense>
      </main>
      <AppFooter />
    </div>
  );
}
