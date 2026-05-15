"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, PlayCircle, Lock, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  isFree: boolean;
}

interface LessonManagerProps {
  courseId: string;
  moduleId: string;
  lessons: Lesson[];
}

export function LessonManager({ courseId, moduleId, lessons }: LessonManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    isFree: false,
  });

  const addLesson = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ title: "", description: "", content: "", videoUrl: "", isFree: false });
    setShowForm(false);
    setSaving(false);
    router.refresh();
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  return (
    <div>
      {lessons.length > 0 && (
        <ul className="mb-3 space-y-1">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                {lesson.isFree ? (
                  <PlayCircle className="h-3.5 w-3.5 text-indigo-500" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-gray-300" />
                )}
                <span className="text-sm text-gray-700">{lesson.title}</span>
                {lesson.isFree && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    Preview
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteLesson(lesson.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        size="sm"
        variant="ghost"
        className="w-full justify-start text-xs text-gray-500"
        onClick={() => setShowForm((v) => !v)}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Add lesson
        {showForm ? <ChevronDown className="ml-auto h-3.5 w-3.5" /> : <ChevronRight className="ml-auto h-3.5 w-3.5" />}
      </Button>

      {showForm && (
        <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              className="text-sm"
              placeholder="Lesson title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Content (Markdown supported)</Label>
            <Textarea
              className="text-sm"
              rows={3}
              placeholder="Lesson content..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Video URL (optional)</Label>
            <Input
              className="text-sm"
              placeholder="https://www.youtube.com/embed/..."
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))}
              className="h-3.5 w-3.5 rounded accent-indigo-600"
            />
            Free preview
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={addLesson} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add lesson"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
