import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createTrackingLink,
  getTrackingLinksWithStats,
} from '@/lib/database/tracking-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const ambassadorProgramId = searchParams.get('ambassadorProgramId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const links = await getTrackingLinksWithStats(userId, {
      ambassadorProgramId: ambassadorProgramId || undefined,
      includeInactive,
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('[API] Error fetching tracking links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullUrl, title, description, ambassadorProgramId } = body;

    if (!fullUrl) {
      return NextResponse.json(
        { error: 'Full URL is required' },
        { status: 400 }
      );
    }

    const link = await createTrackingLink(userId, fullUrl, {
      title,
      description,
      ambassadorProgramId,
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('[API] Error creating tracking link:', error);
    return NextResponse.json(
      { error: 'Failed to create tracking link' },
      { status: 500 }
    );
  }
}
