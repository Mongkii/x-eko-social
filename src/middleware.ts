import type { NextRequest, NextResponse } from 'next/server';

// This is a no-op middleware function.
// It's in place because the file exists, and Next.js requires
// a middleware file to export a 'middleware' or 'default' function.
// The previous i18n middleware functionality has been removed.
export function middleware(request: NextRequest): NextResponse | void {
  // No operation, allow the request to proceed.
  return;
}

// Optionally, to prevent the middleware from running on specific paths:
// export const config = {
//   matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
// };
// However, for a true no-op, the above function is sufficient.
