
"use client";

import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { quickPostEkoDrop } from "@/lib/actions/postActions"; // New server action

const LONG_PRESS_DURATION_MS = 500; // 0.5 seconds for long press

export function FloatingCreateEkoButton() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestMicPermission = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        // Stop tracks immediately after permission check if not starting recording yet
        stream.getTracks().forEach(track => track.stop());
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
    if (isRecording) return;

    let permissionGranted = hasPermission;
    if (permissionGranted === null) {
      permissionGranted = await requestMicPermission();
    }
    if (!permissionGranted) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstart = () => {
        setIsRecording(true);
        toast({ title: "Recording started...", duration: 2000 });
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsLongPressActive(false); // Ensure long press state is reset
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access

        if (audioBlob.size === 0) {
          toast({ title: "Recording Error", description: "No audio data captured.", variant: "destructive"});
          return;
        }

        setIsSubmitting(true);
        toast({ title: "Posting EkoDrop...", description: "Please wait." });

        const formData = new FormData();
        formData.append('audioBlob', audioBlob);

        try {
          const result = await quickPostEkoDrop(formData);
          if (result.success) {
            toast({ title: "EkoDrop Posted!", description: result.message });
            // Optionally navigate or refresh data here
          } else {
            toast({ title: "Post Failed", description: result.message, variant: "destructive" });
          }
        } catch (error) {
          console.error("Error quick posting:", error);
          toast({ title: "Post Error", description: "An unexpected error occurred.", variant: "destructive" });
        } finally {
          setIsSubmitting(false);
        }
      };

      mediaRecorderRef.current.start();

    } catch (error) {
      console.error("Error starting recording:", error);
      toast({ title: "Recording Error", description: "Could not start recording.", variant: "destructive" });
      setIsRecording(false);
      setIsLongPressActive(false);
    }
  };

  const stopRecordingAndPost = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // onstop handler will do the posting
    }
    // Resetting states is handled in onstop or if stopping without recording
    setIsLongPressActive(false);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handlePressStart = () => {
    if (authLoading || !user) {
        router.push('/auth/login?redirect=/create-eko'); // Or current page if preferred
        return;
    }
    if (isSubmitting || isRecording) return; // Don't allow new actions if already submitting or recording

    setIsLongPressActive(true); // Assume long press might happen
    longPressTimeoutRef.current = setTimeout(() => {
      if (isLongPressActive) { // Check if button is still pressed
        startRecording();
      }
    }, LONG_PRESS_DURATION_MS);
  };

  const handlePressEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    if (isRecording) { // If recording was active, this means long press was successful
      stopRecordingAndPost();
    } else if (isLongPressActive) { // If long press was active but recording didn't start (e.g. released before timer, or permission issue)
      // This was a short click because recording didn't start
      if (user) {
        router.push('/create-eko');
      } else {
        router.push('/auth/login?redirect=/create-eko');
      }
    }
    setIsLongPressActive(false); // Always reset this
  };

  // Clean up MediaRecorder and stream on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);
  
  if (authLoading) {
    return null; // Don't show button while auth state is resolving
  }

  let buttonIcon = <Mic className="h-7 w-7" />;
  let buttonClass = "bg-accent hover:bg-accent/90 text-accent-foreground";
  let buttonTitle = user ? "Create EkoDrop (Hold to record)" : "Login to Create EkoDrop";
  let isDisabled = isSubmitting;

  if (isSubmitting) {
    buttonIcon = <Loader2 className="h-7 w-7 animate-spin" />;
    buttonTitle = "Posting...";
  } else if (isRecording) {
    buttonIcon = <StopCircle className="h-7 w-7" />;
    buttonClass = "bg-red-500 hover:bg-red-600 text-white animate-pulse";
    buttonTitle = "Stop Recording & Post";
  } else if (hasPermission === false) {
    buttonIcon = <AlertTriangle className="h-7 w-7" />;
    buttonClass = "bg-yellow-500 hover:bg-yellow-600 text-white";
    buttonTitle = "Microphone permission needed";
    // Allow click to re-trigger permission request or go to settings.
    // For now, a click will attempt permission again or go to create page if permission already given.
  }


  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-[101] h-16 w-16 rounded-full shadow-xl transition-all duration-150 ease-in-out",
        buttonClass
      )}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onMouseLeave={() => { // If mouse leaves button while pressed and not recording, cancel long press intent
        if (isLongPressActive && !isRecording && longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
            setIsLongPressActive(false);
        }
      }}
      disabled={isDisabled || authLoading}
      aria-label={buttonTitle}
      title={buttonTitle}
    >
      {buttonIcon}
    </Button>
  );
}
