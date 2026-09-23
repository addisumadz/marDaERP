import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // RBAC: Protect /ui/admin exclusively for ROLE_ADMIN
    if (pathname.startsWith("/ui/admin")) {
      const roles = Array.isArray(token?.roles) ? token.roles : [];
      const isAdmin = roles.some(
        (r) => String(r).toUpperCase() === "ROLE_ADMIN" || String(r).toUpperCase() === "ADMIN"
      );
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // User must possess a valid session token
        if (!token) return false;
        // Check if token expiration flag is set
        if (token.isTokenExpired === 1 || token.isTokenExpierd === 1) {
          return false;
        }
        return true;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    "/ui/:path*",
  ],
};
