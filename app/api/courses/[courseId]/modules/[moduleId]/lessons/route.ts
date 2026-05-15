import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  isFree: z.boolean().default(false),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, moduleId } = await params;
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const lastLesson = await db.lesson.findFirst({
    where: { moduleId },
    orderBy: { position: "desc" },
  });

  const lesson = await db.lesson.create({
    data: {
      ...parsed.data,
      moduleId,
      position: (lastLesson?.position ?? -1) + 1,
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
