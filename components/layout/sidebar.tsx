"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  PlusCircle,
  GraduationCap,
  BarChart2,
  Settings,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "All Courses", icon: BookOpen },
];

const instructorLinks: SidebarLink[] = [
  { href: "/instructor", label: "Overview", icon: LayoutDashboard },
  { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { href: "/instructor/courses/new", label: "New Course", icon: PlusCircle },
  { href: "/instructor/analytics", label: "Analytics", icon: BarChart2 },
];

const studentLinks: SidebarLink[] = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/my-courses", label: "My Courses", icon: GraduationCap },
  { href: "/courses", label: "Browse Courses", icon: BookOpen },
];

interface SidebarProps {
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const links =
    role === "ADMIN"
      ? adminLinks
      : role === "INSTRUCTOR"
      ? instructorLinks
      : studentLinks;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white px-3 py-6">
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 pt-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings className="h-5 w-5 text-gray-400" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
