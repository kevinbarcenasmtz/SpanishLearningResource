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
  const { cookies, redirect, url } = context;
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
  const accessCode = import.meta.env.ACCESS_CODE;

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
});