
"use client";
import Link from 'next/link'; // Standard Link
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { sampleCategoriesData } from '@/lib/placeholder-data'; // Assuming this is now Ameenee data
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const onboardingSchema = z.object({
  fullName: z.string().min(3, { message: "الاسم الكامل يجب أن لا يقل عن 3 أحرف." }),
  email: z.string().email({ message: "عنوان بريد إلكتروني غير صالح." }),
  bio: z.string().min(50, { message: "السيرة الذاتية يجب أن لا تقل عن 50 حرفًا." }).max(1000, { message: "السيرة الذاتية يجب أن لا تتجاوز 1000 حرف." }),
  licenseNumber: z.string().min(1, { message: "رقم الترخيص مطلوب." }),
  qualifications: z.string().min(1, { message: "يرجى إدراج مؤهل واحد على الأقل." }),
  serviceCategoryIds: z.array(z.string()).min(1, { message: "يرجى اختيار فئة خدمة واحدة على الأقل." }),
  languagesSpoken: z.string().min(2, { message: "يرجى إدراج اللغات التي تتحدثها." }),
  country: z.string().min(2, { message: "الدولة مطلوبة." }),
  city: z.string().min(2, { message: "المدينة مطلوبة." }),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "يجب الموافقة على الشروط والأحكام." }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function ProviderOnboardingPage() {
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
    console.log("بيانات طلب مقدم الخدمة:", data);
    toast({
      title: "تم إرسال الطلب بنجاح!",
      description: "شكراً لتقديم طلبك للانضمام. سيقوم فريقنا بمراجعة طلبك والتواصل معك.",
    });
    form.reset(); 
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader onPersonalizeFeed={() => {}} />
      <main className="flex-grow container py-8 md:py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">انضم كمقدم خدمة في إيكو</CardTitle>
            <CardDescription>نموذج طلب مقدم الخدمة</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل / اسم الشركة</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: شركة إيكو للحلول الصوتية" {...field} />
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
                      <FormLabel>البريد الإلكتروني للتواصل</FormLabel>
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
                      <FormLabel>السيرة الذاتية / نبذة عن الشركة</FormLabel>
                      <FormControl>
                        <Textarea placeholder="أخبرنا عن خبرتك وتخصصك..." className="min-h-[100px]" {...field} />
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
                      <FormLabel>رقم الترخيص وجهة الإصدار</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: KSA-12345" {...field} />
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
                      <FormLabel>المؤهلات الرئيسية</FormLabel>
                      <FormControl>
                        <Input placeholder="ماجستير في تكنولوجيا الصوت، شهادة معتمدة..." {...field} />
                      </FormControl>
                       <FormDescription>يرجى تقديم قائمة مفصولة بفواصل.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceCategoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فئات الخدمة التي تقدمها</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {sampleCategoriesData.map((category) => ( // Assuming sampleCategoriesData is relevant
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
                                    {category.name_ar} {/* Assuming Arabic only */}
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
                      <FormLabel>اللغات التي تتحدثها</FormLabel>
                      <FormControl>
                        <Input placeholder="العربية، الإنجليزية..." {...field} />
                      </FormControl>
                      <FormDescription>يرجى تقديم قائمة مفصولة بفواصل.</FormDescription>
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
                        <FormLabel>الدولة</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: المملكة العربية السعودية" {...field} />
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
                        <FormLabel>المدينة</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: الرياض" {...field} />
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
                          أوافق على <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">شروط وأحكام</Link> إيكو و <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">سياسة الخصوصية</Link>.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
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
