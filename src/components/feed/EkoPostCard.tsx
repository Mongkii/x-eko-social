
"use client";

import type { EkoPost, UserProfile, EkoComment, Like } from "@/lib/types";
import type { TrackDetails } from "@/contexts/AudioPlayerContext"; // Added
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MessageCircle, Repeat, Heart, Share2, MoreHorizontal, AlertTriangle, Send, Loader2, Trash2, Play, Pause, Music2 } from "lucide-react"; // Added Play, Pause
import Link from "next/link";
import { formatTimestamp } from "@/lib/format-timestamp";
import { useAuth } from "@/contexts/auth-context";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"; // Added
import { useState, useEffect } from "react";
import { firestore, storage } from "@/lib/firebase"; 
import {
  doc,
  getDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  deleteDoc,
  addDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage"; 
import { useToast } from "@/hooks/use-toast";
import { processHashtags } from "@/lib/utils";


interface EkoPostCardProps {
  post: EkoPost;
  onPostDeleted?: (postId: string) => void;
  queue: EkoPost[]; // Added for audio player queue
  postIndex: number; // Added for audio player queue
}

export function EkoPostCard({ post: initialPost, onPostDeleted, queue, postIndex }: EkoPostCardProps) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { 
    playNewTrack, 
    togglePlayPause, 
    currentTrackDetails, 
    isPlaying: isGlobalPlayerPlaying, 
    isLoading: isGlobalPlayerLoading 
  } = useAudioPlayer(); // Audio player context

  const [post, setPost] = useState<EkoPost>(initialPost);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  const [isReEkoing, setIsReEkoing] = useState(false);

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isCurrentTrackInGlobalPlayer = currentTrackDetails?.id === post.id;

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);


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

    if (post.username && post.userAvatarURL) {
        setAuthorProfile({ username: post.username, avatarURL: post.userAvatarURL } as UserProfile);
    } else if(post.username && !post.userAvatarURL) {
        setAuthorProfile({ username: post.username, avatarURL: `https://placehold.co/100x100.png?text=${post.username[0].toUpperCase()}` } as UserProfile);
    } else {
        fetchAuthorProfile();
    }
  }, [post.userId, post.username, post.userAvatarURL]);

  useEffect(() => {
    if (user && post.id) {
      const likesRef = collection(firestore, "likes");
      const q = query(likesRef, where("userId", "==", user.uid), where("postId", "==", post.id));
      getDocs(q).then((snapshot) => {
        if (!snapshot.empty) {
          setIsLiked(true);
          setLikeDocId(snapshot.docs[0].id);
        } else {
          setIsLiked(false);
          setLikeDocId(null);
        }
      });
    }
  }, [user, post.id]);


  const handleLike = async () => {
    if (!user || authLoading || isLiking) return;
    if (!userProfile) {
        toast({ title: "Profile Error", description: "Your user profile is not loaded. Cannot like.", variant: "destructive" });
        return;
    }
    setIsLiking(true);

    const postRef = doc(firestore, "posts", post.id);

    try {
      await runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw new Error("Post does not exist!");
        }

        if (isLiked && likeDocId) {
          const likeRef = doc(firestore, "likes", likeDocId);
          transaction.delete(likeRef);
          transaction.update(postRef, { likeCount: increment(-1) });
          setPost(p => ({ ...p, likeCount: Math.max(0, p.likeCount - 1) })); 
          setIsLiked(false);
          setLikeDocId(null);
        } else {
          const newLikeRef = doc(collection(firestore, "likes"));
          transaction.set(newLikeRef, {
            userId: user.uid,
            postId: post.id,
            createdAt: serverTimestamp(),
          });
          transaction.update(postRef, { likeCount: increment(1) });
          setPost(p => ({ ...p, likeCount: p.likeCount + 1 }));
          setIsLiked(true);
          setLikeDocId(newLikeRef.id);
        }
      });
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      toast({ title: "Like Error", description: "Could not update like. Please try again.", variant: "destructive" });
    } finally {
      setIsLiking(false);
    }
  };

  const handleReEko = async () => {
    if (!user || authLoading || isReEkoing) return;
     if (!userProfile) {
        toast({ title: "Profile Error", description: "Your user profile is not loaded. Cannot re-eko.", variant: "destructive" });
        return;
    }
    setIsReEkoing(true);

    const postRef = doc(firestore, "posts", post.id);
    const reEkosRef = collection(firestore, "reEkos");

    try {
      const batch = writeBatch(firestore);
      const newReEkoRef = doc(reEkosRef);
      batch.set(newReEkoRef, {
        originalPostId: post.id,
        userId: user.uid,
        username: userProfile.username,
        userAvatarURL: userProfile.avatarURL || '',
        createdAt: serverTimestamp(),
      });
      batch.update(postRef, { reEkoCount: increment(1) });
      await batch.commit();

      setPost(p => ({ ...p, reEkoCount: p.reEkoCount + 1 }));
      toast({ title: "Re-Ekoed!", variant: "default" });
    } catch (error) {
      console.error("Error re-ekoing post:", error);
      toast({ title: "Re-Eko Error", description: "Could not re-eko. Please try again.", variant: "destructive" });
    } finally {
      setIsReEkoing(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`; 
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EkoDrop by ${authorProfile?.username || post.username}`,
          text: post.textContent.substring(0, 100) + (post.textContent.length > 100 ? "..." : ""),
          url: postUrl,
        });
      } catch (error) {
        navigator.clipboard.writeText(postUrl);
        toast({ title: "Link Copied!", description: "Share link copied to clipboard.", variant: "default" });
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      toast({ title: "Link Copied!", description: "Share link copied to clipboard.", variant: "default" });
    }
  };

  const handleReport = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to report content.", variant: "destructive" });
      return;
    }
    console.log(`Report post ${post.id} by user ${user.uid}`);
    toast({ title: "Report Action", description: "Reporting functionality coming soon!", variant: "default" });
  };

  const handleDeletePost = async () => {
    if (!user || user.uid !== post.userId || isDeleting) return;
    setIsDeleting(true);

    try {
      if (post.audioURL) {
        try {
          const audioFileRef = storageRef(storage, post.audioURL);
          await deleteObject(audioFileRef);
        } catch (storageError: any) {
          console.error("Error deleting audio from Firebase Storage:", storageError);
          if (storageError.code !== 'storage/object-not-found') {
             toast({ title: "Storage Deletion Error", description: "Could not delete associated audio file.", variant: "destructive" });
          }
        }
      }

      const postRef = doc(firestore, "posts", post.id);
      await deleteDoc(postRef);

      toast({ title: "EkoDrop Deleted", description: "Your EkoDrop has been successfully deleted.", variant: "default" });
      
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }

    } catch (error) {
      console.error("Error deleting EkoDrop:", error);
      toast({ title: "Deletion Failed", description: "Could not delete your EkoDrop. Please try again.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  const handleAddComment = async () => {
    if (!user || authLoading || isCommenting || !commentText.trim()) return;
    if (!userProfile) {
        toast({ title: "Profile Error", description: "Your user profile is not loaded. Cannot comment.", variant: "destructive" });
        return;
    }
    setIsCommenting(true);

    const postRef = doc(firestore, "posts", post.id);
    const commentsRef = collection(firestore, "comments");

    try {
      const batch = writeBatch(firestore);
      const newCommentRef = doc(commentsRef);
      batch.set(newCommentRef, {
        postId: post.id,
        userId: user.uid,
        username: userProfile.username,
        userAvatarURL: userProfile.avatarURL || '',
        textContent: commentText.trim(),
        createdAt: serverTimestamp(),
      } as Omit<EkoComment, 'id' | 'createdAt'> & { createdAt: Timestamp });
      batch.update(postRef, { commentCount: increment(1) });
      await batch.commit();

      setPost(p => ({ ...p, commentCount: p.commentCount + 1 }));
      setCommentText("");
      setShowCommentInput(false);
      toast({ title: "Comment Posted!", variant: "default" });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({ title: "Comment Error", description: "Could not post comment. Please try again.", variant: "destructive" });
    } finally {
      setIsCommenting(false);
    }
  };
  
  const handlePlayPauseAudio = () => {
    if (!post.audioURL) return;

    const trackToPlay: TrackDetails = {
      id: post.id,
      audioURL: post.audioURL,
      username: authorProfile?.username || post.username || "Unknown",
      userAvatarURL: authorProfile?.avatarURL || post.userAvatarURL,
      textContent: post.textContent,
    };
    
    const queueAsTrackDetails: TrackDetails[] = queue.map(p => ({
        id: p.id,
        audioURL: p.audioURL,
        username: p.username, // Assuming EkoPost has username directly or fetch author if needed
        userAvatarURL: p.userAvatarURL,
        textContent: p.textContent,
    }));


    if (isCurrentTrackInGlobalPlayer) {
      togglePlayPause();
    } else {
      playNewTrack(trackToPlay, queueAsTrackDetails, postIndex);
    }
  };


  const authorUsername = authorProfile?.username || post.username || "Unknown User";
  const authorAvatar = authorProfile?.avatarURL || post.userAvatarURL || `https://placehold.co/40x40.png?text=${authorUsername[0]?.toUpperCase() || 'U'}`;
  const processedContent = processHashtags(post.textContent);
  const isCurrentUserPostAuthor = user && user.uid === post.userId;

  if (!post) return null; 

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start space-x-4 p-4">
        {post.audioURL && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePlayPauseAudio} 
            className="flex-shrink-0 h-10 w-10 text-accent hover:bg-accent/10"
            disabled={isGlobalPlayerLoading && isCurrentTrackInGlobalPlayer}
            aria-label={isCurrentTrackInGlobalPlayer && isGlobalPlayerPlaying ? "Pause EkoDrop" : "Play EkoDrop"}
          >
            {isGlobalPlayerLoading && isCurrentTrackInGlobalPlayer ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isCurrentTrackInGlobalPlayer && isGlobalPlayerPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        )}
        {!post.audioURL && ( // Placeholder if no audio, to maintain layout
            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
                <Music2 className="h-6 w-6 text-muted-foreground/50"/>
            </div>
        )}
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReport} className="text-yellow-600 hover:!text-yellow-700 focus:!text-yellow-700 focus:!bg-yellow-100 dark:text-yellow-400 dark:hover:!text-yellow-500 dark:focus:!text-yellow-500 dark:focus:!bg-yellow-700/20">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Report EkoDrop
                </DropdownMenuItem>
                {isCurrentUserPostAuthor && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()} 
                          className="text-red-600 hover:!text-red-700 focus:!text-red-700 focus:!bg-red-100 dark:text-red-400 dark:hover:!text-red-500 dark:focus:!text-red-500 dark:focus:!bg-red-700/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete EkoDrop
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your EkoDrop.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeletePost} 
                            disabled={isDeleting}
                            className={buttonVariants({ variant: "destructive" })}
                          >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 pl-20"> {/* Adjusted pl for play button */}
        <p className="text-sm whitespace-pre-wrap">
            {processedContent.map((part, index) =>
              part.type === 'hashtag' ? (
                <Link key={index} href={`/discover?tag=${part.content.substring(1)}`} className="text-accent hover:underline">
                  {part.content}
                </Link>
              ) : (
                part.content
              )
            )}
        </p>
        {/* Removed individual audio player from here */}
      </CardContent>
      <CardFooter className="flex justify-around p-2 border-t">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500" onClick={() => setShowCommentInput(!showCommentInput)}>
          <MessageCircle className="h-5 w-5 mr-1" /> {post.commentCount}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500" onClick={handleReEko} disabled={isReEkoing}>
          {isReEkoing ? <Loader2 className="h-5 w-5 mr-1 animate-spin" /> : <Repeat className="h-5 w-5 mr-1" />}
          {post.reEkoCount}
        </Button>
        <Button variant="ghost" size="sm" className={`hover:text-red-500 ${isLiked ? "text-red-500" : "text-muted-foreground"}`} onClick={handleLike} disabled={isLiking}>
          {isLiking ? <Loader2 className="h-5 w-5 mr-1 animate-spin" /> : <Heart className={`h-5 w-5 mr-1 ${isLiked ? "fill-current" : ""}`} />}
          {post.likeCount}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </CardFooter>

      {showCommentInput && (
        <div className="p-4 border-t">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8 mt-1" data-ai-hint="user avatar">
              <AvatarImage src={userProfile?.avatarURL || `https://placehold.co/32x32.png?text=${userProfile?.username[0]?.toUpperCase() || 'U'}`} alt={userProfile?.username || "You"} />
              <AvatarFallback>{userProfile?.username[0]?.toUpperCase() || (user?.email && user.email[0].toUpperCase()) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add your voice (text for now)..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-2 min-h-[60px]"
                disabled={!user || authLoading || isCommenting}
              />
              <Button onClick={handleAddComment} size="sm" disabled={!user || authLoading || isCommenting || !commentText.trim()}>
                {isCommenting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Post Comment
              </Button>
            </div>
          </div>
          {!user && !authLoading && <p className="text-xs text-muted-foreground mt-2 text-center">Please login to comment.</p>}
        </div>
      )}
    </Card>
  );
}
