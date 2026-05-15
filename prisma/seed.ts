import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import * as path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const db = new PrismaClient({ adapter } as any);

async function main() {
  const categories = await Promise.all(
    ["Web Development", "Data Science", "Design", "Business", "DevOps", "Mobile"].map((name) =>
      db.category.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const adminPassword = await bcrypt.hash("admin123!", 12);
  await db.user.upsert({
    where: { email: "admin@exceller.io" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@exceller.io",
      hashedPassword: adminPassword,
      role: "ADMIN",
    },
  });

  const instructorPassword = await bcrypt.hash("instructor123!", 12);
  const instructor = await db.user.upsert({
    where: { email: "instructor@exceller.io" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "instructor@exceller.io",
      hashedPassword: instructorPassword,
      role: "INSTRUCTOR",
      bio: "Senior software engineer with 10+ years of experience building web applications.",
    },
  });

  const studentPassword = await bcrypt.hash("student123!", 12);
  await db.user.upsert({
    where: { email: "student@exceller.io" },
    update: {},
    create: {
      name: "John Doe",
      email: "student@exceller.io",
      hashedPassword: studentPassword,
      role: "STUDENT",
    },
  });

  const webCat = categories.find((c) => c.name === "Web Development")!;

  const course = await db.course.upsert({
    where: { id: "seed-course-1" },
    update: {},
    create: {
      id: "seed-course-1",
      title: "Full-Stack Next.js Development",
      description:
        "Learn to build production-ready full-stack applications with Next.js 15, TypeScript, Prisma, and Tailwind CSS.",
      price: 49.99,
      isFree: false,
      isPublished: true,
      instructorId: instructor.id,
      categoryId: webCat.id,
    },
  });

  const module1 = await db.module.upsert({
    where: { id: "seed-module-1" },
    update: {},
    create: {
      id: "seed-module-1",
      title: "Getting Started",
      position: 0,
      courseId: course.id,
    },
  });

  await db.lesson.upsert({
    where: { id: "seed-lesson-1" },
    update: {},
    create: {
      id: "seed-lesson-1",
      title: "Welcome to the course",
      content:
        "# Welcome!\n\nThis course will take you from zero to deploying a production Next.js app.\n\n## What you'll learn\n- Next.js App Router\n- TypeScript best practices\n- Database design with Prisma\n- Authentication with NextAuth.js\n- Stripe payments",
      isFree: true,
      position: 0,
      moduleId: module1.id,
    },
  });

  await db.lesson.upsert({
    where: { id: "seed-lesson-2" },
    update: {},
    create: {
      id: "seed-lesson-2",
      title: "Project setup and tooling",
      content:
        "# Project Setup\n\nWe'll set up our development environment with the latest tools.\n\n```bash\nnpx create-next-app@latest my-app --typescript --tailwind --app\n```",
      isFree: false,
      position: 1,
      moduleId: module1.id,
    },
  });

  const module2 = await db.module.upsert({
    where: { id: "seed-module-2" },
    update: {},
    create: {
      id: "seed-module-2",
      title: "App Router Deep Dive",
      position: 1,
      courseId: course.id,
    },
  });

  const lesson3 = await db.lesson.upsert({
    where: { id: "seed-lesson-3" },
    update: {},
    create: {
      id: "seed-lesson-3",
      title: "Understanding Server Components",
      content:
        "# Server Components\n\nReact Server Components allow you to render components on the server, reducing the JavaScript bundle sent to the client.",
      isFree: false,
      position: 0,
      moduleId: module2.id,
    },
  });

  const quiz = await db.quiz.upsert({
    where: { lessonId: lesson3.id },
    update: {},
    create: {
      title: "Server Components Quiz",
      lessonId: lesson3.id,
    },
  });

  await db.question.upsert({
    where: { id: "seed-q-1" },
    update: {},
    create: {
      id: "seed-q-1",
      quizId: quiz.id,
      text: "What is the default rendering strategy in Next.js App Router?",
      options: JSON.stringify([
        "Client-side rendering",
        "Server-side rendering",
        "Static generation",
        "Incremental static regeneration",
      ]),
      correctAnswer: "Server-side rendering",
    },
  });

  await db.question.upsert({
    where: { id: "seed-q-2" },
    update: {},
    create: {
      id: "seed-q-2",
      quizId: quiz.id,
      text: 'Which directive marks a component as a Client Component?',
      options: JSON.stringify(['"use client"', '"use server"', '"use browser"', '"client only"']),
      correctAnswer: '"use client"',
    },
  });

  console.log("✅ Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Admin:      admin@exceller.io      / admin123!");
  console.log("  Instructor: instructor@exceller.io / instructor123!");
  console.log("  Student:    student@exceller.io    / student123!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
