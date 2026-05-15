import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/navbar";
import { CourseCard } from "@/components/courses/course-card";
import { SearchInput } from "@/components/courses/search-input";
import { BookOpen } from "lucide-react";

interface SearchParams {
  search?: string;
  category?: string;
}

async function getCourses(params: SearchParams) {
  return db.course.findMany({
    where: {
      isPublished: true,
      ...(params.category && { categoryId: params.category }),
      ...(params.search && { title: { contains: params.search } }),
    },
    include: {
      instructor: { select: { name: true, image: true } },
      category: true,
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [courses, categories] = await Promise.all([
    getCourses(params),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
          <p className="mt-2 text-gray-500">
            {courses.length} course{courses.length !== 1 ? "s" : ""} available
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput defaultValue={params.search} />
          <div className="flex flex-wrap gap-2">
            <a
              href="/courses"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !params.category
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/courses?category=${cat.id}${params.search ? `&search=${params.search}` : ""}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  params.category === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-500">No courses found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
