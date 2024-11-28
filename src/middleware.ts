import { withAuth } from "next-auth/middleware";

export default withAuth(
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all routes under /main and other authenticated routes
export const config = {
  matcher: [
    "/main/:path*",
    "/proxy_hosts/:path*",
    "/ssl_management/:path*",
    "/jobs_management/:path*",
  ],
};
