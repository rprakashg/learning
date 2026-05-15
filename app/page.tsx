import Link from "next/link";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { GraduationCap, Users, BookOpen, Star, ArrowRight, CheckCircle } from "lucide-react";

async function getFeaturedCourses() {
  return db.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: { select: { name: true, image: true } },
      category: true,
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

async function getStats() {
  const [courses, users, enrollments] = await Promise.all([
    db.course.count({ where: { isPublished: true } }),
    db.user.count(),
    db.enrollment.count({ where: { status: "ACTIVE" } }),
  ]);
  return { courses, users, enrollments };
}

export default async function HomePage() {
  const [courses, stats] = await Promise.all([getFeaturedCourses(), getStats()]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-24 text-white">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <Star className="h-4 w-4 text-yellow-400" />
              Trusted by {stats.users.toLocaleString()}+ learners
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
              Learn skills that
              <span className="block text-indigo-200"> move your career forward</span>
            </h1>
            <p className="mb-10 text-xl text-indigo-100">
              Expert-led workshops and courses in software development, design, and business.
              Learn at your own pace with lifetime access.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse all courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full bg-white text-indigo-700 hover:bg-indigo-50 sm:w-auto"
                >
                  Start for free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: BookOpen, label: "Courses available", value: stats.courses },
              { icon: Users, label: "Active learners", value: stats.users },
              { icon: GraduationCap, label: "Enrollments completed", value: stats.enrollments },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured courses</h2>
              <p className="mt-2 text-gray-500">Hand-picked by our instructors for you</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No courses published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Exceller */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Why learn with Exceller?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Expert instructors", desc: "Learn from industry practitioners with real-world experience." },
              { title: "Learn at your pace", desc: "Lifetime access to course materials. No deadlines, no pressure." },
              { title: "Hands-on projects", desc: "Build real projects and quizzes to reinforce your learning." },
              { title: "Progress tracking", desc: "See exactly where you are in every course with visual dashboards." },
              { title: "Certificate of completion", desc: "Earn shareable certificates to showcase your new skills." },
              { title: "Secure payments", desc: "Pay safely with Stripe. One-time payment, lifetime access." },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to start learning?</h2>
          <p className="mt-4 text-indigo-200">
            Join thousands of learners already advancing their careers.
          </p>
          <Link href="/register" className="mt-8 inline-block">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
              Create free account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 py-10 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Exceller. All rights reserved.</p>
      </footer>
    </div>
  );
}
