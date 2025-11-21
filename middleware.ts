/**
 * Clerk Auth Middleware
 * Protects routes and handles authentication
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding",
  "/pricing",
  "/api/webhook(.*)", // For webhooks
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Referral Attribution Tracking
  const url = new URL(request.url);
  const refCode = url.searchParams.get('ref');

  if (refCode) {
    // Set referral cookie (30 day attribution window)
    response.cookies.set('cgm_ref', refCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Need to read on client
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    // Track the click asynchronously (don't block response)
    trackReferralClick(refCode, request).catch(err =>
      console.error('Referral tracking error:', err)
    );
  }

  return response;
});

// Track referral click (async, non-blocking)
async function trackReferralClick(code: string, request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || request.headers.get('referrer') || '';

    // Extract UTM parameters
    const url = new URL(request.url);
    const utmSource = url.searchParams.get('utm_source');
    const utmMedium = url.searchParams.get('utm_medium');
    const utmCampaign = url.searchParams.get('utm_campaign');

    // Simple device detection
    const deviceType = /mobile|android|iphone|ipad|tablet/i.test(userAgent)
      ? 'mobile'
      : /tablet|ipad/i.test(userAgent)
      ? 'tablet'
      : 'desktop';

    // Call tracking API
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/track/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        userAgent,
        referer,
        landingPage: request.url,
        utmSource,
        utmMedium,
        utmCampaign,
        deviceType,
      }),
    });
  } catch (error) {
    // Fail silently - don't break user experience
    console.error('Click tracking failed:', error);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
