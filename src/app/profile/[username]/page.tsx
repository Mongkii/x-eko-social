
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

// This page will be a Server Component, UserProfileClient will handle client-side data fetching
export default function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
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

// Optional: Generate static paths if you have a known list of users
// export async function generateStaticParams() {
//   // Fetch some users to pre-render, e.g., popular users
//   // const users = await fetchUsers(); // Replace with actual data fetching
//   // return users.map((user) => ({
//   //   username: user.username_lowercase,
//   // }));
//   return [];
// }
