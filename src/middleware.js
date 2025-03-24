import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = [
  '/',
  '/games',
  '/games/(.*)',
  '/sign-in',
  '/register',
  '/forgot-password',    
  '/reset-password',     
  '/api/(.*)',
  '/_next/(.*)',         
  '/favicon.ico',      
  '/images/(.*)', 
];

const adminPaths = [
  '/dashboard/admin',
  '/admin/(.*)',
  // '/api/admin/(.*)',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Check for authentication
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // If not authenticated, redirect to sign in
  if (!token) {
    return redirectToSignIn(request);
  }
  
  // Check for admin paths
  if (isAdminPath(pathname) && token.role !== 'ADMIN') {
    return redirectToAccessDenied(request);
  }
  
  // Allow access
  return NextResponse.next();
}

// Match only non-public paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth routes (NextAuth.js doesn't need to be protected)
     * 2. /_next (static files)
     * 3. /images, /favicon.ico (static files)
     */
    '/((?!api/auth|_next|images|favicon.ico).*)',
  ],
};

// Helper function to check if a path is public
function isPublicPath(pathname) {
  return publicPaths.some(path => {
    if (path.endsWith('(.*)')) {
      const basePath = path.replace('(.*)', '');
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  });
}

// Helper function to check if a path is admin-only
function isAdminPath(pathname) {
  return adminPaths.some(path => {
    if (path.endsWith('(.*)')) {
      const basePath = path.replace('(.*)', '');
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  });
}

// Helper function to redirect to sign in
function redirectToSignIn(request) {
  const signInUrl = new URL('/sign-in', request.url);
  signInUrl.searchParams.set('callbackUrl', request.url);
  return NextResponse.redirect(signInUrl);
}

// Helper function to redirect to access denied
function redirectToAccessDenied(request) {
  return NextResponse.redirect(new URL('/access-denied', request.url));
}