
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { auth, firestore } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider, // For Apple
  signInWithPopup,
  type UserCredential,
  type AuthProvider as FirebaseAuthProvider,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Github, AlertTriangle } from "lucide-react"; // Github might be a placeholder if specific icons are missing
import type { UserProfile } from "@/lib/types";

// Inline SVGs for Google and Apple as lucide-react doesn't have them
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const AppleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.202 12.304c.004-2.344-1.584-3.978-4.024-3.996-2.224-.015-3.785 1.34-4.776 2.692-.174.248-.63 1.674.156 2.978.752 1.248 2.04 2.68 3.548 2.68.28 0 .5-.004.684-.012.048-.003.116-.008.204-.012.12-.008.276-.02.48-.044.72-.075 1.324-.304 1.892-.736.032-.024.06-.05.088-.076.072-.068.136-.14.196-.216.14-.184.204-.316.204-.384.004-.124-.072-.284-.228-.448-.124-.135-.784-.692-1.036-.884-.248-.188-.544-.38-.544-.864.004-.436.34-.744.78-.932.112-.048.616-.284 1.216-.5.336-.124.648-.24.936-.356.392-.16.708-.344.708-.344s.144.084.292.26c.08.09.148.188.204.292.164.304.364.972.108 1.712-.152.428-.48.9-.924 1.32-.424.408-.964.808-1.656 1.072-.68.26-1.22.384-1.588.384-1.092 0-2.156-.664-2.836-1.576-.888-1.184-1.424-2.708-1.172-3.956.464-2.276 2.588-3.644 4.628-3.656 1.068 0 2.06.364 2.784 1.024.188.168.36.36.524.564.04.048.084.1.128.152.6.664.916 1.404.916 2.364zM15.002 5.61c.908-.97 1.588-2.248 1.484-3.612-.97.088-2.184.68-3.06 1.628-.8.84-1.572 2.232-1.436 3.516.924.244 2.104-.636 3.012-1.532z"/>
  </svg>
);

// Using Lucide's existing Twitter icon for X, and Facebook icon
import { Twitter as XIcon, Facebook } from 'lucide-react';


export function OAuthButtonGroup() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null); // provider name or null

  const handleOAuthSignIn = async (providerName: 'google' | 'facebook' | 'apple' | 'twitter') => {
    setIsLoading(providerName);
    let authProvider: FirebaseAuthProvider;

    switch (providerName) {
      case 'google':
        authProvider = new GoogleAuthProvider();
        break;
      case 'facebook':
        authProvider = new FacebookAuthProvider();
        break;
      case 'apple':
        authProvider = new OAuthProvider('apple.com');
        authProvider.addScope('email');
        authProvider.addScope('name');
        break;
      case 'twitter':
        authProvider = new TwitterAuthProvider();
        break;
      default:
        toast({ title: "Error", description: "Invalid OAuth provider.", variant: "destructive" });
        setIsLoading(null);
        return;
    }

    try {
      const result: UserCredential = await signInWithPopup(auth, authProvider);
      const user = result.user;

      // Check if user profile exists in Firestore, if not, create it
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const usernameFromEmail = user.email ? user.email.split('@')[0] : `user${user.uid.substring(0,5)}`;
        const displayName = user.displayName || usernameFromEmail;
        
        const newUserProfile: UserProfile = {
          id: user.uid,
          username: displayName,
          username_lowercase: displayName.toLowerCase(),
          email: user.email || "", // Email might be null from some providers (e.g. Twitter if not verified)
          avatarURL: user.photoURL || `https://placehold.co/150x150.png?text=${displayName[0]?.toUpperCase() || 'U'}`,
          bio: "",
          privacy: { profile: "public", defaultPostVisibility: "public" },
          language: "en", // default language
          followersCount: 0,
          followingCount: 0,
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserProfile);
        toast({ title: "Welcome!", description: "Your profile has been created." });
      } else {
        toast({ title: "Login Successful", description: `Welcome back, ${user.displayName || user.email}!` });
      }
      
      router.push("/"); // Redirect to homepage or feed
      router.refresh();
    } catch (error: any) {
      console.error(`OAuth Sign-in Error (${providerName}):`, error);
      let errorMessage = `Failed to sign in with ${providerName}.`;
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = `An account already exists with the same email address but different sign-in credentials. Try signing in with the original method.`;
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = `Sign-in process was cancelled.`;
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = `Sign-in process was cancelled.`;
      }
      toast({
        title: `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Sign-In Failed`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const providers = [
    { name: 'google', label: 'Google', icon: <GoogleIcon />, enabled: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true' },
    { name: 'facebook', label: 'Facebook', icon: <Facebook className="mr-2 h-4 w-4" />, enabled: process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === 'true' },
    { name: 'apple', label: 'Apple', icon: <AppleIcon />, enabled: process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === 'true' },
    { name: 'twitter', label: 'X (Twitter)', icon: <XIcon className="mr-2 h-4 w-4" />, enabled: process.env.NEXT_PUBLIC_TWITTER_AUTH_ENABLED === 'true' },
  ] as const;

  const enabledProviders = providers.filter(p => p.enabled);

  if (enabledProviders.length === 0) {
    return null; // Don't render anything if no providers are enabled
  }

  return (
    <div className="space-y-3">
      {enabledProviders.map((provider) => (
        <Button
          key={provider.name}
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn(provider.name)}
          disabled={!!isLoading}
        >
          {isLoading === provider.name ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            provider.icon
          )}
          Continue with {provider.label}
        </Button>
      ))}
    </div>
  );
}
