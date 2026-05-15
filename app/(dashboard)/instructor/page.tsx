import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, DollarSign, PlusCircle, Eye, EyeOff } from "lucide-react";

export default async function InstructorDashboard() {
  const session = await auth();
  if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      _count: { select: { enrollments: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalRevenue = await db.enrollment.aggregate({
    where: {
      course: { instructorId: session.user.id },
      status: "ACTIVE",
    },
    _count: true,
  });

  const publishedCount = courses.filter((c) => c.isPublished).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your courses and track performance</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button>
            <PlusCircle className="h-4 w-4" />
            New course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total courses", value: courses.length, sub: `${publishedCount} published`, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total students", value: totalStudents, sub: "across all courses", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active enrollments", value: totalRevenue._count, sub: "paid & free", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course list */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Your courses</h2>
      {courses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-500">No courses yet</p>
          <Link href="/instructor/courses/new">
            <Button className="mt-4">Create your first course</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-left font-medium text-gray-500">Course</th>
                <th className="px-5 py-3.5 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3.5 text-left font-medium text-gray-500">Price</th>
                <th className="px-5 py-3.5 text-left font-medium text-gray-500">Students</th>
                <th className="px-5 py-3.5 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                    {course.category && (
                      <p className="text-xs text-gray-400">{course.category.name}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {course.isPublished ? (
                      <Badge variant="success" className="gap-1">
                        <Eye className="h-3 w-3" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" /> Draft
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {course.isFree || course.price === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      formatPrice(course.price)
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-700">{course._count.enrollments}</td>
                  <td className="px-5 py-4">
                    <Link href={`/instructor/courses/${course.id}`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
