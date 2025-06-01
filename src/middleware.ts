
// This file is no longer used.
// The next-intl middleware has been removed as part of simplifying to English-only.
// If a general middleware is needed later for Eko, it can be created here.
// This file can be deleted or kept as a placeholder.
import type { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse | undefined {
  // Placeholder middleware, does nothing.
  return undefined;
}

export const config = {
  // Matcher for all request paths except for API, Next.js internals, and static files.
  // Adjust if a new middleware logic is added.
  // matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
