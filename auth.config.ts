import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no database imports, no Node.js APIs
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // providers are added in lib/auth.ts, not needed here for middleware
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return isLoggedIn
          ? Response.redirect(new URL("/student", nextUrl))
          : Response.redirect(new URL("/login", nextUrl));
      }

      if (
        pathname.startsWith("/instructor") &&
        role !== "INSTRUCTOR" &&
        role !== "ADMIN"
      ) {
        return isLoggedIn
          ? Response.redirect(new URL("/student", nextUrl))
          : Response.redirect(new URL("/login", nextUrl));
      }

      if (pathname.startsWith("/student") && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
        const dest =
          role === "ADMIN"
            ? "/admin"
            : role === "INSTRUCTOR"
            ? "/instructor"
            : "/student";
        return Response.redirect(new URL(dest, nextUrl));
      }

      return true;
    },
  },
};
