import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BookOpen, GraduationCap, Trophy } from "lucide-react";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") redirect("/");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  progress: {
                    where: { userId: session.user.id },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enrollmentsWithProgress = enrollments.map((e) => {
    const lessons = e.course.modules.flatMap((m) => m.lessons);
    const total = lessons.length;
    const completed = lessons.filter((l) => l.progress.some((p) => p.isCompleted)).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...e, progress: { total, completed, pct } };
  });

  const completed = enrollmentsWithProgress.filter((e) => e.progress.pct === 100);
  const inProgress = enrollmentsWithProgress.filter((e) => e.progress.pct < 100);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name?.split(" ")[0] || "Learner"}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here's your learning overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Enrolled courses", value: enrollments.length, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "In progress", value: inProgress.length, icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Completed", value: completed.length, icon: Trophy, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* In-progress courses */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Continue learning</h2>
      {inProgress.length === 0 ? (
        <div className="mb-8 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No courses in progress.</p>
          <Link href="/courses" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {inProgress.map((e) => (
            <Link key={e.id} href={`/student/courses/${e.courseId}`}>
              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-indigo-200">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{e.course.title}</h3>
                  <Badge variant="warning">{e.progress.pct}%</Badge>
                </div>
                <Progress value={e.progress.pct} className="mb-2" />
                <p className="text-xs text-gray-400">
                  {e.progress.completed} / {e.progress.total} lessons completed
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Completed courses */}
      {completed.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Completed courses</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {completed.map((e) => (
              <div key={e.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-emerald-200">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{e.course.title}</h3>
                  <Badge variant="success">Completed</Badge>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Enrolled {formatDate(e.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {enrollments.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-500">You&apos;re not enrolled in any courses yet.</p>
          <Link href="/courses" className="mt-3 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Browse courses
          </Link>
        </div>
      )}
    </div>
  );
}
