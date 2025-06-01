
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
  // Allow post if textContent exists OR if a voice effect is chosen (implying audio will be recorded/attached)
  return data.textContent || (data.voiceEffect && data.voiceEffect !== "none");
}, {
  message: "An EkoDrop must have either text content or an audio recording with a selected effect.",
  path: ["textContent"], // Or path: ["voiceEffect"] if you want error on effect
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
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Int16Array;
  // Interleave channels if stereo, otherwise use mono
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  if (numChannels === 2) {
    result = interleave(channelData[0], channelData[1]);
  } else { // Mono or more (take first channel for simplicity if more than 2)
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
  const [initialAudioBlob, setInitialAudioBlob] = useState<Blob | null>(null); // Store the original recording
  const [processedAudioBlob, setProcessedAudioBlob] = useState<Blob | null>(null); // Store effect-applied audio
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // For <audio> preview src
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [selectedVoiceEffect, setSelectedVoiceEffect] = useState<VoiceEffect>("none");
  const [isProcessingEffect, setIsProcessingEffect] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            setMicrophoneError("Web Audio API is not supported. Voice effects will not work.");
        }
    }
    // No cleanup needed for AudioContext here as it's created once.
    // Specific OfflineAudioContexts are created and discarded per effect application.
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
        stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately after permission check
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
    if (!inputBlob || !audioContextRef.current) return inputBlob; // Return original if no context or blob

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
          source.playbackRate.value = 1.8; 
          source.connect(offlineCtx.destination);
          break;
        case "deep":
          source.playbackRate.value = 0.6; 
          source.connect(offlineCtx.destination);
          break;
        case "robot":
          source.playbackRate.value = 0.9; // Slightly slower, deeper
          const robotFilter = offlineCtx.createBiquadFilter();
          robotFilter.type = 'peaking';
          robotFilter.frequency.value = 1200; // Resonant frequency
          robotFilter.Q.value = 6;      // Narrow peak
          robotFilter.gain.value = 15;   // Boost the peak
          source.connect(robotFilter);
          robotFilter.connect(offlineCtx.destination);
          break;
        case "echo":
          const delayNode = offlineCtx.createDelay(1.0); // Max delay time 1s
          delayNode.delayTime.value = 0.25; // Actual delay of 250ms

          const feedbackNode = offlineCtx.createGain();
          feedbackNode.gain.value = 0.5; // Feedback gain (0 to 1)

          const dryGainNode = offlineCtx.createGain();
          dryGainNode.gain.value = 0.7; // Original signal volume

          const wetGainNode = offlineCtx.createGain();
          wetGainNode.gain.value = 0.3; // Echoed signal volume

          source.connect(dryGainNode);
          dryGainNode.connect(offlineCtx.destination);

          source.connect(delayNode);
          delayNode.connect(feedbackNode);
          feedbackNode.connect(delayNode); // Feedback loop
          
          delayNode.connect(wetGainNode);
          wetGainNode.connect(offlineCtx.destination);
          break;
        case "alien":
        case "monster":
        case "radio":
          // These remain simulated (passthrough) for now
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
      clearAudio(true); // Keep initial if baseBlob is null (e.g. only effect changed)
      return;
    }
    const PAblob = await applyVoiceEffect(baseBlob, effect);
    setProcessedAudioBlob(PAblob); // This is what gets uploaded
    
    if (audioUrl) URL.revokeObjectURL(audioUrl); 
    if (PAblob) {
        const newPreviewUrl = URL.createObjectURL(PAblob);
        setAudioUrl(newPreviewUrl); // Update preview URL
    } else {
        setAudioUrl(null);
    }
  }, [applyVoiceEffect, audioUrl]); // Added clearAudio, it was missing


  useEffect(() => {
    // Re-process audio if the effect changes and there's an initial recording
    if (initialAudioBlob) {
      processAndSetAudio(initialAudioBlob, selectedVoiceEffect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoiceEffect]); // Dependency: only selectedVoiceEffect. initialAudioBlob changing is handled by onstop.

  const startRecording = async () => {
    clearAudio(); // Clear previous recording and effects fully
    if (hasMicrophonePermission === null) {
      await getMicrophonePermission(); 
    }
    if (hasMicrophonePermission === false || !navigator.mediaDevices || !audioContextRef.current) { // Check AudioContext too
       const errorMsg = !audioContextRef.current ? "Web Audio API not available. Effects disabled." : microphoneError;
       toast({ variant: "destructive", title: "Microphone/Audio Init Error", description: errorMsg || "Microphone permission is not granted or media devices are not available."});
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
        mediaRecorderRef.current = new MediaRecorder(stream); // Fallback
      }
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const completeAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' }); 
        setInitialAudioBlob(completeAudioBlob); // Store the original
        await processAndSetAudio(completeAudioBlob, selectedVoiceEffect); // Process with current effect for initial preview
        stream.getTracks().forEach(track => track.stop()); // Stop media stream tracks
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
        console.error("Failed to start recording: ", err);
        const errorMsg = "Failed to start recording. Please ensure microphone is allowed and try again.";
        setMicrophoneError(errorMsg);
        toast({ variant: "destructive", title: "Recording Error", description: errorMsg});
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Processing and preview update is handled by onstop listener
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
        audioPreviewRef.current.src = ''; // Clear preview player
    }
    if (!keepInitial) {
        setSelectedVoiceEffect("none"); // Reset effect if clearing fully
        form.setValue("voiceEffect", "none");
    }
  };

  const uploadAudio = async (audioToUpload: Blob, userId: string): Promise<string> => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const audioFileName = `eko_${userId}_${timestamp}_${randomSuffix}.wav`; // Upload as WAV
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

    if (!values.textContent && !processedAudioBlob) { // Ensure there's content
        toast({
            title: "Empty EkoDrop",
            description: "Please add some text or record audio and apply an effect.",
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
        ...(values.voiceEffect && values.voiceEffect !== "none" && { appliedVoiceEffect: values.voiceEffect }), 
        ...(hashtags && hashtags.length > 0 && { hashtags }),
      };

      await addDoc(collection(firestore, "posts"), newPostData);

      toast({
        title: "EkoDrop Posted!",
        description: "Your voice is out there.",
      });
      clearAudio(); // Fully clear after successful post
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
          {audioUrl && processedAudioBlob && ( // Preview processed audio
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
                  disabled={hasMicrophonePermission === false || authLoading || !audioContextRef.current}
                >
                  <Mic className="mr-2 h-5 w-5" /> 
                  {hasMicrophonePermission === null ? "Enable Mic & Record" : "Record Audio"}
                </Button>
              )}
            </div>
          )}
        </div>

        {initialAudioBlob && !isRecording && ( // Show effect selector if initial recording exists and not currently recording
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
                    <SelectItem value="robot">Robot (Basic)</SelectItem>
                    <SelectItem value="echo">Echo (Basic)</SelectItem>
                    <SelectItem value="alien">Alien (Simulated)</SelectItem>
                    <SelectItem value="monster">Monster (Simulated)</SelectItem>
                    <SelectItem value="radio">Radio (Simulated)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Apply an effect to your voice. 
                  Chipmunk/Deep effects change pitch & speed. Robot/Echo are basic.
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
