
"use client";

import type { UserProfile } from '@/lib/types';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { firestore, storage } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image"; // Using next/image for optimized image display

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const profileFormSchema = z.object({
  username: z.string().min(3, "Username too short").max(30, "Username too long").optional(), // Make username optional for now
  bio: z.string().max(160, "Bio cannot exceed 160 characters.").optional(),
  avatar: z
    .custom<File | undefined>()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ).optional(),
  coverImage: z
    .custom<File | undefined>()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  userProfile: UserProfile;
}

export function EditProfileForm({ userProfile }: EditProfileFormProps) {
  const { toast } = useToast();
  const { user, refreshUserProfile } = useAuth(); // refreshUserProfile might be needed from useAuth context
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile.avatarURL || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(userProfile.coverImageURL || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: userProfile.username || "",
      bio: userProfile.bio || "",
      avatar: undefined,
      coverImage: undefined,
    },
  });

  useEffect(() => {
    // Revoke object URLs on component unmount to prevent memory leaks
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      if (coverPreview && coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    };
  }, [avatarPreview, coverPreview]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    fieldName: keyof ProfileFormValues
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const currentPreview = fieldName === 'avatar' ? avatarPreview : coverPreview;
      if (currentPreview && currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
      setter(URL.createObjectURL(file));
      form.setValue(fieldName, file as any); // react-hook-form might need 'as any' for File
    } else {
      // If file is removed, reset to original or null
      setter(fieldName === 'avatar' ? userProfile.avatarURL || null : userProfile.coverImageURL || null);
      form.setValue(fieldName, undefined);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    // To overwrite, we can just upload. If we want to delete old one if filename changes, more logic needed.
    // For simplicity, avatar.png or cover.png will overwrite.
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user || user.uid !== userProfile.id) {
      toast({ title: "Unauthorized", description: "You cannot edit this profile.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const updateData: Partial<UserProfile> & { updatedAt: any } = {
        updatedAt: serverTimestamp(),
      };

      if (data.bio !== userProfile.bio) {
        updateData.bio = data.bio || "";
      }
      // Username changes require more complex handling (e.g. uniqueness checks, URL updates),
      // So, for now, we are not allowing username change via this form.
      // if (data.username && data.username !== userProfile.username) {
      //   updateData.username = data.username;
      //   updateData.username_lowercase = data.username.toLowerCase();
      // }


      if (data.avatar) {
        const avatarPath = `userAvatars/${user.uid}/avatar.${data.avatar.name.split('.').pop()}`;
        updateData.avatarURL = await uploadImage(data.avatar, avatarPath);
      }

      if (data.coverImage) {
        const coverPath = `userCoverImages/${user.uid}/cover.${data.coverImage.name.split('.').pop()}`;
        updateData.coverImageURL = await uploadImage(data.coverImage, coverPath);
      }
      
      if (Object.keys(updateData).length > 1) { // Check if anything more than just updatedAt changed
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, updateData);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Trigger a refresh of userProfile in AuthContext if such a function exists
      if (typeof refreshUserProfile === 'function') {
        await refreshUserProfile();
      }
      router.push(`/profile/${userProfile.username_lowercase}`); // Redirect to profile page
      router.refresh(); // Ensure server components also re-render
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your unique username" {...field} disabled />
              </FormControl>
              <FormDescription>Username cannot be changed at the moment.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Photo (Avatar)</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-4">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full object-cover border"
                      data-ai-hint="user avatar"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <UploadCloud className="h-10 w-10" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setAvatarPreview, 'avatar')}
                    className="flex-1"
                  />
                </div>
              </FormControl>
              <FormDescription>Recommended: Square image, less than 5MB. (JPG, PNG, GIF, WEBP)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image (Header)</FormLabel>
              <FormControl>
                 <div className="space-y-2">
                  {coverPreview ? (
                    <Image
                      src={coverPreview}
                      alt="Cover image preview"
                      width={500}
                      height={200} // Adjust aspect ratio as needed
                      className="w-full aspect-[16/6] rounded-md object-cover border"
                      data-ai-hint="profile header background"
                    />
                  ) : (
                    <div className="w-full aspect-[16/6] rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                       <UploadCloud className="h-10 w-10" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setCoverPreview, 'coverImage')}
                  />
                </div>
              </FormControl>
              <FormDescription>Recommended: Landscape image (e.g., 1500x500px), less than 5MB.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}
