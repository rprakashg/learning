import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      role: true,
      hashedPassword: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and profile.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <ProfileForm user={{ name: user.name, email: user.email, bio: user.bio }} />

        {user.hashedPassword && <PasswordForm />}

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Account</h2>
          <p className="mt-1 text-sm text-gray-500">Your account details.</p>
          <dl className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-400" />
              <dt className="text-sm text-gray-500 w-24">Role</dt>
              <dd className="text-sm font-medium text-gray-900 capitalize">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4" />
              <dt className="text-sm text-gray-500 w-24">Member since</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
