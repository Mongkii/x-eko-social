
import { type NextRequest, NextResponse } from 'next/server';

// This is a minimal middleware function.
// It currently does nothing and just passes the request to the next handler.
// The original i18n middleware logic has been removed.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Optionally, you can define a config object to specify which paths the middleware should run on.
// export const config = {
//   matcher: [
//     // Paths to match, e.g.,
//     // '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };
