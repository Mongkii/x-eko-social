
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { firestore, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Mic, StopCircle, Trash2, AlertTriangle, Wand2 } from "lucide-react";
import type { EkoPost, PostVisibility } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  textContent: z.string().max(280, "EkoDrop text too long.").optional(),
  visibility: z.enum(["public", "followers-only", "private"]),
  voiceEffect: z.string().optional(),
}).refine(data => {
  return data.textContent || data.voiceEffect !== undefined;
}, {
  message: "An EkoDrop must have either text content or an audio recording.",
  path: ["textContent"],
});

type VoiceEffect = "none" | "chipmunk" | "deep" | "robot";

export function CreateEkoForm() {
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [initialAudioBlob, setInitialAudioBlob] = useState<Blob | null>(null); // Stores the original raw recording
  const [processedAudioBlob, setProcessedAudioBlob] = useState<Blob | null>(null); // Stores the blob after effect application
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // URL for previewing processedAudioBlob
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [selectedVoiceEffect, setSelectedVoiceEffect] = useState<VoiceEffect>("none");
  const [isProcessingEffect, setIsProcessingEffect] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textContent: "",
      visibility: "public",
      voiceEffect: "none",
    },
  });
  
  useEffect(() => {
    if (userProfile) {
      form.reset({
        textContent: form.getValues("textContent") || "",
        visibility: userProfile.privacy.defaultPostVisibility || "public",
        voiceEffect: "none", // Start with no effect selected
      });
      setSelectedVoiceEffect("none");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, form.reset]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const getMicrophonePermission = async () => {
    if (hasMicrophonePermission === null) { 
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicrophonePermission(true);
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneError(null);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setHasMicrophonePermission(false);
        const errorMessage = error instanceof Error && error.name === 'NotAllowedError' 
          ? 'Microphone access denied. Please enable it in your browser settings.' 
          : 'Could not access microphone. Please ensure it is connected and enabled.';
        setMicrophoneError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description: errorMessage,
        });
      }
    }
  };
  
  // SIMULATED voice effect application
  const applyVoiceEffect = useCallback(async (inputBlob: Blob, effect: VoiceEffect): Promise<Blob> => {
    if (!inputBlob) return inputBlob;
    if (effect === "none") {
      return inputBlob;
    }

    setIsProcessingEffect(true);
    toast({ title: "Applying Voice Effect...", description: `Applying ${effect} effect. This is a simulation.` });
    
    // Simulate asynchronous processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000)); 
    
    // In a real scenario, Web Audio API would be used here to transform inputBlob
    // For now, we return the original blob for demonstration of the workflow.
    console.warn(`Voice effect "${effect}" is currently simulated and not actually applied to the audio data.`);
    
    setIsProcessingEffect(false);
    return inputBlob; // Return original blob after simulated processing
  }, [toast]);


  const processAndSetAudio = useCallback(async (baseBlob: Blob | null, effect: VoiceEffect) => {
    if (!baseBlob) {
      clearAudio(true); // Clear everything if baseBlob is null
      return;
    }
    const PAblob = await applyVoiceEffect(baseBlob, effect);
    setProcessedAudioBlob(PAblob);
    if (audioUrl) URL.revokeObjectURL(audioUrl); // Revoke old URL
    const newPreviewUrl = URL.createObjectURL(PAblob);
    setAudioUrl(newPreviewUrl);
  }, [applyVoiceEffect, audioUrl]);


  useEffect(() => {
    // When selectedVoiceEffect changes, and there's an initial recording, reprocess and update preview
    if (initialAudioBlob) {
      processAndSetAudio(initialAudioBlob, selectedVoiceEffect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoiceEffect]); // processAndSetAudio and initialAudioBlob are dependencies but processAndSetAudio is memoized
                           // initialAudioBlob changes only on new recording, which is handled by onstop.

  const startRecording = async () => {
    clearAudio(); // Clear previous recording and effects
    if (hasMicrophonePermission === null) {
      await getMicrophonePermission(); 
    }
    if (hasMicrophonePermission === false || !navigator.mediaDevices) {
       toast({ variant: "destructive", title: "Microphone Required", description: microphoneError || "Microphone permission is not granted or media devices are not available."});
       return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const completeAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
        setInitialAudioBlob(completeAudioBlob); // Save the raw recording
        await processAndSetAudio(completeAudioBlob, selectedVoiceEffect); // Process with current effect for initial preview
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
        console.error("Failed to start recording: ", err);
        const errorMsg = "Failed to start recording. Please try again.";
        setMicrophoneError(errorMsg);
        toast({ variant: "destructive", title: "Recording Error", description: errorMsg});
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = (keepInitial: boolean = false) => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setProcessedAudioBlob(null);
    if (!keepInitial) {
        setInitialAudioBlob(null);
    }
    audioChunksRef.current = [];
    if (audioPreviewRef.current) {
        audioPreviewRef.current.src = '';
    }
    // Reset selected effect to none if clearing everything
    if (!keepInitial) {
        setSelectedVoiceEffect("none");
        form.setValue("voiceEffect", "none");
    }
  };

  const uploadAudio = async (audioToUpload: Blob, userId: string): Promise<string> => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const audioFileName = `eko_${timestamp}_${randomSuffix}.webm`;
    const storageRefPath = `ekoPostsAudio/${userId}/${audioFileName}`;
    const audioStorageRef = ref(storage, storageRefPath);
    
    toast({ title: "Uploading Audio...", description: "Please wait."});
    await uploadBytes(audioStorageRef, audioToUpload);
    const downloadURL = await getDownloadURL(audioStorageRef);
    toast({ title: "Audio Uploaded!", variant: "default"});
    return downloadURL;
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to post.", variant: "destructive" });
      return;
    }
    if (!userProfile) {
      toast({ title: "Profile Error", description: "Your user profile could not be loaded.", variant: "destructive" });
      return;
    }

    if (!values.textContent && !processedAudioBlob) {
        toast({
            title: "Empty EkoDrop",
            description: "Please add some text or record audio for your EkoDrop.",
            variant: "destructive",
        });
        form.setError("textContent", { message: "EkoDrop must have text or audio." });
        return;
    }
    form.clearErrors("textContent");


    setIsSubmitting(true);
    let audioDownloadURL: string | undefined = undefined;

    try {
      if (processedAudioBlob) { // Upload the processed blob
        audioDownloadURL = await uploadAudio(processedAudioBlob, user.uid);
      }
      
      const hashtags = values.textContent ? values.textContent.match(/#\w+/g)?.map(h => h.toLowerCase()) : [];


      const newPostData: Omit<EkoPost, 'id' | 'createdAt'> & { createdAt: Timestamp } = {
        userId: user.uid,
        username: userProfile.username,
        userAvatarURL: userProfile.avatarURL || '',
        textContent: values.textContent || "", 
        visibility: values.visibility as PostVisibility,
        commentCount: 0,
        likeCount: 0,
        reEkoCount: 0,
        createdAt: serverTimestamp() as Timestamp,
        ...(audioDownloadURL && { audioURL: audioDownloadURL }),
        ...(values.voiceEffect && values.voiceEffect !== "none" && { appliedVoiceEffect: values.voiceEffect }), // Store applied effect
        ...(hashtags && hashtags.length > 0 && { hashtags }),
      };

      await addDoc(collection(firestore, "posts"), newPostData);

      toast({
        title: "EkoDrop Posted!",
        description: "Your voice is out there.",
      });
      clearAudio();
      form.reset({ textContent: "", visibility: userProfile.privacy.defaultPostVisibility || "public", voiceEffect: "none" });
      setSelectedVoiceEffect("none");
      router.push("/feed");
    } catch (error) {
      console.error("Error posting EkoDrop:", error);
      toast({
        title: "Post Failed",
        description: "Could not post your EkoDrop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const canSubmit = !isSubmitting && !authLoading && user && userProfile && !isRecording && !isProcessingEffect;

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
                  placeholder="Share your thoughts... #eko #voicefirst"
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
          {audioUrl && processedAudioBlob && (
            <div className="space-y-2 p-3 border rounded-md">
              <p className="text-sm font-medium">
                Previewing: {selectedVoiceEffect !== "none" ? selectedVoiceEffect + " effect" : "Normal voice"}
                {isProcessingEffect && <Loader2 className="h-4 w-4 inline animate-spin ml-2" />}
              </p>
              <audio ref={audioPreviewRef} src={audioUrl} controls className="w-full" />
              <Button type="button" variant="outline" size="sm" onClick={() => clearAudio()} className="w-full text-red-500 hover:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Recording & Effects
              </Button>
            </div>
          )}

          {!initialAudioBlob && ( // Show record button only if no initial recording exists
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <Button type="button" variant="destructive" onClick={stopRecording} className="flex-1">
                  <StopCircle className="mr-2 h-5 w-5" /> Stop Recording
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={hasMicrophonePermission === null ? getMicrophonePermission : startRecording} 
                  className="flex-1" 
                  disabled={hasMicrophonePermission === false || authLoading}
                >
                  <Mic className="mr-2 h-5 w-5" /> 
                  {hasMicrophonePermission === null ? "Enable Mic & Record" : "Record Audio"}
                </Button>
              )}
            </div>
          )}
        </div>

        {initialAudioBlob && !isRecording && ( // Show effects dropdown if there's an initial recording and not currently recording
           <FormField
            control={form.control}
            name="voiceEffect"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Wand2 className="mr-2 h-4 w-4 text-accent" /> Voice Changer (Optional)</FormLabel>
                <Select 
                  onValueChange={(value: VoiceEffect) => {
                    field.onChange(value);
                    setSelectedVoiceEffect(value); // This will trigger the useEffect to re-process
                  }} 
                  value={selectedVoiceEffect} // Controlled by selectedVoiceEffect state
                  disabled={isProcessingEffect}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice effect" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Normal</SelectItem>
                    <SelectItem value="chipmunk">Chipmunk (Simulated)</SelectItem>
                    <SelectItem value="deep">Deep Voice (Simulated)</SelectItem>
                    <SelectItem value="robot">Robot (Simulated)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select an effect. The preview will update. Effects are currently simulated.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


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
                  value={field.value}
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
        
        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isProcessingEffect && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post EkoDrop
        </Button>
        
        <div className="text-sm text-center text-muted-foreground min-h-[20px]">
            {authLoading && <p>Checking authentication...</p>}
            {!authLoading && !user && <p>Please log in to post.</p>}
            {!authLoading && user && !userProfile && <p>User profile is not available. Posting disabled.</p>}
            {isRecording && <p className="text-yellow-500">Please stop recording before posting.</p>}
            {isProcessingEffect && <p className="text-blue-500">Applying voice effect...</p>}
        </div>

      </form>
    </Form>
  );
}
