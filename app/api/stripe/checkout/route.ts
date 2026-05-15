import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { id: courseId, isPublished: true } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if already enrolled
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Free course: enroll directly
  if (course.isFree || course.price === 0) {
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: { status: "ACTIVE" },
      create: { userId: session.user.id, courseId, status: "ACTIVE" },
    });
    return NextResponse.json({ url: `${appUrl}/student/courses/${courseId}` });
  }

  // Paid course: create Stripe Checkout session
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

  // Create pending enrollment
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    update: { status: "PENDING", stripeSessionId: stripeSession.id },
    create: {
      userId: session.user.id,
      courseId,
      status: "PENDING",
      stripeSessionId: stripeSession.id,
    },
  });

  return NextResponse.json({ url: stripeSession.url });
}
