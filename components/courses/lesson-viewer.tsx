"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/courses/quiz-card";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  quiz: {
    id: string;
    title: string;
    questions: Array<{
      id: string;
      text: string;
      options: string;
      correctAnswer: string;
    }>;
  } | null;
}

interface LessonViewerProps {
  lesson: Lesson;
  courseId: string;
  isCompleted: boolean;
}

export function LessonViewer({ lesson, courseId, isCompleted }: LessonViewerProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);

  const markComplete = async () => {
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id, isCompleted: true }),
    });
    setCompleted(true);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
        {completed && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Completed
          </div>
        )}
      </div>

      {lesson.description && (
        <p className="mb-6 text-gray-500">{lesson.description}</p>
      )}

      {/* Video */}
      {lesson.videoUrl && (
        <div className="mb-6 overflow-hidden rounded-xl bg-black aspect-video">
          <iframe
            src={lesson.videoUrl}
            className="h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          />
        </div>
      )}

      {/* Content */}
      {lesson.content && (
        <div className="prose prose-indigo max-w-none mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {lesson.content}
          </div>
        </div>
      )}

      {/* Quiz */}
      {lesson.quiz && (
        <div className="mb-8">
          <QuizCard quiz={lesson.quiz} />
        </div>
      )}

      {!completed && (
        <Button onClick={markComplete} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Mark as complete
            </>
          )}
        </Button>
      )}
    </div>
  );
}
