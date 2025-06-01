
import { type NextRequest, NextResponse } from 'next/server';

// This is a minimal middleware function.
// It currently does nothing and just passes the request to the next handler.
// The original comments indicated next-intl was used here, which has been removed.
// If middleware functionality is needed in the future, it can be added here.
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
