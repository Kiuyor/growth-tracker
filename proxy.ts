import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const pathname = req.nextUrl.pathname;

  // 公开路由
  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname === "/"
  ) {
    return;
  }

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
