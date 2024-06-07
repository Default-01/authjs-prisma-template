import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	if (!isLoggedIn) {
		return NextResponse.redirect(new URL('/auth/login', nextUrl));
	}
});

export const config = {
	/*
	 * Match all request paths except for the ones starting with:
	 * - api (API routes)
	 * - _next/static (static files)
	 * - _next/image (image optimization files)
	 * - favicon.ico (favicon file)
	 */

	// matcher: ['/((?!api|auth/login|_next/static|_next/image|favicon.ico).*)'],
	matcher: ['/test', '/auth/settings', '/auth/change-password'],
};
