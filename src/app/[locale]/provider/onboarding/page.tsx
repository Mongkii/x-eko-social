
"use client";
import { useTranslations } from 'next-intl';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { sampleCategoriesData } from '@/lib/placeholder-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const onboardingSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  bio: z.string().min(50, { message: "Bio must be at least 50 characters." }).max(1000, { message: "Bio must not exceed 1000 characters." }),
  licenseNumber: z.string().min(1, { message: "License number is required." }),
  qualifications: z.string().min(1, { message: "Please list at least one qualification." }),
  serviceCategoryIds: z.array(z.string()).min(1, { message: "Please select at least one service category." }),
  languagesSpoken: z.string().min(2, { message: "Please list languages spoken." }),
  country: z.string().min(2, { message: "Country is required." }),
  city: z.string().min(2, { message: "City is required." }),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions." }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function ProviderOnboardingPage() {
  const t = useTranslations('ProviderOnboardingPage');
  const tGlobal = useTranslations('Global');
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      bio: "",
      licenseNumber: "",
      qualifications: "",
      serviceCategoryIds: [],
      languagesSpoken: "",
      country: "",
      city: "",
      agreeToTerms: false,
    },
  });

  async function onSubmit(data: OnboardingFormData) {
    // Simulate API call
    console.log("Provider application data:", data);
    toast({
      title: t('applicationSubmittedTitle'),
      description: t('applicationSubmittedDescription'),
    });
    form.reset(); 
    // In a real app, you would send this data to your backend:
    // e.g., await fetch('/api/providers/apply', { method: 'POST', body: JSON.stringify(data) });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container py-8 md:py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{t('pageTitle')}</CardTitle>
            <CardDescription>{t('formTitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fullNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dr. Aisha Legal Services LLC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@yourfirm.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bioLabel')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about your expertise and experience..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('licenseNumberLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., KSA-12345, NY-Bar-007" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('qualificationsLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="JD, LLM, Bar Member (Dubai)" {...field} />
                      </FormControl>
                       <FormDescription>Please provide a comma-separated list.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceCategoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('serviceCategoriesLabel')}</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {sampleCategoriesData.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="serviceCategoryIds"
                            render={({ field: categoryField }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                                  <FormControl>
                                    <Checkbox
                                      checked={categoryField.value?.includes(category.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? categoryField.onChange([...(categoryField.value || []), category.id])
                                          : categoryField.onChange(
                                              (categoryField.value || []).filter(
                                                (value) => value !== category.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {category.name_en} / {category.name_ar}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="languagesSpoken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('languagesSpokenLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="English, Arabic, French" {...field} />
                      </FormControl>
                      <FormDescription>Please provide a comma-separated list.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('countryLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Saudi Arabia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('cityLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Riyadh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the Ameenee Marketplace <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">terms and conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">privacy policy</a>.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? tGlobal('loading') : tGlobal('submit')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
