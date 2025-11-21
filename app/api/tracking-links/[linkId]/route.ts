import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  updateTrackingLink,
  deleteTrackingLink,
  getTrackingLinkStats,
} from '@/lib/database/tracking-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await getTrackingLinkStats(params.linkId);

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
  { params }: { params: { linkId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updatedLink = await updateTrackingLink(params.linkId, body);

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
  { params }: { params: { linkId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await deleteTrackingLink(params.linkId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting tracking link:', error);
    return NextResponse.json(
      { error: 'Failed to delete tracking link' },
      { status: 500 }
    );
  }
}
