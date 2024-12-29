// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  // Protect all routes except auth-related ones
  if (
    !isLoggedIn &&
    !path.startsWith("/auth") &&
    path !== "/login" &&
    path !== "/register"
  ) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static).*)"],
};
