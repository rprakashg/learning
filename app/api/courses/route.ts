import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().min(0).default(0),
  isFree: z.boolean().default(false),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      ...(categoryId && { categoryId }),
      ...(search && { title: { contains: search } }),
    },
    include: {
      instructor: { select: { name: true, image: true } },
      category: true,
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const course = await db.course.create({
    data: { ...parsed.data, instructorId: session.user.id },
  });

  return NextResponse.json(course, { status: 201 });
}
