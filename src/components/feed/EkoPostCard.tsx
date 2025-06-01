
"use client";

import type { EkoPost, UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Repeat, Heart, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { formatTimestamp } from "@/lib/format-timestamp";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface EkoPostCardProps {
  post: EkoPost;
}

export function EkoPostCard({ post }: EkoPostCardProps) {
  const { user } = useAuth();
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (post.userId) {
        try {
          const userDocRef = doc(firestore, "users", post.userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setAuthorProfile(userDocSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching author profile:", error);
        }
      }
    };
    // Use denormalized data if available, otherwise fetch
    if (post.username && post.userAvatarURL) {
        setAuthorProfile({ username: post.username, avatarURL: post.userAvatarURL } as UserProfile);
    } else if(post.username && !post.userAvatarURL) {
        setAuthorProfile({ username: post.username, avatarURL: `https://placehold.co/100x100.png?text=${post.username[0].toUpperCase()}` } as UserProfile);
    }
    else {
        fetchAuthorProfile();
    }
  }, [post.userId, post.username, post.userAvatarURL]);


  const handleInteraction = (action: string) => {
    if (!user) {
      // redirect to login or show login modal
      alert("Please login to " + action);
      return;
    }
    // Implement interaction logic (like, comment, re-eko)
    console.log(`${action} post ${post.id}`);
  };

  const authorUsername = authorProfile?.username || post.username || "Unknown User";
  const authorAvatar = authorProfile?.avatarURL || post.userAvatarURL || `https://placehold.co/40x40.png?text=${authorUsername[0]?.toUpperCase() || 'U'}`;


  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start space-x-4 p-4">
        <Link href={`/profile/${authorUsername.toLowerCase()}`} passHref>
          <Avatar className="h-10 w-10 cursor-pointer" data-ai-hint="user avatar">
            <AvatarImage src={authorAvatar} alt={authorUsername} />
            <AvatarFallback>{authorUsername[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${authorUsername.toLowerCase()}`} passHref>
            <CardTitle className="text-base font-semibold hover:underline cursor-pointer">
              {authorUsername}
            </CardTitle>
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(post.createdAt)}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">More options</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Placeholder for audio player if post.audioURL exists */}
        {/* For now, just display textContent */}
        <p className="text-sm whitespace-pre-wrap">{post.textContent}</p>
        {post.audioURL && (
            <div className="mt-3">
                <audio controls src={post.audioURL} className="w-full">
                    Your browser does not support the audio element.
                </audio>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-around p-2 border-t">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500" onClick={() => handleInteraction("comment")}>
          <MessageCircle className="h-5 w-5 mr-1" /> {post.commentCount || 0}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500" onClick={() => handleInteraction("re-eko")}>
          <Repeat className="h-5 w-5 mr-1" /> {post.reEkoCount || 0}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500" onClick={() => handleInteraction("like")}>
          <Heart className="h-5 w-5 mr-1" /> {post.likeCount || 0}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => handleInteraction("share")}>
          <Share2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
