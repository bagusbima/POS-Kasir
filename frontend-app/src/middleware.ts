import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Mengecek cookie lokal milik Next.js
  const isLoggedIn = request.cookies.has('is_logged_in');
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/pos', '/products', '/transactions'];
  const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // 1. Jika BELUM login dan nekat buka halaman privat -> Tendang ke /login
  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika SUDAH login tapi coba-coba akses halaman login lagi -> Lempar ke /dashboard
  if (isLoggedIn && (pathname === '/login' || pathname.startsWith('/auth'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/pos',
    '/pos/:path*',
    '/products',
    '/products/:path*',
    '/transactions',
    '/transactions/:path*',
    '/login',
    '/auth/:path*'
  ],
};