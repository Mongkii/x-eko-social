
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
  FormDescription,
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
  return data.textContent || (data.voiceEffect && data.voiceEffect !== "none");
}, {
  message: "An EkoDrop must have either text content or an audio recording.",
  path: ["textContent"],
});


type VoiceEffect = 
  | "none" 
  | "chipmunk" 
  | "deep" 
  | "robot" 
  | "echo" 
  | "alien" 
  | "monster"
  | "radio";

// Helper function to convert AudioBuffer to WAV Blob
// Reference: https://stackoverflow.com/a/30045041 and https://gist.github.com/meason/
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Int16Array;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0).map(sample => Math.max(-1, Math.min(1, sample)) * 32767);
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
  view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size (16 for PCM)
  view.setUint16(offset, format, true); offset += 2;
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numChannels * (bitDepth / 8), true); offset += 4; // ByteRate
  view.setUint16(offset, numChannels * (bitDepth / 8), true); offset += 2; // BlockAlign
  view.setUint16(offset, bitDepth, true); offset += 2;
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, dataLength, true); offset += 4;

  for (let i = 0; i < result.length; i++, offset += 2) {
    view.setInt16(offset, result[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function interleave(inputL: Float32Array, inputR: Float32Array): Int16Array {
  const length = inputL.length + inputR.length;
  const result = new Int16Array(length);
  let index = 0;
  let inputIndex = 0;
  while (index < length) {
    result[index++] = Math.max(-32768, Math.min(32767, inputL[inputIndex] * 32767));
    result[index++] = Math.max(-32768, Math.min(32767, inputR[inputIndex] * 32767));
    inputIndex++;
  }
  return result;
}


export function CreateEkoForm() {
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [initialAudioBlob, setInitialAudioBlob] = useState<Blob | null>(null);
  const [processedAudioBlob, setProcessedAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [selectedVoiceEffect, setSelectedVoiceEffect] = useState<VoiceEffect>("none");
  const [isProcessingEffect, setIsProcessingEffect] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);


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
        voiceEffect: "none",
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
  
  const applyVoiceEffect = useCallback(async (inputBlob: Blob | null, effect: VoiceEffect): Promise<Blob | null> => {
    if (!inputBlob || !audioContextRef.current) return null;

    setIsProcessingEffect(true);
    toast({ title: "Applying Voice Effect...", description: `Processing audio with ${effect} effect.` });

    try {
      const arrayBuffer = await inputBlob.arrayBuffer();
      const decodedAudioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      const offlineCtx = new OfflineAudioContext(
        decodedAudioBuffer.numberOfChannels,
        decodedAudioBuffer.length,
        decodedAudioBuffer.sampleRate
      );
      
      const source = offlineCtx.createBufferSource();
      source.buffer = decodedAudioBuffer;

      switch (effect) {
        case "chipmunk":
          source.playbackRate.value = 1.8; // Higher pitch and faster
          source.connect(offlineCtx.destination);
          break;
        case "deep":
          source.playbackRate.value = 0.6; // Lower pitch and slower
          source.connect(offlineCtx.destination);
          break;
        case "robot":
        case "echo":
        case "alien":
        case "monster":
        case "radio":
          // Placeholder: For complex effects, advanced Web Audio API nodes would be connected here.
          // For now, these will sound like "none".
          console.warn(`Effect "${effect}" is complex and currently not fully implemented. Audio passes through unchanged.`);
          source.connect(offlineCtx.destination);
          break;
        case "none":
        default:
          source.connect(offlineCtx.destination);
          break;
      }
      
      source.start(0);
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);

      setIsProcessingEffect(false);
      toast({ title: "Effect Applied!", description: `Audio processed with ${effect} effect.`});
      return wavBlob;

    } catch (error) {
      console.error("Error applying voice effect:", error);
      setIsProcessingEffect(false);
      toast({ variant: "destructive", title: "Effect Error", description: "Could not apply voice effect." });
      return inputBlob; // Return original blob on error
    }
  }, [toast]);


  const processAndSetAudio = useCallback(async (baseBlob: Blob | null, effect: VoiceEffect) => {
    if (!baseBlob) {
      clearAudio(true); 
      return;
    }
    const PAblob = await applyVoiceEffect(baseBlob, effect);
    setProcessedAudioBlob(PAblob);
    if (audioUrl) URL.revokeObjectURL(audioUrl); 
    if (PAblob) {
        const newPreviewUrl = URL.createObjectURL(PAblob);
        setAudioUrl(newPreviewUrl);
    } else {
        setAudioUrl(null);
    }
  }, [applyVoiceEffect, audioUrl]);


  useEffect(() => {
    if (initialAudioBlob) {
      processAndSetAudio(initialAudioBlob, selectedVoiceEffect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoiceEffect]); 

  const startRecording = async () => {
    clearAudio(); 
    if (hasMicrophonePermission === null) {
      await getMicrophonePermission(); 
    }
    if (hasMicrophonePermission === false || !navigator.mediaDevices) {
       toast({ variant: "destructive", title: "Microphone Required", description: microphoneError || "Microphone permission is not granted or media devices are not available."});
       return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use a common mimeType that's likely supported and good for processing
      const options = { mimeType: 'audio/webm;codecs=opus' };
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn("WebM Opus not supported, falling back to default MediaRecorder config", e);
        mediaRecorderRef.current = new MediaRecorder(stream);
      }
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const completeAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' }); 
        setInitialAudioBlob(completeAudioBlob); 
        await processAndSetAudio(completeAudioBlob, selectedVoiceEffect); 
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
    if (!keepInitial) {
        setSelectedVoiceEffect("none");
        form.setValue("voiceEffect", "none");
    }
  };

  const uploadAudio = async (audioToUpload: Blob, userId: string): Promise<string> => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    // Upload as WAV since that's what we are processing to for simplicity
    const audioFileName = `eko_${timestamp}_${randomSuffix}.wav`; 
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
            description: "Please add some text or record and process audio for your EkoDrop.",
            variant: "destructive",
        });
        form.setError("textContent", { message: "EkoDrop must have text or audio." });
        return;
    }
    form.clearErrors("textContent"); 


    setIsSubmitting(true);
    let audioDownloadURL: string | undefined = undefined;

    try {
      if (processedAudioBlob) { 
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
        ...(values.voiceEffect && values.voiceEffect !== "none" && { appliedVoiceEffect: values.voiceEffect }), 
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
                Previewing: {selectedVoiceEffect !== "none" ? 
                  `${selectedVoiceEffect.charAt(0).toUpperCase() + selectedVoiceEffect.slice(1)} effect` 
                  : "Normal voice"}
                {isProcessingEffect && <Loader2 className="h-4 w-4 inline animate-spin ml-2" />}
              </p>
              <audio ref={audioPreviewRef} src={audioUrl} controls className="w-full" />
              <Button type="button" variant="outline" size="sm" onClick={() => clearAudio()} className="w-full text-red-500 hover:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Recording & Effects
              </Button>
            </div>
          )}

          {!initialAudioBlob && ( 
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

        {initialAudioBlob && !isRecording && (
           <FormField
            control={form.control}
            name="voiceEffect"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Wand2 className="mr-2 h-4 w-4 text-accent" /> Voice Changer (Optional)</FormLabel>
                <Select 
                  onValueChange={(value: VoiceEffect) => {
                    field.onChange(value);
                    setSelectedVoiceEffect(value); 
                  }} 
                  value={selectedVoiceEffect} 
                  disabled={isProcessingEffect}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice effect" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Normal</SelectItem>
                    <SelectItem value="chipmunk">Chipmunk</SelectItem>
                    <SelectItem value="deep">Deep Voice</SelectItem>
                    <SelectItem value="robot">Robot (Simulated)</SelectItem>
                    <SelectItem value="echo">Echo Chamber (Simulated)</SelectItem>
                    <SelectItem value="alien">Alien Voice (Simulated)</SelectItem>
                    <SelectItem value="monster">Monster Growl (Simulated)</SelectItem>
                    <SelectItem value="radio">Radio Static (Simulated)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Apply an effect to your voice. 
                  Chipmunk/Deep effects change pitch and speed. 
                  Other advanced effects are currently simulated.
                </FormDescription>
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
          {(isSubmitting || isProcessingEffect) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

