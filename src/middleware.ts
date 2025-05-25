
// src/middleware.ts
import type { NextRequest, NextResponse } from 'next/server';

// Minimal no-op middleware
export function middleware(request: NextRequest): NextResponse | void {
  // Perform no operations, just pass through
  // console.log('Minimal middleware executed for path:', request.nextUrl.pathname);
  // return NextResponse.next(); // Or simply do nothing for pass-through
}

export const config = {
  // Match all paths except for internal Next.js paths and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
