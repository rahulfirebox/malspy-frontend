import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/superadmin', '/settings', '/admin'];

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

const ADMIN_ONLY_ROUTES = ['/superadmin'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/results/')) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(prefix => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (isAdminOnlyRoute(pathname)) {
    const role = request.cookies.get('user_role')?.value;
    if (role !== 'superadmin') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  
  
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
