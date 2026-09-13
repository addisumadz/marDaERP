// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const roles = req.nextauth.token?.roles || [] // array of roles
    const pathname = req.nextUrl.pathname

    // Normalize roles by stripping optional ROLE_ prefix and lowering case for comparisons
    const normalizedRoles = roles.map((r) =>
      String(r || "").replace(/^ROLE_/i, "").toLowerCase()
    )

    // Server-side logs (will show in Next.js server console)
    // try {
    //   //console.log('[MW] path:', pathname, 'roles:', roles, 'token:', !!req.nextauth.token)
    //  // console.log('[MW] full token:', req.nextauth.token)
    // } catch (e) {
    //   // ignore logging errors in edge runtimes
    // }

    // Manager UI is accessible to the five application roles
    const managerRoles = [
      "billzgjt",
      "systemadmin",
      "fnc",
      "cashier",
      "mobileanbabi",
    ]

    if (
      pathname.startsWith("/ui/manager") &&
      !normalizedRoles.some((r) => managerRoles.includes(r))
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    if (
      pathname.startsWith("/ui/admin") &&
      !roles.includes("ROLE_ADMIN")
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    if (pathname.startsWith("/ui/user") && !roles.includes("ROLE_USER")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Only CASHIER role can access cashier pages (support legacy ROLE_CASHIER and raw Cashier)
    if (
      pathname.startsWith("/ui/cashier") &&
      !(
        roles.includes("ROLE_CASHIER") ||
        normalizedRoles.includes("cashier")
      )
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/ui/:path*"]
}
