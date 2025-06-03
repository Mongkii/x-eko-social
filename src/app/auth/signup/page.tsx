
"use client"; // Added "use client" as it uses process.env client-side

import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogoIcon } from "@/components/icons/app-logo-icon";
import Link from "next/link";
import { OAuthButtonGroup } from "@/components/auth/OAuthButtonGroup";
import { Separator } from "@/components/ui/separator"; // For consistency, if needed

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <AppLogoIcon className="mx-auto h-16 w-16 text-accent mb-4" />
          <CardTitle className="text-3xl font-bold">Join Eko Today</CardTitle>
          <CardDescription>Create your account and let your voice be heard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignupForm />

          {(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true' ||
            process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === 'true' ||
            process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === 'true' ||
            process.env.NEXT_PUBLIC_TWITTER_AUTH_ENABLED === 'true') && (
            <>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign up with
                  </span>
                </div>
              </div>
              <OAuthButtonGroup />
            </>
          )}
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
