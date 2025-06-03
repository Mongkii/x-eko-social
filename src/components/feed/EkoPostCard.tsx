
"use client";

import type { EkoPost, UserProfile, EkoComment, Like, VoiceEffect } from "@/lib/types"; // Added VoiceEffect
import type { TrackDetails } from "@/contexts/AudioPlayerContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircle, Repeat, Heart, Share2, MoreHorizontal, AlertTriangle, Send, Loader2, Trash2, Play, Pause, Music2, Mic, StopCircle, Wand2, Facebook, Twitter, Linkedin, Copy } from "lucide-react"; // Added Facebook, Twitter, Linkedin, Copy
import Link from "next/link";
import { formatTimestamp } from "@/lib/format-timestamp";
import { useAuth } from "@/contexts/auth-context";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { ref as storageRefFS, deleteObject, uploadBytes, getDownloadURL } from "firebase/storage"; // Renamed storageRef to storageRefFS to avoid conflict with useRef
import { useToast } from "@/hooks/use-toast";
import { processHashtags } from "@/lib/utils";


interface EkoPostCardProps {
  post: EkoPost;
  onPostDeleted?: (postId: string) => void;
  queue: EkoPost[];
  postIndex: number;
}

// Helper function to create a distortion curve for WaveShaperNode
function makeDistortionCurve(amount: number): Float32Array {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// Helper function to convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Int16Array;
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  if (numChannels === 2) {
    const inputL = channelData[0];
    const inputR = channelData[1];
    const length = inputL.length + inputR.length;
    result = new Int16Array(length);
    let index = 0;
    let inputIndex = 0;
    while (index < length) {
      result[index++] = Math.max(-32768, Math.min(32767, inputL[inputIndex] * 32767));
      result[index++] = Math.max(-32768, Math.min(32767, inputR[inputIndex] * 32767));
      inputIndex++;
    }
  } else { 
    const monoChannel = channelData[0];
    result = new Int16Array(monoChannel.length);
    for (let i = 0; i < monoChannel.length; i++) {
      result[i] = Math.max(-32768, Math.min(32767, monoChannel[i] * 32767));
    }
  }
  
  const dataLength = result.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;
  const wavBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(wavBuffer);

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  let offset = 0;
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, bufferLength - 8, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  writeString(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4; 
  view.setUint16(offset, format, true); offset += 2;
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numChannels * (bitDepth / 8), true); offset += 4; 
  view.setUint16(offset, numChannels * (bitDepth / 8), true); offset += 2; 
  view.setUint16(offset, bitDepth, true); offset += 2;
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, dataLength, true); offset += 4;

  for (let i = 0; i < result.length; i++, offset += 2) {
    view.setInt16(offset, result[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
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
  } = useAudioPlayer(); 

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

  // State for comment audio
  const [isRecordingComment, setIsRecordingComment] = useState(false);
  const [initialCommentAudioBlob, setInitialCommentAudioBlob] = useState<Blob | null>(null);
  const [processedCommentAudioBlob, setProcessedCommentAudioBlob] = useState<Blob | null>(null);
  const [commentAudioUrl, setCommentAudioUrl] = useState<string | null>(null);
  const commentMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const commentAudioChunksRef = useRef<Blob[]>([]);
  const commentAudioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [hasCommentMicPermission, setHasCommentMicPermission] = useState<boolean | null>(null);
  const [commentMicError, setCommentMicError] = useState<string | null>(null);
  const [selectedCommentVoiceEffect, setSelectedCommentVoiceEffect] = useState<VoiceEffect>("none");
  const [isProcessingCommentEffect, setIsProcessingCommentEffect] = useState(false);
  const commentAudioContextRef = useRef<AudioContext | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined' && !commentAudioContextRef.current) {
        try {
            commentAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser for comments.", e);
            setCommentMicError("Web Audio API is not supported. Voice effects for comments will not work.");
        }
    }
    return () => {
      if (commentAudioUrl) {
        URL.revokeObjectURL(commentAudioUrl);
      }
    };
  }, [commentAudioUrl]);


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

  const applyCommentVoiceEffect = useCallback(async (inputBlob: Blob | null, effect: VoiceEffect): Promise<Blob | null> => {
    if (!inputBlob || !commentAudioContextRef.current) return inputBlob; 

    setIsProcessingCommentEffect(true);
    // toast({ title: "Applying Voice Effect to Comment...", description: `Processing audio with ${effect} effect.` });

    try {
      const arrayBuffer = await inputBlob.arrayBuffer();
      const decodedAudioBuffer = await commentAudioContextRef.current.decodeAudioData(arrayBuffer);
      
      const offlineCtx = new OfflineAudioContext(
        decodedAudioBuffer.numberOfChannels,
        decodedAudioBuffer.length,
        decodedAudioBuffer.sampleRate
      );
      
      const source = offlineCtx.createBufferSource();
      source.buffer = decodedAudioBuffer;

      switch (effect) {
        case "chipmunk": source.playbackRate.value = 1.8; source.connect(offlineCtx.destination); break;
        case "deep": source.playbackRate.value = 0.6; source.connect(offlineCtx.destination); break;
        case "robot":
          source.playbackRate.value = 0.9; 
          const robotFilter = offlineCtx.createBiquadFilter();
          robotFilter.type = 'peaking'; robotFilter.frequency.value = 1200; robotFilter.Q.value = 6; robotFilter.gain.value = 15;   
          source.connect(robotFilter); robotFilter.connect(offlineCtx.destination); break;
        case "echo":
          const delayNode = offlineCtx.createDelay(1.0); delayNode.delayTime.value = 0.25; 
          const feedbackNode = offlineCtx.createGain(); feedbackNode.gain.value = 0.4; 
          const dryGainNode = offlineCtx.createGain(); dryGainNode.gain.value = 1.0; 
          const wetGainNode = offlineCtx.createGain(); wetGainNode.gain.value = 0.5; 
          source.connect(dryGainNode); dryGainNode.connect(offlineCtx.destination);
          source.connect(delayNode); delayNode.connect(feedbackNode); feedbackNode.connect(delayNode); 
          delayNode.connect(wetGainNode); wetGainNode.connect(offlineCtx.destination); break;
        case "alien":
          source.playbackRate.value = 1.4;
          const lfo = offlineCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 15;
          const lfoGain = offlineCtx.createGain(); lfoGain.gain.value = 0.05;
          const alienBiquad = offlineCtx.createBiquadFilter(); alienBiquad.type = 'bandpass'; alienBiquad.frequency.value = 2000; alienBiquad.Q.value = 1.5;
          lfo.connect(lfoGain.gain); source.connect(alienBiquad); alienBiquad.connect(lfoGain); lfoGain.connect(offlineCtx.destination); lfo.start(0); break;
        case "monster":
          source.playbackRate.value = 0.45;
          const distortion = offlineCtx.createWaveShaper(); distortion.curve = makeDistortionCurve(150); distortion.oversample = '4x';
          const monsterLowPass = offlineCtx.createBiquadFilter(); monsterLowPass.type = "lowpass"; monsterLowPass.frequency.value = 800;
          source.connect(distortion); distortion.connect(monsterLowPass); monsterLowPass.connect(offlineCtx.destination); break;
        case "radio":
          const bandpass = offlineCtx.createBiquadFilter(); bandpass.type = 'bandpass'; bandpass.frequency.value = 1500; bandpass.Q.value = 4;
          const radioDistortion = offlineCtx.createWaveShaper(); radioDistortion.curve = makeDistortionCurve(30); radioDistortion.oversample = '2x';
          source.connect(radioDistortion); radioDistortion.connect(bandpass); bandpass.connect(offlineCtx.destination); break;
        case "none": default: source.connect(offlineCtx.destination); break;
      }
      
      source.start(0);
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);

      setIsProcessingCommentEffect(false);
      // const effectDisplayName = effect.charAt(0).toUpperCase() + effect.slice(1);
      // toast({ title: "Comment Effect Applied!", description: `Audio processed with ${effectDisplayName} effect.`});
      return wavBlob;

    } catch (error) {
      console.error("Error applying voice effect to comment:", error);
      setIsProcessingCommentEffect(false);
      toast({ variant: "destructive", title: "Comment Effect Error", description: "Could not apply voice effect." });
      return inputBlob;
    }
  }, [toast]);

  const processAndSetCommentAudio = useCallback(async (baseBlob: Blob | null, effect: VoiceEffect) => {
    if (!baseBlob) {
      if (commentAudioUrl) URL.revokeObjectURL(commentAudioUrl);
      setCommentAudioUrl(null);
      setProcessedCommentAudioBlob(null);
      return;
    }
    const PAblob = await applyCommentVoiceEffect(baseBlob, effect);
    setProcessedCommentAudioBlob(PAblob); 
    
    if (commentAudioUrl) URL.revokeObjectURL(commentAudioUrl); 
    if (PAblob) {
        const newPreviewUrl = URL.createObjectURL(PAblob);
        setCommentAudioUrl(newPreviewUrl); 
    } else {
        setCommentAudioUrl(null);
    }
  }, [applyCommentVoiceEffect, commentAudioUrl]); 

  useEffect(() => {
    if (initialCommentAudioBlob) {
      processAndSetCommentAudio(initialCommentAudioBlob, selectedCommentVoiceEffect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommentVoiceEffect, initialCommentAudioBlob]); 
  

  const getCommentMicrophonePermission = async () => {
    if (hasCommentMicPermission === null) { 
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasCommentMicPermission(true);
        stream.getTracks().forEach(track => track.stop());
        setCommentMicError(null);
      } catch (error) {
        console.error('Error accessing microphone for comment:', error);
        setHasCommentMicPermission(false);
        const errorMessage = error instanceof Error && error.name === 'NotAllowedError' 
          ? 'Microphone access denied. Please enable it in your browser settings.' 
          : 'Could not access microphone. Please ensure it is connected and enabled.';
        setCommentMicError(errorMessage);
      }
    }
  };

  const startCommentRecording = async () => {
    clearCommentAudio(); 
    if (hasCommentMicPermission === null) await getCommentMicrophonePermission(); 
    
    if (hasCommentMicPermission === false || !navigator.mediaDevices || !commentAudioContextRef.current) { 
       const errorMsg = !commentAudioContextRef.current ? "Web Audio API not ready." : commentMicError;
       toast({ variant: "destructive", title: "Mic/Audio Error", description: errorMsg || "Mic permission not granted."});
       return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm;codecs=opus' };
      try {
        commentMediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e) {
        commentMediaRecorderRef.current = new MediaRecorder(stream); 
      }
      
      commentAudioChunksRef.current = [];
      commentMediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) commentAudioChunksRef.current.push(event.data);
      };
      commentMediaRecorderRef.current.onstop = async () => {
        const completeAudioBlob = new Blob(commentAudioChunksRef.current, { type: commentMediaRecorderRef.current?.mimeType || 'audio/webm' }); 
        setInitialCommentAudioBlob(completeAudioBlob); 
        await processAndSetCommentAudio(completeAudioBlob, selectedCommentVoiceEffect); 
        stream.getTracks().forEach(track => track.stop()); 
      };
      commentMediaRecorderRef.current.start();
      setIsRecordingComment(true);
    } catch (err) {
        const errorMsg = "Failed to start comment recording.";
        setCommentMicError(errorMsg);
        toast({ variant: "destructive", title: "Recording Error", description: errorMsg});
    }
  };

  const stopCommentRecording = () => {
    if (commentMediaRecorderRef.current && isRecordingComment) {
      commentMediaRecorderRef.current.stop();
      setIsRecordingComment(false);
    }
  };

  const clearCommentAudio = (keepInitial: boolean = false) => {
    if (commentAudioUrl) URL.revokeObjectURL(commentAudioUrl);
    setCommentAudioUrl(null);
    setProcessedCommentAudioBlob(null);
    if (!keepInitial) setInitialCommentAudioBlob(null);
    commentAudioChunksRef.current = [];
    if (commentAudioPreviewRef.current) commentAudioPreviewRef.current.src = ''; 
    if (!keepInitial) {
        setSelectedCommentVoiceEffect("none"); 
    }
  };

  const uploadCommentAudio = async (audioToUpload: Blob, userId: string, postId: string): Promise<string> => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const audioFileName = `comment_${userId}_${postId}_${timestamp}_${randomSuffix}.wav`; 
    const storagePath = `commentAudio/${userId}/${postId}/${audioFileName}`;
    const audioStorageRef = storageRefFS(storage, storagePath);
    
    // toast({ title: "Uploading Comment Audio...", description: "Please wait."}); // Can be noisy
    await uploadBytes(audioStorageRef, audioToUpload);
    const downloadURL = await getDownloadURL(audioStorageRef);
    // toast({ title: "Comment Audio Uploaded!", variant: "default"});
    return downloadURL;
  };


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
        if (!postDoc.exists()) throw new Error("Post does not exist!");
        if (isLiked && likeDocId) {
          const likeRef = doc(firestore, "likes", likeDocId);
          transaction.delete(likeRef);
          transaction.update(postRef, { likeCount: increment(-1) });
          setPost(p => ({ ...p, likeCount: Math.max(0, p.likeCount - 1) })); 
          setIsLiked(false); setLikeDocId(null);
        } else {
          const newLikeRef = doc(collection(firestore, "likes"));
          transaction.set(newLikeRef, { userId: user.uid, postId: post.id, createdAt: serverTimestamp() });
          transaction.update(postRef, { likeCount: increment(1) });
          setPost(p => ({ ...p, likeCount: p.likeCount + 1 }));
          setIsLiked(true); setLikeDocId(newLikeRef.id);
        }
      });
    } catch (error) {
      toast({ title: "Like Error", variant: "destructive" });
    } finally {
      setIsLiking(false);
    }
  };

  const handleReEko = async () => {
    if (!user || authLoading || isReEkoing) return;
     if (!userProfile) {
        toast({ title: "Profile Error", variant: "destructive" });
        return;
    }
    setIsReEkoing(true);
    const postRef = doc(firestore, "posts", post.id);
    const reEkosRef = collection(firestore, "reEkos");
    try {
      const batch = writeBatch(firestore);
      const newReEkoRef = doc(reEkosRef);
      batch.set(newReEkoRef, {
        originalPostId: post.id, userId: user.uid, username: userProfile.username,
        userAvatarURL: userProfile.avatarURL || '', createdAt: serverTimestamp(),
      });
      batch.update(postRef, { reEkoCount: increment(1) });
      await batch.commit();
      setPost(p => ({ ...p, reEkoCount: p.reEkoCount + 1 }));
      toast({ title: "Re-Ekoed!" });
    } catch (error) {
      toast({ title: "Re-Eko Error", variant: "destructive" });
    } finally {
      setIsReEkoing(false);
    }
  };

  const openShareLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReport = () => {
    if (!user) {
      toast({ title: "Login Required", variant: "destructive" });
      return;
    }
    toast({ title: "Report Action", description: "Reporting functionality coming soon!"});
  };

  const handleDeletePost = async () => {
    if (!user || user.uid !== post.userId || isDeleting) return;
    setIsDeleting(true);
    try {
      if (post.audioURL) {
        try {
          const audioFileRef = storageRefFS(storage, post.audioURL);
          await deleteObject(audioFileRef);
        } catch (storageError: any) {
          if (storageError.code !== 'storage/object-not-found') {
             toast({ title: "Storage Deletion Error", variant: "destructive" });
          }
        }
      }
      const postRef = doc(firestore, "posts", post.id);
      await deleteDoc(postRef);
      toast({ title: "EkoDrop Deleted"});
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (error) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  const handleAddComment = async () => {
    if (!user || authLoading || isCommenting ) return;
    if (!userProfile) {
        toast({ title: "Profile Error", variant: "destructive" });
        return;
    }
    if (!commentText.trim() && !processedCommentAudioBlob) {
      toast({ title: "Empty Comment", description: "Please add text or record audio for your comment.", variant: "destructive" });
      return;
    }

    setIsCommenting(true);
    let commentAudioDownloadURL: string | undefined = undefined;

    try {
      if (processedCommentAudioBlob) {
        commentAudioDownloadURL = await uploadCommentAudio(processedCommentAudioBlob, user.uid, post.id);
      }
      
      const newCommentData: Partial<EkoComment> = {
        postId: post.id,
        userId: user.uid,
        username: userProfile.username,
        userAvatarURL: userProfile.avatarURL || '',
        createdAt: serverTimestamp() as Timestamp,
      };

      if (commentText.trim()) {
        newCommentData.textContent = commentText.trim();
      }
      if (commentAudioDownloadURL) {
        newCommentData.audioURL = commentAudioDownloadURL;
        if (selectedCommentVoiceEffect !== "none") {
          newCommentData.appliedVoiceEffect = selectedCommentVoiceEffect;
        }
        // newCommentData.durationSeconds = ... // if calculated
      }

      const postRef = doc(firestore, "posts", post.id);
      const commentsRef = collection(firestore, "comments");
      const batch = writeBatch(firestore);
      const newCommentRef = doc(commentsRef);
      batch.set(newCommentRef, newCommentData);
      batch.update(postRef, { commentCount: increment(1) });
      await batch.commit();

      setPost(p => ({ ...p, commentCount: p.commentCount + 1 }));
      setCommentText("");
      clearCommentAudio();
      setShowCommentInput(false); // Optionally keep open or close
      toast({ title: "Comment Posted!"});
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({ title: "Comment Error", variant: "destructive" });
    } finally {
      setIsCommenting(false);
    }
  };
  
  const handlePlayPauseAudio = () => {
    if (!post.audioURL) return;
    const trackToPlay: TrackDetails = {
      id: post.id, audioURL: post.audioURL,
      username: authorProfile?.username || post.username || "Unknown",
      userAvatarURL: authorProfile?.avatarURL || post.userAvatarURL,
      textContent: post.textContent,
    };
    const queueAsTrackDetails: TrackDetails[] = queue.map(p => ({
        id: p.id, audioURL: p.audioURL, username: p.username,
        userAvatarURL: p.userAvatarURL, textContent: p.textContent,
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

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/eko/${post.id}` : '';
  const shareText = `Check out this EkoDrop by @${authorUsername}: ${post.textContent.substring(0,100) + (post.textContent.length > 100 ? "..." : "")}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(`EkoDrop by @${authorUsername}`);


  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start space-x-4 p-4">
        {post.audioURL && (
          <Button 
            variant="ghost" size="icon" onClick={handlePlayPauseAudio} 
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
        {!post.audioURL && (
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
            {formatTimestamp(post.createdAt)} {post.appliedVoiceEffect && post.appliedVoiceEffect !== "none" && (<span className="text-xs italic text-muted-foreground/80">&bull; {post.appliedVoiceEffect.charAt(0).toUpperCase() + post.appliedVoiceEffect.slice(1)} effect</span>)}
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
      <CardContent className="p-4 pt-0 pl-20"> 
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Share2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openShareLink(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}>
              <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" /> Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareLink(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`)}>
              <Twitter className="mr-2 h-4 w-4 text-[#1DA1F2]" /> Post on X
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareLink(`https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`)}>
              <MessageSquare className="mr-2 h-4 w-4 text-[#0077FF]" /> Share on VK
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareLink(`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`)}>
              <MessageSquare className="mr-2 h-4 w-4 text-[#25D366]" /> Share via WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareLink(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`)}>
              <Send className="mr-2 h-4 w-4 text-[#0088cc]" /> Share on Telegram
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareLink(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}>
              <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" /> Share on LinkedIn
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(postUrl);
              toast({ title: "Link Copied!", description: "EkoDrop link copied to clipboard." });
            }}>
              <Copy className="mr-2 h-4 w-4" /> Copy Link
            </DropdownMenuItem>
            {typeof navigator !== 'undefined' && navigator.share && (
              <DropdownMenuItem onClick={async () => {
                try {
                  await navigator.share({
                    title: `EkoDrop by @${authorUsername}`,
                    text: shareText,
                    url: postUrl,
                  });
                } catch (error) {
                  console.error("Error using navigator.share:", error);
                  toast({ title: "Could not share", description: "Browser share failed, link copied instead.", variant: "default" });
                  navigator.clipboard.writeText(postUrl);
                }
              }}>
                <MoreHorizontal className="mr-2 h-4 w-4" /> More Options...
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>

      {showCommentInput && (
        <div className="p-4 border-t space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8 mt-1" data-ai-hint="user avatar">
              <AvatarImage src={userProfile?.avatarURL || `https://placehold.co/32x32.png?text=${userProfile?.username[0]?.toUpperCase() || 'U'}`} alt={userProfile?.username || "You"} />
              <AvatarFallback>{userProfile?.username[0]?.toUpperCase() || (user?.email && user.email[0].toUpperCase()) || "U"}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Add your thoughts (optional with voice)..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 min-h-[60px]"
              disabled={!user || authLoading || isCommenting || isRecordingComment}
            />
          </div>

          {/* Voice Commenting UI */}
          <div className="pl-11 space-y-3"> {/* Aligns with textarea content */}
            {hasCommentMicPermission === false && commentMicError && (
              <Alert variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3" />
                <AlertTitle className="text-xs">Mic Error</AlertTitle>
                <AlertDescription className="text-xs">{commentMicError}</AlertDescription>
              </Alert>
            )}
            {commentAudioUrl && processedCommentAudioBlob && (
              <div className="space-y-2 p-2 border rounded-md">
                <p className="text-xs font-medium">
                  Preview: {selectedCommentVoiceEffect !== "none" ? 
                    `${selectedCommentVoiceEffect.charAt(0).toUpperCase() + selectedCommentVoiceEffect.slice(1)}` 
                    : "Normal"}
                  {isProcessingCommentEffect && <Loader2 className="h-3 w-3 inline animate-spin ml-1" />}
                </p>
                <audio ref={commentAudioPreviewRef} src={commentAudioUrl} controls className="w-full h-10" />
                <Button type="button" variant="outline" size="xs" onClick={() => clearCommentAudio()} className="w-full text-red-500 hover:text-red-600">
                  <Trash2 className="mr-1 h-3 w-3" /> Delete Recording
                </Button>
              </div>
            )}

            {!initialCommentAudioBlob && (
              <div className="flex items-center space-x-2">
                {isRecordingComment ? (
                  <Button type="button" variant="destructive" onClick={stopCommentRecording} className="flex-1" size="sm">
                    <StopCircle className="mr-2 h-4 w-4" /> Stop 
                  </Button>
                ) : (
                  <Button 
                    type="button" variant="outline" 
                    onClick={hasCommentMicPermission === null ? getCommentMicrophonePermission : startCommentRecording} 
                    className="flex-1" size="sm"
                    disabled={hasCommentMicPermission === false || authLoading || !commentAudioContextRef.current || isCommenting}
                  >
                    <Mic className="mr-2 h-4 w-4" /> 
                    {hasCommentMicPermission === null ? "Enable Mic & Record" : "Record Voice Comment"}
                  </Button>
                )}
              </div>
            )}
             {initialCommentAudioBlob && !isRecordingComment && ( 
                <div className="space-y-2">
                    <label htmlFor={`comment-voice-effect-${post.id}`} className="text-xs font-medium flex items-center"><Wand2 className="mr-1 h-3 w-3 text-accent" />Voice Changer</label>
                    <Select 
                    onValueChange={(value: VoiceEffect) => setSelectedCommentVoiceEffect(value)} 
                    value={selectedCommentVoiceEffect} 
                    disabled={isProcessingCommentEffect || isCommenting}
                    >
                    <SelectTrigger id={`comment-voice-effect-${post.id}`} className="h-9 text-xs">
                        <SelectValue placeholder="Effect" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none" className="text-xs">Normal</SelectItem>
                        <SelectItem value="chipmunk" className="text-xs">Chipmunk</SelectItem>
                        <SelectItem value="deep" className="text-xs">Deep</SelectItem>
                        <SelectItem value="robot" className="text-xs">Robot</SelectItem>
                        <SelectItem value="echo" className="text-xs">Echo</SelectItem>
                        <SelectItem value="alien" className="text-xs">Alien</SelectItem>
                        <SelectItem value="monster" className="text-xs">Monster</SelectItem>
                        <SelectItem value="radio" className="text-xs">Radio</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            )}
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={handleAddComment} size="sm" disabled={!user || authLoading || isCommenting || isRecordingComment || isProcessingCommentEffect || (!commentText.trim() && !processedCommentAudioBlob)}>
              {isCommenting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Post Comment
            </Button>
          </div>
          {!user && !authLoading && <p className="text-xs text-muted-foreground mt-2 text-center">Please login to comment.</p>}
        </div>
      )}
    </Card>
  );
}

