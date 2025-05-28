// This file is no longer needed as next-intl middleware is removed.
// If Next.js requires a middleware.ts for other reasons (e.g. due to path structure),
// an empty or minimal no-op middleware can be placed here.
// For now, marking for deletion by making it an empty export.
export function middleware() {
  // No-op
}

export const config = {
  matcher: [], // No routes matched by default
};
