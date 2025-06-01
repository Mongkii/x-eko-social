
"use client";

import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, Timestamp } from 'firebase/firestore';
import type { UserProfile, EkoPost } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CalendarDays, Edit3, UserPlus, MessageSquare } from 'lucide-react';
import { EkoPostCard } from '@/components/feed/EkoPostCard';
import { formatTimestamp } from '@/lib/format-timestamp';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import Image from 'next/image'; // For Next/Image

interface UserProfileClientProps {
  username: string;
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const { user: currentUser, userProfile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<EkoPost[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      setError(null);
      if (!username) return;

      try {
        const usersRef = collection(firestore, 'users');
        // Query by username_lowercase for case-insensitive match
        const q = query(usersRef, where('username_lowercase', '==', username.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data() as UserProfile;
          setProfile({ ...userData, id: userDoc.id }); // Ensure ID is included
          fetchUserPosts(userDoc.id);
        } else {
          setError('User profile not found.');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchUserPosts = async (userId: string) => {
      setIsLoadingPosts(true);
      try {
        const postsQuery = query(
          collection(firestore, 'posts'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        const fetchedPosts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
           createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt : Timestamp.fromDate(new Date()),
        })) as EkoPost[];
        setUserPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        // Don't set global error for posts, just show message in posts section
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive text-xl">{error}</p>
        <Link href="/feed" passHref>
            <Button variant="link" className="mt-4">Go to Feed</Button>
        </Link>
      </div>
    );
  }

  if (!profile) {
    // This case should ideally be handled by the error state, but as a fallback
    return <div className="text-center py-10"><p>User not found.</p></div>;
  }

  const isCurrentUserProfile = currentUser && currentUser.uid === profile.id;
  const coverImageUrl = profile.coverImageURL || "https://placehold.co/1200x300.png";


  return (
    <div className="space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-secondary to-primary relative">
           <Image 
            src={coverImageUrl} 
            alt={`${profile.username}'s cover image`} 
            layout="fill" 
            objectFit="cover" 
            priority
            data-ai-hint={profile.coverImageURL ? "user cover" : "abstract background"}
            />
        </div>
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg" data-ai-hint="user avatar">
              <AvatarImage src={profile.avatarURL || `https://placehold.co/128x128.png?text=${profile.username[0]}`} alt={profile.username} />
              <AvatarFallback className="text-4xl">{profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <p className="text-muted-foreground">@{profile.username_lowercase}</p>
            </div>
            <div className="flex space-x-2 pt-4 sm:pt-0">
              {isCurrentUserProfile ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/profile/${profile.username_lowercase}/edit`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" /> Follow
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {profile.bio && <p className="mt-6 text-center sm:text-left text-muted-foreground">{profile.bio}</p>}
          
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground justify-center sm:justify-start">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Joined {profile.createdAt ? `${formatTimestamp(profile.createdAt, true).split(',')[0]}, ${formatTimestamp(profile.createdAt, true).split(',')[1]}` : 'N/A'}
            </div>
            {/* Add more profile details here like location, website if available */}
          </div>

          <div className="mt-6 flex justify-around sm:justify-start space-x-4 sm:space-x-8 border-t pt-4">
            <div>
              <p className="text-lg font-semibold">{userPosts.length}</p>
              <p className="text-sm text-muted-foreground">EkoDrops</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{profile.followersCount || 0}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{profile.followingCount || 0}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-6">EkoDrops by {profile.username}</h2>
        {isLoadingPosts ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
          </div>
        ) : userPosts.length > 0 ? (
          <div className="space-y-6">
            {userPosts.map(post => (
              <EkoPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-10">
            <CardContent>
              <p className="text-muted-foreground">{profile.username} hasn't posted any EkoDrops yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
