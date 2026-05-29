import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanityClient } from "@/lib/sanity";
import { courseByIdQuery, type SanityCourse, type SanityLesson } from "@/lib/sanity-queries";
import { LessonViewer } from "@/components/courses/lesson-viewer";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Lock } from "lucide-react";
import Link from "next/link";

export default async function StudentCourseViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lessonId?: string; success?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { courseId } = await params;
  const { lessonId: activeLessonId } = await searchParams;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_sanityCourseId: { userId: session.user.id, sanityCourseId: courseId } },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    redirect(`/courses/${courseId}`);
  }

  const course = await sanityClient.fetch<SanityCourse | null>(
    courseByIdQuery,
    { id: courseId }
  );
  if (!course) notFound();

  const allLessons = (course.modules ?? []).flatMap((m) => m.lessons ?? []);
  const lessonKeys = allLessons.map((l) => l._key);

  const progressRecords = lessonKeys.length
    ? await db.lessonProgress.findMany({
        where: { userId: session.user.id, lessonSanityId: { in: lessonKeys } },
      })
    : [];
  const completedKeys = new Set(
    progressRecords.filter((p) => p.isCompleted).map((p) => p.lessonSanityId)
  );

  const activeLesson: SanityLesson | undefined =
    (activeLessonId && allLessons.find((l) => l._key === activeLessonId)) ||
    allLessons[0];

  const completedCount = lessonKeys.filter((k) => completedKeys.has(k)).length;
  const progressPct =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // Normalise the active lesson into the shape LessonViewer expects.
  // id = _key, options stay as string[], quiz.id = lesson _key (1:1)
  const normalisedLesson = activeLesson
    ? {
        id: activeLesson._key,
        title: activeLesson.title,
        description: activeLesson.description ?? null,
        content: activeLesson.content ?? null,
        videoUrl: activeLesson.videoUrl ?? null,
        quiz: activeLesson.quiz
          ? {
              id: activeLesson._key,
              title: activeLesson.quiz.title,
              questions: (activeLesson.quiz.questions ?? []).map((q) => ({
                id: q._key,
                text: q.text,
                options: q.options,
                correctAnswer: q.correctAnswer,
              })),
            }
          : null,
      }
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-8">
      {/* Sidebar curriculum */}
      <aside className="w-72 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 line-clamp-2">{course.title}</h2>
          <div className="mt-2">
            <Progress value={progressPct} />
            <p className="mt-1 text-xs text-gray-400">
              {completedCount}/{allLessons.length} completed ({progressPct}%)
            </p>
          </div>
        </div>

        {(course.modules ?? []).map((module) => (
          <div key={module._key} className="mb-4">
            <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {module.title}
            </p>
            <ul className="space-y-0.5">
              {(module.lessons ?? []).map((lesson) => {
                const isCompleted = completedKeys.has(lesson._key);
                const isActive = lesson._key === activeLesson?._key;
                return (
                  <li key={lesson._key}>
                    <Link
                      href={`/student/courses/${courseId}?lessonId=${lesson._key}`}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-50 font-medium text-indigo-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      ) : isActive ? (
                        <Circle className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                      ) : (
                        <Lock className="h-4 w-4 flex-shrink-0 text-gray-300" />
                      )}
                      <span className="line-clamp-2">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      {/* Lesson content */}
      <div className="flex-1 overflow-y-auto">
        {normalisedLesson ? (
          <LessonViewer
            lesson={normalisedLesson}
            courseId={courseId}
            isCompleted={completedKeys.has(activeLesson!._key)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>Select a lesson to start learning</p>
          </div>
        )}
      </div>
    </div>
  );
}
