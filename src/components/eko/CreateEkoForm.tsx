
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { firestore, storage } from "@/lib/firebase"; // Import storage
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage functions
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Loader2, Mic, StopCircle, Play, Trash2, AlertTriangle } from "lucide-react";
import type { EkoPost, PostVisibility } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const formSchema = z.object({
  textContent: z.string().max(280, "EkoDrop text too long.").optional(),
  visibility: z.enum(["public", "followers-only", "private"]),
}).refine(data => {
  // This refine is tricky with external state for audio.
  // We'll do this check in the onSubmit handler.
  return true;
}, {
  message: "An EkoDrop must have either text content or an audio recording.",
  path: ["textContent"], // Path can be adjusted
});


export function CreateEkoForm() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // For preview
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textContent: "",
      visibility: userProfile?.privacy.defaultPostVisibility || "public",
    },
  });
  
  useEffect(() => {
    if (userProfile) {
      form.reset({
        textContent: "",
        visibility: userProfile.privacy.defaultPostVisibility || "public",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, form.reset]);

  useEffect(() => {
    // Cleanup audio URL when component unmounts or audioBlob changes
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const getMicrophonePermission = async () => {
    if (hasMicrophonePermission === null) { // Only request if not determined yet
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophonePermission(true);
        // We don't need to do anything with the stream here,
        // MediaRecorder will handle it.
        // Close the stream if it's not immediately used to free up the microphone
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneError(null);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setHasMicrophonePermission(false);
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setMicrophoneError('Microphone access denied. Please enable it in your browser settings.');
        } else {
          setMicrophoneError('Could not access microphone. Please ensure it is connected and enabled.');
        }
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description: microphoneError || 'Please enable microphone permissions in your browser settings.',
        });
      }
    }
  };
  
  // Request permission on component mount or when user attempts to record
  useEffect(() => {
    // Optionally, you can request permission on load, or wait for user interaction.
    // For better UX, often good to wait for interaction.
    // getMicrophonePermission(); 
  }, []);


  const startRecording = async () => {
    if (hasMicrophonePermission === null) {
      await getMicrophonePermission(); // Wait for permission check
    }
    if (!hasMicrophonePermission) {
       toast({ variant: "destructive", title: "Microphone Required", description: microphoneError || "Microphone permission is not granted."});
       return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const completeAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // or audio/mp3, audio/wav depending on browser/encoder
        setAudioBlob(completeAudioBlob);
        const previewUrl = URL.createObjectURL(completeAudioBlob);
        setAudioUrl(previewUrl);
        // Stop microphone tracks to turn off indicator
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
        console.error("Failed to start recording: ", err);
        setMicrophoneError("Failed to start recording. Please try again.");
        toast({ variant: "destructive", title: "Recording Error", description: "Could not start recording."});
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];
    if (audioPreviewRef.current) {
        audioPreviewRef.current.src = '';
    }
  };

  const uploadAudio = async (audioToUpload: Blob, userId: string): Promise<string> => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const audioFileName = `eko_${timestamp}_${randomSuffix}.webm`;
    const storageRef = ref(storage, `ekoPostsAudio/${userId}/${audioFileName}`);
    
    toast({ title: "Uploading Audio...", description: "Please wait."});
    await uploadBytes(storageRef, audioToUpload);
    const downloadURL = await getDownloadURL(storageRef);
    toast({ title: "Audio Uploaded!", variant: "default"});
    return downloadURL;
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
      toast({ title: "Error", description: "You must be logged in to post.", variant: "destructive" });
      return;
    }

    if (!values.textContent && !audioBlob) {
        toast({
            title: "Empty EkoDrop",
            description: "Please add some text or record audio for your EkoDrop.",
            variant: "destructive",
        });
        form.setError("textContent", { message: "EkoDrop must have text or audio." });
        return;
    }
    form.clearErrors("textContent");


    setIsLoading(true);
    let audioDownloadURL: string | undefined = undefined;

    try {
      if (audioBlob) {
        audioDownloadURL = await uploadAudio(audioBlob, user.uid);
      }

      const newPostData: Omit<EkoPost, 'id' | 'createdAt'> & { createdAt: Timestamp } = {
        userId: user.uid,
        username: userProfile.username,
        userAvatarURL: userProfile.avatarURL || '',
        textContent: values.textContent || "", // Ensure textContent is string even if empty
        visibility: values.visibility as PostVisibility,
        commentCount: 0,
        likeCount: 0,
        reEkoCount: 0,
        createdAt: serverTimestamp() as Timestamp,
        ...(audioDownloadURL && { audioURL: audioDownloadURL }),
        // waveform: [], // Could generate waveform data here or server-side
        // durationSeconds: 0, // Could get duration here
      };

      await addDoc(collection(firestore, "posts"), newPostData);

      toast({
        title: "EkoDrop Posted!",
        description: "Your voice is out there.",
      });
      clearAudio();
      form.reset({ textContent: "", visibility: userProfile.privacy.defaultPostVisibility || "public" });
      router.push("/feed");
    } catch (error) {
      console.error("Error posting EkoDrop:", error);
      toast({
        title: "Post Failed",
        description: "Could not post your EkoDrop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="textContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's on your mind? (Optional if recording audio)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Add Voice</FormLabel>
          {hasMicrophonePermission === false && microphoneError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Microphone Error</AlertTitle>
              <AlertDescription>
                {microphoneError} You might need to grant permission in your browser settings and refresh the page.
              </AlertDescription>
            </Alert>
          )}
          {audioUrl && audioBlob && (
            <div className="space-y-2 p-3 border rounded-md">
              <p className="text-sm font-medium">Your Recording:</p>
              <audio ref={audioPreviewRef} src={audioUrl} controls className="w-full" />
              <Button type="button" variant="outline" size="sm" onClick={clearAudio} className="w-full text-red-500 hover:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Recording
              </Button>
            </div>
          )}

          {!audioBlob && (
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <Button type="button" variant="destructive" onClick={stopRecording} className="flex-1">
                  <StopCircle className="mr-2 h-5 w-5" /> Stop Recording
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={hasMicrophonePermission === null ? getMicrophonePermission : startRecording} className="flex-1" disabled={hasMicrophonePermission === false}>
                  <Mic className="mr-2 h-5 w-5" /> 
                  {hasMicrophonePermission === null ? "Enable Mic & Record" : "Record Audio"}
                </Button>
              )}
            </div>
          )}
          {/* TODO: Add file upload option later */}
           {/* <Input type="file" accept="audio/*" onChange={handleFileUpload} disabled={isRecording || !!audioBlob} /> */}
        </div>


        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Visibility:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="public" />
                    </FormControl>
                    <FormLabel className="font-normal">Public</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="followers-only" />
                    </FormControl>
                    <FormLabel className="font-normal">Followers Only</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="private" />
                    </FormControl>
                    <FormLabel className="font-normal">Private (Only You)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading || !user || isRecording}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post EkoDrop
        </Button>
        {!user && <p className="text-sm text-center text-muted-foreground">Please log in to post.</p>}
        {isRecording && <p className="text-sm text-center text-yellow-500">Please stop recording before posting.</p>}
      </form>
    </Form>
  );
}

    