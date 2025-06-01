
"use client";

import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { quickPostEkoDrop } from "@/lib/actions/postActions";
import { formatTimestampSimple } from "@/lib/format-timestamp";

export function FloatingCreateEkoButton() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestMicPermission = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately after permission check
        return true;
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setHasPermission(false);
        toast({
          title: "Microphone Access Denied",
          description: "Please enable microphone permissions in your browser settings to record audio.",
          variant: "destructive",
        });
        return false;
      }
    }
    return false;
  }, [toast]);

  const startRecording = async () => {
    if (isRecording || isSubmitting) return;

    let permissionGranted = hasPermission;
    if (permissionGranted === null) { // First time asking or if permission state unknown
      permissionGranted = await requestMicPermission();
    }
    if (!permissionGranted) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? { mimeType: 'audio/ogg;codecs=opus' }
        : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstart = () => {
        setIsRecording(true);
        setRecordingDuration(0);
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        // toast({ title: "Recording started...", duration: 1500 });
      };

      mediaRecorderRef.current.onstop = async () => {
        // This logic is moved primarily to handlePressEnd to ensure it runs on button release
        // Stop stream tracks here when recording truly stops
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast({ title: "Recording Error", description: "An error occurred during recording.", variant: "destructive" });
        setIsRecording(false);
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
         stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();

    } catch (error) {
      console.error("Error starting recording:", error);
      toast({ title: "Recording Error", description: "Could not start recording. Please check microphone permissions.", variant: "destructive" });
      setIsRecording(false);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    }
  };

  const stopRecordingAndPost = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // This will trigger onstop
    }
    // onstop handler will deal with stream tracks already

    setIsRecording(false); // UI update immediately
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Give a moment for ondataavailable and onstop to fire and populate audioChunksRef
    await new Promise(resolve => setTimeout(resolve, 100));


    if (audioChunksRef.current.length === 0) {
      // toast({ title: "No audio recorded", description: "Try recording for a bit longer.", variant: "default" });
      setIsSubmitting(false);
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
    audioChunksRef.current = []; // Clear chunks for next recording

    if (audioBlob.size === 0) {
      toast({ title: "Recording Error", description: "No audio data captured.", variant: "destructive"});
      setIsSubmitting(false);
      return;
    }

    if (!user?.uid) {
        toast({ title: "Authentication Error", description: "You need to be logged in to post.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    setIsSubmitting(true);
    toast({ title: "Posting EkoDrop...", description: "Please wait." });

    const formData = new FormData();
    formData.append('audioBlob', audioBlob);
    formData.append('userId', user.uid);

    try {
      const result = await quickPostEkoDrop(formData);
      if (result.success) {
        toast({ title: "EkoDrop Posted!", description: result.message });
      } else {
        toast({ title: "Post Failed", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error quick posting:", error);
      toast({ title: "Post Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setRecordingDuration(0); // Reset duration for next potential recording
    }
  };

  const handlePressStart = () => {
    if (authLoading || isSubmitting) return;
    if (!user) {
        router.push('/auth/login?redirect=/feed'); // Redirect to feed, as create page is not the primary flow here
        return;
    }
    startRecording();
  };

  const handlePressEnd = () => {
    if (isRecording) {
      stopRecordingAndPost();
    }
  };

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);


  if (authLoading) {
    return null; // Don't render if auth state is still loading
  }

  let buttonIcon = <Mic className="h-7 w-7" />;
  let buttonBaseClass = "bg-accent hover:bg-accent/90 text-accent-foreground";
  let buttonTitle = user ? "Press and hold to record EkoDrop" : "Login to record EkoDrop";
  let isDisabled = isSubmitting || authLoading; // Disable if submitting or auth is still loading
  let animationClass = "";

  if (isSubmitting) {
    buttonIcon = <Loader2 className="h-7 w-7 animate-spin" />;
    buttonTitle = "Posting...";
  } else if (isRecording) {
    buttonIcon = <StopCircle className="h-7 w-7" />;
    buttonBaseClass = "bg-red-500 hover:bg-red-600 text-white";
    buttonTitle = "Release to stop recording & post";
    animationClass = "animate-pulse scale-110 ring-4 ring-red-500/50";
  } else if (hasPermission === false && user) { // Only show mic error if user is logged in
    buttonIcon = <AlertTriangle className="h-7 w-7" />;
    buttonBaseClass = "bg-yellow-500 hover:bg-yellow-600 text-white";
    buttonTitle = "Microphone permission needed. Click to retry or check settings.";
    // onClick for this state could re-trigger requestMicPermission
  }


  return (
    <div className="fixed bottom-6 right-6 z-[101]">
      {isRecording && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm shadow-md whitespace-nowrap">
          {formatTimestampSimple(recordingDuration)}
        </div>
      )}
      <Button
        variant="default"
        size="icon"
        className={cn(
          "h-16 w-16 rounded-full shadow-xl transition-all duration-150 ease-in-out focus-visible:ring-4 focus-visible:ring-ring/70",
          buttonBaseClass,
          animationClass
        )}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseLeave={() => { // Handle mouse leaving button while pressed
            if (isRecording) {
                handlePressEnd();
            }
        }}
        disabled={isDisabled}
        aria-label={buttonTitle}
        title={buttonTitle}
        onClick={() => { // Handle click for retrying permission if needed
            if (hasPermission === false && user && !isRecording && !isSubmitting) {
                requestMicPermission();
            }
        }}
      >
        {buttonIcon}
      </Button>
    </div>
  );
}

