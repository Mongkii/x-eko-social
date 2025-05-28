
"use client";

import { useState, useEffect } from 'react';
import type { MarketplaceCategory } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

const categorySchema = z.object({
  id: z.string().optional(),
  name_en: z.string().min(3, { message: "English name must be at least 3 characters." }),
  name_ar: z.string().min(3, { message: "Arabic name must be at least 3 characters." }),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  is_active: z.boolean().default(true),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const t = useTranslations('AdminCategoriesPage');
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MarketplaceCategory | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_en: "",
      name_ar: "",
      description_en: "",
      description_ar: "",
      is_active: true,
      imageUrl: "",
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({ title: t('fetchErrorTitle', {defaultValue: "Error"}), description: t('fetchErrorDescription', {defaultValue: "Could not fetch categories."}), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, [t]);

  const handleDialogOpen = (category: MarketplaceCategory | null = null) => {
    setEditingCategory(category);
    if (category) {
      form.reset(category);
    } else {
      form.reset({
        name_en: "", name_ar: "", description_en: "", description_ar: "", 
        is_active: true, imageUrl: ""
      });
    }
    setIsDialogOpen(true);
  };

  async function onSubmit(data: CategoryFormData) {
    const method = editingCategory ? 'PUT' : 'POST';
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(editingCategory ? 'Failed to update category' : 'Failed to create category');
      const result = await response.json();
      
      toast({ title: t('categorySavedSuccess') });
      setIsDialogOpen(false);
      // Refresh categories list
      const refreshResponse = await fetch('/api/admin/categories');
      const refreshedData = await refreshResponse.json();
      setCategories(refreshedData);

    } catch (error) {
      console.error("Error saving category:", error);
      toast({ title: t('categorySaveError'), variant: "destructive" });
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm(t('categoryDeleteConfirmText'))) return;
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete category');
      toast({ title: t('categoryDeletedSuccess') });
      setCategories(prev => prev.filter(cat => cat.id !== categoryId)); // Optimistic update or re-fetch
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ title: t('categoryDeleteError'), variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">{tGlobal('loading')}</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('pageTitle')}</CardTitle>
            <CardDescription>{t('description', {defaultValue: "Manage service categories for the marketplace."})}</CardDescription>
          </div>
          <Button onClick={() => handleDialogOpen()} size="sm">
            <PlusCircle className="rtl:ml-2 ltr:mr-2 h-4 w-4" /> {t('addNewCategory')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('categoryNameEnLabel')}</TableHead>
              <TableHead>{t('categoryNameArLabel')}</TableHead>
              <TableHead className="text-center">{t('categoryIsActiveLabel')}</TableHead>
              <TableHead className="text-right">{t('actions', {defaultValue: "Actions"})}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name_en}</TableCell>
                <TableCell>{category.name_ar}</TableCell>
                <TableCell className="text-center">
                  {category.is_active ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <EyeOff className="h-5 w-5 text-red-500 mx-auto" />}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDialogOpen(category)} className="rtl:ml-2 ltr:mr-2">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {categories.length === 0 && <p className="text-center text-muted-foreground py-4">{t('noCategoriesFound', {defaultValue: "No categories found."})}</p>}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? t('editCategory') : t('addNewCategory')}</DialogTitle>
            <DialogDescription>
              {editingCategory ? t('editCategoryDescription', {defaultValue: "Update the details of this category."}) : t('addNewCategoryDescription', {defaultValue: "Fill in the details for the new category."})}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('categoryNameEnLabel')}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('categoryNameArLabel')}</FormLabel>
                      <FormControl><Input dir="rtl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('categoryDescriptionEnLabel')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('categoryDescriptionArLabel')}</FormLabel>
                    <FormControl><Input dir="rtl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('categoryImageUrlLabel')}</FormLabel>
                    <FormControl><Input type="url" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 rtl:space-x-reverse space-y-0 rounded-md border p-3 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal mb-0!">{t('categoryIsActiveLabel')}</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{tGlobal('cancel')}</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? tGlobal('saving', {defaultValue: "Saving..."}) : tGlobal('save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
