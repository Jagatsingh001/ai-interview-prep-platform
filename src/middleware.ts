export { default } from 'next-auth/middleware';

// Protects these routes server-side: anyone without a valid session is
// automatically redirected to /login (configured via authOptions.pages.signIn).
// This is the only file needed to guard all 5 feature pages — none of their
// own code needs to change.
export const config = {
  matcher: [
    '/interview/:path*',
    '/coding/:path*',
    '/resume/:path*',
    '/dashboard/:path*',
    '/companies/:path*',
  ],
};
