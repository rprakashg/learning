import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    redirect(`/courses/${courseId}`);
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              quiz: { include: { questions: true } },
              progress: { where: { userId: session.user.id } },
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const activeLesson =
    (activeLessonId && allLessons.find((l) => l.id === activeLessonId)) ||
    allLessons[0];

  const completedCount = allLessons.filter((l) =>
    l.progress.some((p) => p.isCompleted)
  ).length;
  const progressPct =
    allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0;

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

        {course.modules.map((module) => (
          <div key={module.id} className="mb-4">
            <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {module.title}
            </p>
            <ul className="space-y-0.5">
              {module.lessons.map((lesson) => {
                const isCompleted = lesson.progress.some((p) => p.isCompleted);
                const isActive = lesson.id === activeLesson?.id;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/student/courses/${courseId}?lessonId=${lesson.id}`}
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
        {activeLesson ? (
          <LessonViewer
            lesson={activeLesson}
            courseId={courseId}
            isCompleted={activeLesson.progress.some((p) => p.isCompleted)}
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
