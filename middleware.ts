import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // No token, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - decoded.iat;
    
    // Allow token if it's not expired
    if (decoded.rememberMe) {
      // Remember me tokens: valid for 1 day (86400 seconds)
      if (tokenAge > 86400) {
        throw new Error("Remember me token expired");
      }
    } else {
      // Session tokens: valid for 1 hour (3600 seconds)
      if (tokenAge > 3600) {
        throw new Error("Session token expired");
      }
    }

    // Token is valid, continue
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error.message);
    // Invalid or expired token, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};