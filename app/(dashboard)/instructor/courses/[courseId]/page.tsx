import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseEditForm } from "@/components/instructor/course-edit-form";
import { ModuleManager } from "@/components/instructor/module-manager";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function InstructorCourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const [course, categories] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: { orderBy: { position: "asc" } },
          },
        },
        category: true,
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!course) notFound();
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor");
  }

  const completionFields = [
    course.title,
    course.description,
    course.categoryId,
    course.modules.length > 0,
  ];
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/instructor" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        <div className="flex items-center gap-3">
          {course.isPublished ? (
            <Badge variant="success" className="gap-1">
              <Eye className="h-3 w-3" /> Published
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <EyeOff className="h-3 w-3" /> Draft
            </Badge>
          )}
          <span className="text-xs text-gray-400">
            Profile {completionPct}% complete
          </span>
        </div>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">{course.title}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <CourseEditForm course={course} categories={categories} />
        <ModuleManager courseId={courseId} modules={course.modules} />
      </div>
    </div>
  );
}
