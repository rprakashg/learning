import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanityClient } from "@/lib/sanity";
import { courseByIdQuery, type SanityCourse } from "@/lib/sanity-queries";
import { Navbar } from "@/components/layout/navbar";
import { EnrollButton } from "@/components/courses/enroll-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { BookOpen, Clock, Users, CheckCircle, Lock, PlayCircle } from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();

  const course = await sanityClient.fetch<SanityCourse | null>(
    courseByIdQuery,
    { id: courseId }
  );

  if (!course || !course.isPublished) notFound();

  const [enrollment, enrollmentCount] = await Promise.all([
    session
      ? db.enrollment.findUnique({
          where: { userId_sanityCourseId: { userId: session.user.id, sanityCourseId: courseId } },
        })
      : null,
    db.enrollment.count({ where: { sanityCourseId: courseId, status: "ACTIVE" } }),
  ]);

  const isEnrolled = enrollment?.status === "ACTIVE";
  const totalLessons = (course.modules ?? []).reduce(
    (sum, m) => sum + (m.lessons ?? []).length,
    0
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {course.category && (
              <Badge variant="default" className="mb-4">
                {course.category.name}
              </Badge>
            )}
            <h1 className="mb-4 text-4xl font-bold">{course.title}</h1>
            {course.description && (
              <p className="mb-6 text-lg text-gray-300">{course.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {(course.modules ?? []).length} modules · {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {enrollmentCount} students enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Updated {formatDate(new Date(course._updatedAt))}
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Created by{" "}
              <span className="font-medium text-white">
                {course.instructorName || "Instructor"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Course curriculum</h2>
            <div className="space-y-3">
              {(course.modules ?? []).map((module) => (
                <div key={module._key} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-5 py-3.5">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <span className="text-xs text-gray-400">
                      {(module.lessons ?? []).length} lesson{(module.lessons ?? []).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {(module.lessons ?? []).map((lesson) => (
                      <li key={lesson._key} className="flex items-center gap-3 px-5 py-3">
                        {lesson.isFree || isEnrolled ? (
                          <PlayCircle className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                        ) : (
                          <Lock className="h-4 w-4 flex-shrink-0 text-gray-300" />
                        )}
                        <span className={`text-sm ${isEnrolled || lesson.isFree ? "text-gray-800" : "text-gray-400"}`}>
                          {lesson.title}
                        </span>
                        {lesson.isFree && !isEnrolled && (
                          <Badge variant="success" className="ml-auto text-xs">Free preview</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 text-center">
                <p className="text-4xl font-extrabold text-gray-900">
                  {course.isFree || course.price === 0 ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    formatPrice(course.price)
                  )}
                </p>
                {!course.isFree && course.price > 0 && (
                  <p className="mt-1 text-xs text-gray-400">One-time payment · Lifetime access</p>
                )}
              </div>

              {isEnrolled ? (
                <a
                  href={`/student/courses/${courseId}`}
                  className="block w-full rounded-lg bg-emerald-600 py-3 text-center font-semibold text-white hover:bg-emerald-700"
                >
                  Go to course
                </a>
              ) : (
                <EnrollButton
                  courseId={courseId}
                  price={course.price}
                  isFree={course.isFree}
                  isAuthenticated={!!session}
                />
              )}

              <ul className="mt-6 space-y-2.5 text-sm text-gray-600">
                {[
                  `${totalLessons} lessons across ${(course.modules ?? []).length} modules`,
                  "Lifetime access",
                  "Certificate of completion",
                  "Progress tracking",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
