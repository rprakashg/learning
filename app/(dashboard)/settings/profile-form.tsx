"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
});

type FormData = z.infer<typeof schema>;

interface ProfileFormProps {
  user: { name?: string | null; email: string; bio?: string | null };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? "",
      bio: user.bio ?? "",
    },
  });

  async function onSubmit(data: FormData) {
    setStatus("idle");
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setStatus("success");
      setMessage("Profile updated successfully.");
    } else {
      const json = await res.json().catch(() => ({}));
      setStatus("error");
      setMessage(json.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-base font-semibold text-gray-900">Profile</h2>
      <p className="mt-1 text-sm text-gray-500">Update your name and bio.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled className="mt-1 bg-gray-50" />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} className="mt-1" />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={3}
            placeholder="Tell us a little about yourself..."
            {...register("bio")}
            className="mt-1"
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p>
          )}
        </div>

        {status === "success" && (
          <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {message}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
