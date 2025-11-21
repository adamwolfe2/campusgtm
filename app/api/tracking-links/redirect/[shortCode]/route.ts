import { NextRequest, NextResponse } from 'next/server';
import {
  getTrackingLinkByShortCode,
  recordLinkClick,
} from '@/lib/database/tracking-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;

    // Get the tracking link
    const link = await getTrackingLinkByShortCode(shortCode);

    if (!link || !link.is_active) {
      return NextResponse.json(
        { error: 'Tracking link not found or inactive' },
        { status: 404 }
      );
    }

    // Get request metadata
    const body = await request.json();
    const { userAgent, referrer } = body;

    // Get IP address from headers (works with most hosting providers)
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Record the click
    await recordLinkClick(link.id, {
      ipAddress,
      userAgent,
      referrer,
    });

    // Return the redirect URL
    return NextResponse.json({
      redirectUrl: link.full_url,
    });
  } catch (error) {
    console.error('[API] Error processing tracking link redirect:', error);
    return NextResponse.json(
      { error: 'Failed to process redirect' },
      { status: 500 }
    );
  }
}
