
'use server';

import { firestore, storage } from '@/lib/firebase'; // Removed auth import as it's not reliably used here
import { addDoc, collection, doc, getDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { EkoPost, UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';
// import { headers } from 'next/headers'; // headers can be removed if not used for auth token

interface QuickPostResult {
  success: boolean;
  message: string;
  postId?: string;
}

export async function quickPostEkoDrop(audioFormData: FormData): Promise<QuickPostResult> {
  const audioBlob = audioFormData.get('audioBlob') as Blob | null;
  const userId = audioFormData.get('userId') as string | null; // Retrieve userId from FormData

  if (!userId) {
    return { success: false, message: 'User ID not provided.' };
  }

  if (!audioBlob) {
    return { success: false, message: 'No audio data received.' };
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
    // Determine file extension from blob type, default to webm if not specific enough
    let audioFileExtension = audioBlob.type.split('/')[1] || 'webm';
    if (audioFileExtension === 'opus' && audioBlob.type.startsWith('audio/webm')) {
        audioFileExtension = 'webm'; // common case for opus in webm
    } else if (audioFileExtension === 'opus' && audioBlob.type.startsWith('audio/ogg')) {
        audioFileExtension = 'ogg'; // common case for opus in ogg
    }


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
      textContent: '', 
      visibility: userProfileData.privacy.defaultPostVisibility || 'public',
      commentCount: 0,
      likeCount: 0,
      reEkoCount: 0,
      createdAt: serverTimestamp() as Timestamp,
      // durationSeconds: 0, // Placeholder, ideally extract from blob if possible/needed
    };

    const docRef = await addDoc(collection(firestore, 'posts'), newPostData);
    
    revalidatePath('/feed');
    revalidatePath(`/profile/${userProfileData.username_lowercase}`);

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
