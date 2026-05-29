import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sanityClient } from "@/lib/sanity";
import { courseByIdQuery, type SanityCourse } from "@/lib/sanity-queries";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = await sanityClient.fetch<SanityCourse | null>(
    courseByIdQuery,
    { id: courseId }
  );
  if (!course || !course.isPublished) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_sanityCourseId: { userId: session.user.id, sanityCourseId: courseId } },
  });
  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (course.isFree || course.price === 0) {
    await db.enrollment.upsert({
      where: { userId_sanityCourseId: { userId: session.user.id, sanityCourseId: courseId } },
      update: { status: "ACTIVE" },
      create: { userId: session.user.id, sanityCourseId: courseId, status: "ACTIVE" },
    });
    return NextResponse.json({ url: `${appUrl}/student/courses/${courseId}` });
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(course.price * 100),
          product_data: {
            name: course.title,
            description: course.description ?? undefined,
            images: course.imageUrl ? [course.imageUrl] : [],
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId,
      userId: session.user.id,
    },
    success_url: `${appUrl}/student/courses/${courseId}?success=1`,
    cancel_url: `${appUrl}/courses/${courseId}?canceled=1`,
    customer_email: session.user.email,
  });

  await db.enrollment.upsert({
    where: { userId_sanityCourseId: { userId: session.user.id, sanityCourseId: courseId } },
    update: { status: "PENDING", stripeSessionId: stripeSession.id },
    create: {
      userId: session.user.id,
      sanityCourseId: courseId,
      status: "PENDING",
      stripeSessionId: stripeSession.id,
    },
  });

  return NextResponse.json({ url: stripeSession.url });
}
