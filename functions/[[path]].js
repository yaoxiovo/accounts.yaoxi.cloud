/**
 * Cloudflare Pages Catch-All Route Handler
 * This file MUST exist so that _middleware.js can intercept requests.
 * It simply passes through to serve the static asset after middleware verification.
 */
export async function onRequest(context) {
  return context.next();
}
