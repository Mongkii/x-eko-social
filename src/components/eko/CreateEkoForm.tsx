
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
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming RadioGroup
import { useToast } from "@/hooks/use-toast";
import { firestore } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mic } from "lucide-react";
import type { EkoPost, PostVisibility } from "@/lib/types";

const formSchema = z.object({
  textContent: z.string().min(1, "EkoDrop cannot be empty.").max(280, "EkoDrop too long."),
  visibility: z.enum(["public", "followers-only", "private"]),
  // audioFile: z.any().optional(), // For future audio uploads
});

export function CreateEkoForm() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // const [isRecording, setIsRecording] = useState(false); // For future audio recording

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textContent: "",
      visibility: userProfile?.privacy.defaultPostVisibility || "public",
    },
  });
  
  // Update default visibility if userProfile loads after form init
  useState(() => {
    if (userProfile) {
      form.reset({
        textContent: "",
        visibility: userProfile.privacy.defaultPostVisibility || "public",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, form.reset]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
      toast({ title: "Error", description: "You must be logged in to post.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const newPostData: Omit<EkoPost, 'id' | 'createdAt'> & { createdAt: Timestamp } = {
        userId: user.uid,
        username: userProfile.username,
        userAvatarURL: userProfile.avatarURL || '',
        textContent: values.textContent,
        // audioURL: "", // Will be set after upload if audioFile exists
        visibility: values.visibility as PostVisibility,
        commentCount: 0,
        likeCount: 0,
        reEkoCount: 0,
        createdAt: serverTimestamp() as Timestamp, // Cast to Timestamp for type consistency before send
      };

      // if (values.audioFile) {
      //   // Handle audio file upload to Firebase Storage here
      //   // const audioURL = await uploadAudio(values.audioFile, user.uid);
      //   // newPostData.audioURL = audioURL;
      //   // Fetch duration, waveform etc.
      // }

      await addDoc(collection(firestore, "posts"), newPostData);

      toast({
        title: "EkoDrop Posted!",
        description: "Your voice is out there.",
      });
      router.push("/feed"); // Or to the user's profile
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

  // const handleRecordAudio = () => {
  //   setIsRecording(!isRecording);
  //   // Implement audio recording logic here
  // };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="textContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's on your mind?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your voice... (text for now)"
                  className="resize-none min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Future: Audio recording/upload UI */}
        {/* <div className="space-y-2">
          <FormLabel>Add Audio (Optional)</FormLabel>
          <Button type="button" variant="outline" onClick={handleRecordAudio} className="w-full flex items-center justify-center">
            <Mic className={`mr-2 h-5 w-5 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
            {isRecording ? "Stop Recording" : "Record Audio"}
          </Button>
          <Input type="file" accept="audio/*" {...form.register("audioFile")} />
        </div> */}


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
        
        <Button type="submit" className="w-full" disabled={isLoading || !user}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post EkoDrop
        </Button>
        {!user && <p className="text-sm text-center text-muted-foreground">Please log in to post.</p>}
      </form>
    </Form>
  );
}
