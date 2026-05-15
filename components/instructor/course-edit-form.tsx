"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Loader2, Save, Eye, EyeOff, Trash2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().min(0),
  isFree: z.boolean(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface CourseEditFormProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    isFree: boolean;
    isPublished: boolean;
    categoryId: string | null;
    imageUrl: string | null;
  };
  categories: Array<{ id: string; name: string }>;
}

export function CourseEditForm({ course, categories }: CourseEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: course.title,
      description: course.description || "",
      price: course.price,
      isFree: course.isFree,
      categoryId: course.categoryId || "",
      imageUrl: course.imageUrl || "",
    },
  });

  const isFree = watch("isFree");

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(false);
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        categoryId: data.categoryId || null,
        imageUrl: data.imageUrl || null,
      }),
    });

    if (!res.ok) {
      setError("Failed to save changes");
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  const togglePublish = async () => {
    setPublishing(true);
    await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    setPublishing(false);
    router.refresh();
  };

  const deleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    router.push("/instructor");
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">Course details</h2>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Saved successfully!</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input {...register("title")} />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea rows={4} {...register("description")} placeholder="What will students learn?" />
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select {...register("categoryId")}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Image URL</Label>
          <Input {...register("imageUrl")} placeholder="https://..." />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" {...register("isFree")} className="h-4 w-4 rounded accent-indigo-600" />
            Free course
          </label>
        </div>

        {!isFree && (
          <div className="space-y-1.5">
            <Label>Price (USD)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("price", { valueAsNumber: true })}
            />
          </div>
        )}

        <Button type="submit" disabled={isSubmitting || !isDirty} className="w-full">
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save changes</>}
        </Button>
      </form>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={togglePublish}
          disabled={publishing}
        >
          {publishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : course.isPublished ? (
            <><EyeOff className="h-4 w-4" /> Unpublish</>
          ) : (
            <><Eye className="h-4 w-4" /> Publish</>
          )}
        </Button>
        <Button
          variant="destructive"
          onClick={deleteCourse}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
