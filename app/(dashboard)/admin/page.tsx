import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [userCount, courseCount, enrollmentCount, recentUsers, recentCourses] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.count({ where: { status: "ACTIVE" } }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        instructor: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform-wide overview</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total users", value: userCount, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total courses", value: courseCount, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active enrollments", value: enrollmentCount, icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Conversion rate", value: `${userCount > 0 ? Math.round((enrollmentCount / userCount) * 100) : 0}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent users */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent users</h2>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <ul className="space-y-3">
            {recentUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{user.name || "Unnamed"}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={user.role === "ADMIN" ? "destructive" : user.role === "INSTRUCTOR" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent courses */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent courses</h2>
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <ul className="space-y-3">
            {recentCourses.map((course) => (
              <li key={course.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800 line-clamp-1">{course.title}</p>
                  <p className="text-xs text-gray-400">by {course.instructor.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={course.isPublished ? "success" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs font-medium text-gray-600">
                    {course.isFree ? "Free" : formatPrice(course.price)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
