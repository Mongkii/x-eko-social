
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading to true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
            console.warn("User document not found in Firestore for UID:", firebaseUser.uid, "- Profile may not exist or is not yet created.");
          }
        } catch (error) {
          console.error("AuthContext: Error fetching user profile from Firestore:", error);
          setUserProfile(null); // Ensure profile is null on error
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false); // Set loading to false after auth state determined and profile fetched/attempted
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Empty dependency array ensures this runs once on mount

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged, which will also clear userProfile
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show a toast message
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
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
