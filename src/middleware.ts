export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/availability/:path*",
    "/event-types/:path*",
    "/bookings/:path*",
    "/teams/:path*",
    "/contacts/:path*",
    "/automations/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};