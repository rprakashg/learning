import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    isFree: boolean;
    category: { name: string } | null;
    instructor: { name: string | null; image: string | null };
    _count: { enrollments: number; modules: number };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="relative h-44 w-full bg-gradient-to-br from-indigo-400 to-purple-500">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-white/60" />
            </div>
          )}
          {course.category && (
            <div className="absolute left-3 top-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {course.category.name}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900 group-hover:text-indigo-600">
            {course.title}
          </h3>
          {course.description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-500">{course.description}</p>
          )}

          <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course._count.modules} modules
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course._count.enrollments} students
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">by {course.instructor.name || "Instructor"}</p>
            <p className="text-base font-bold text-gray-900">
              {course.isFree || course.price === 0 ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                formatPrice(course.price)
              )}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
