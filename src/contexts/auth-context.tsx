
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetUserProfile = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          // User exists in Firebase Auth, but not in Firestore (e.g., first OAuth login)
          // Or if email/password signup failed to create profile for some reason.
          console.log("User profile not found in Firestore for UID:", firebaseUser.uid, ". Attempting to create one.");
          
          const emailUsernamePart = firebaseUser.email ? firebaseUser.email.split('@')[0] : '';
          const generatedUsername = `user${firebaseUser.uid.substring(0, 5)}`;
          const username = firebaseUser.displayName || emailUsernamePart || generatedUsername;

          const newUserProfileData: UserProfile = {
            id: firebaseUser.uid,
            username: username,
            username_lowercase: username.toLowerCase(),
            email: firebaseUser.email || "", // Ensure email is not null
            avatarURL: firebaseUser.photoURL || `https://placehold.co/150x150.png?text=${username[0]?.toUpperCase() || 'U'}`,
            bio: "",
            privacy: { profile: "public", defaultPostVisibility: "public" },
            language: "en",
            followersCount: 0,
            followingCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserProfileData);
          setUserProfile(newUserProfileData);
          console.log("Created new user profile for UID:", firebaseUser.uid);
        }
      } catch (error) {
        console.error("AuthContext: Error fetching/creating user profile:", error);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, []);


  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser); // Set Firebase user state immediately
      await fetchAndSetUserProfile(firebaseUser); // Then fetch/create profile
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchAndSetUserProfile]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // setUser(null) and setUserProfile(null) will be handled by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchAndSetUserProfile(user);
      setLoading(false);
    }
  }, [user, fetchAndSetUserProfile]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
