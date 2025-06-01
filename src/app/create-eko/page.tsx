
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { CreateEkoForm } from "@/components/eko/CreateEkoForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";

export default function CreateEkoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center pb-24"> {/* Added pb-24 for player */}
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <Mic className="mx-auto h-12 w-12 text-accent mb-4" />
            <CardTitle className="text-3xl font-bold">Create New EkoDrop</CardTitle>
            <CardDescription>Share your voice with the world.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEkoForm />
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
