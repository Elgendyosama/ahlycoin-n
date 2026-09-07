import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies (supporting auth_token, token, and auth-token)
  const token =
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('auth-token')?.value;

  const isPublicAuthRoute = pathname === '/login' || pathname === '/register';
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. If user is ALREADY authenticated and attempts to visit /login or /register, redirect to main feed
  if (token && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Admin Route Protection (/admin/*)
  if (isAdminRoute) {
    // Allow unauthenticated access ONLY to /admin/login
    if (isAdminLoginRoute) {
      return NextResponse.next();
    }
    // If no active auth token exists, redirect immediately to /admin/login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // 3. User Route Protection (/feed, /matches, /profile, etc.)
  // If NO token exists and route is NOT public auth route (/login or /register), block and redirect to /login
  if (!token && !isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for static files, Next.js internals, and images:
   * 1. _next/static (static files)
   * 2. _next/image (image optimization files)
   * 3. favicon.ico (favicon file)
   * 4. Public media files (svg, png, jpg, jpeg, gif, webp, ico)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
