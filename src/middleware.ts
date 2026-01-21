/**
 * Authentication Middleware
 *
 * Protects all routes except /login with a simple password check.
 * Uses session cookie to persist authentication.
 */

import { defineMiddleware } from 'astro:middleware';

const COOKIE_NAME = 'auth_session';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/logout'];

function isPublicAssetPath(pathname: string) {
  // Astro build assets + common static assets
  if (pathname.startsWith('/_astro/')) return true;
  if (pathname.startsWith('/fonts/')) return true;
  if (pathname === '/favicon.svg') return true;
  // Any file extension (e.g. .css, .js, .png) in /public or output
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip middleware during build/prerendering
  // During prerendering, request.headers is not available and accessing it causes warnings
  if (import.meta.env.BUILD) {
    return next();
  }

  // Wrap in try-catch to handle cases where request might not be fully available
  try {
    const { cookies, redirect, url, locals } = context;
    const pathname = url.pathname;

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      return next();
    }

    // Allow static assets through without auth checks
    if (isPublicAssetPath(pathname)) {
      return next();
    }

    // Check for valid session cookie
    const sessionToken = cookies.get(COOKIE_NAME);

    // Access environment variable from Cloudflare runtime
    // Note: This is available at runtime, not build time
    const accessCode = locals.runtime?.env?.ACCESS_CODE;

    if (!accessCode) {
      console.error('ACCESS_CODE environment variable not set!');
      return new Response('Server configuration error', { status: 500 });
    }

    // Validate session
    if (sessionToken?.value === accessCode) {
      return next();
    }

    // No valid session - redirect to login
    return redirect('/login');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // During prerendering, some context properties might not be available
    // In that case, just allow the request through
    return next();
  }
});
