
'use server';

import { auth, firestore, storage } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { EkoPost, UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';


interface QuickPostResult {
  success: boolean;
  message: string;
  postId?: string;
}

export async function quickPostEkoDrop(audioFormData: FormData): Promise<QuickPostResult> {
  const user = auth.currentUser;
  // For server actions, auth.currentUser might not be populated reliably without middleware or session passing.
  // A more robust way in Server Actions is to get the UID from a session if available,
  // or ensure this action is only called from client components where auth.currentUser is populated from AuthContext.
  // For this prototype, we'll assume the client ensures user is authenticated before calling.
  // A proper implementation might involve verifying an ID token passed from the client.

  // A temporary workaround to get the user ID if auth.currentUser is null in server action context.
  // This is NOT a secure way for production. Usually, you'd use a session or verify an ID token.
  const headersList = headers();
  const firebaseToken = headersList.get('X-Firebase-ID-Token'); 
  let userId = user?.uid;

  // If auth.currentUser is not available, and we don't have a token mechanism, we can't proceed.
  // For the purpose of this prototype, we'll rely on the client to gate this call.
  // If you find `user` is null here, you need a robust auth check (e.g. verify ID token).

  if (!userId && !user?.uid) { // Fallback check
     if (user?.uid) userId = user.uid; // if it got populated somehow
     else return { success: false, message: 'User not authenticated. Cannot determine user ID in server action.' };
  }
  if (!userId) userId = user!.uid; // userId should be set if user object existed.


  const audioBlob = audioFormData.get('audioBlob') as Blob | null;

  if (!audioBlob) {
    return { success: false, message: 'No audio data received.' };
  }
  if (!userId) { // Should be caught above, but as a safeguard
      return { success: false, message: 'User ID is missing.'};
  }


  try {
    const userProfileRef = doc(firestore, 'users', userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (!userProfileSnap.exists()) {
      return { success: false, message: 'User profile not found.' };
    }
    const userProfileData = userProfileSnap.data() as UserProfile;

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const audioFileExtension = audioBlob.type.split('/')[1] || 'wav';
    const audioFileName = `quick_eko_${userId}_${timestamp}_${randomSuffix}.${audioFileExtension}`;
    const storageRefPath = `ekoPostsAudio/${userId}/${audioFileName}`;
    const audioStorageRef = ref(storage, storageRefPath);

    await uploadBytes(audioStorageRef, audioBlob, { contentType: audioBlob.type });
    const downloadURL = await getDownloadURL(audioStorageRef);

    const newPostData: Omit<EkoPost, 'id' | 'createdAt'> & { createdAt: Timestamp } = {
      userId: userId,
      username: userProfileData.username,
      userAvatarURL: userProfileData.avatarURL || `https://placehold.co/100x100.png?text=${userProfileData.username[0].toUpperCase()}`,
      audioURL: downloadURL,
      textContent: '', // Quick post has no text content
      visibility: userProfileData.privacy.defaultPostVisibility || 'public',
      commentCount: 0,
      likeCount: 0,
      reEkoCount: 0,
      createdAt: serverTimestamp() as Timestamp,
      // durationSeconds could be added if known
    };

    const docRef = await addDoc(collection(firestore, 'posts'), newPostData);
    
    revalidatePath('/feed');
    revalidatePath(`/profile/${userProfileData.username_lowercase}`);
    if (userProfileData.username_lowercase !== currentUser?.displayName?.toLowerCase()){
         revalidatePath(`/profile/${currentUser?.displayName?.toLowerCase()}`); // just in case username_lowercase is different from current display name
    }


    return { success: true, message: 'EkoDrop posted successfully!', postId: docRef.id };
  } catch (error) {
    console.error('Error in quickPostEkoDrop:', error);
    let message = 'Failed to post EkoDrop.';
    if (error instanceof Error) {
        message = error.message;
    }
    return { success: false, message };
  }
}
