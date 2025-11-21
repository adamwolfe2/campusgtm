import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  updateTrackingLink,
  deleteTrackingLink,
  getTrackingLinkStats,
} from '@/lib/database/tracking-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { linkId } = await params;
    const stats = await getTrackingLinkStats(linkId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Error fetching link stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link stats' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { linkId } = await params;
    const body = await request.json();
    const updatedLink = await updateTrackingLink(linkId, body);

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('[API] Error updating tracking link:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking link' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { linkId } = await params;
    await deleteTrackingLink(linkId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting tracking link:', error);
    return NextResponse.json(
      { error: 'Failed to delete tracking link' },
      { status: 500 }
    );
  }
}
