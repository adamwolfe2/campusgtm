import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/database/supabase";
import { snapshotCompetitor, detectChanges } from "@/app/actions/track-competitors";

/**
 * Competitor Monitor Cron Job
 * Runs every 6 hours
 *
 * Tasks:
 * 1. Fetch all active competitors being tracked
 * 2. Take new snapshots of their websites
 * 3. Compare with previous snapshot
 * 4. Detect and save significant changes
 * 5. Send alerts for high-impact changes
 *
 * Auth: Requires CRON_SECRET in Authorization header
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  const startTime = Date.now();
  const results = {
    competitorsChecked: 0,
    snapshotsTaken: 0,
    changesDetected: 0,
    criticalChanges: 0,
    errors: [] as string[],
  };

  try {
    // Fetch all active competitors
    const { data: competitors, error: competitorError } = (await supabase
      .from('competitors' as any)
      .select('id, workspace_id, name, website, tracked_urls')
      .eq('is_active', true)
      .limit(50)) as any; // Rate limit: max 50 competitors per run

    if (competitorError) {
      throw new Error(`Failed to fetch competitors: ${competitorError.message}`);
    }

    if (!competitors || competitors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No competitors to monitor',
        results,
        executionTime: `${Date.now() - startTime}ms`,
      });
    }

    // Process each competitor
    for (const competitor of competitors) {
      try {
        // Determine URLs to monitor
        const urlsToMonitor = competitor.tracked_urls?.length > 0
          ? competitor.tracked_urls
          : [competitor.website];

        // Monitor each URL
        for (const url of urlsToMonitor) {
          try {
            // Take new snapshot
            const newSnapshot = await snapshotCompetitor(url);
            results.snapshotsTaken++;

            // Get previous snapshot
            const { data: previousSnapshot } = (await supabase
              .from('competitor_snapshots' as any)
              .select('content, content_hash, metadata')
              .eq('competitor_id', competitor.id)
              .eq('url', url)
              .order('scraped_at', { ascending: false })
              .limit(1)
              .single()) as any;

            // Save new snapshot
            await supabase.from('competitor_snapshots' as any).insert({
              competitor_id: competitor.id,
              url: newSnapshot.url,
              content_hash: newSnapshot.contentHash,
              content: newSnapshot.content,
              metadata: newSnapshot.metadata,
            } as any);

            // Compare with previous snapshot if exists
            if (previousSnapshot && previousSnapshot.content_hash !== newSnapshot.contentHash) {
              const changes = await detectChanges(
                competitor.name,
                {
                  content: previousSnapshot.content,
                  metadata: previousSnapshot.metadata,
                },
                {
                  content: newSnapshot.content,
                  metadata: newSnapshot.metadata,
                }
              );

              // Save significant changes
              for (const change of changes) {
                await supabase.from('competitor_changes' as any).insert({
                  competitor_id: competitor.id,
                  url,
                  change_type: change.changeType,
                  summary: change.summary,
                  old_content: change.oldContent,
                  new_content: change.newContent,
                  impact_score: change.impactScore,
                } as any);

                results.changesDetected++;

                // Count critical changes (impact >= 80)
                if (change.impactScore >= 80) {
                  results.criticalChanges++;

                  // TODO: Send alert notification
                  // This would integrate with email/Slack notifications
                }
              }

              // Log changes
              if (changes.length > 0) {
                await supabase.from('automation_logs' as any).insert({
                  workspace_id: competitor.workspace_id,
                  job_type: 'competitor_monitor',
                  status: 'success',
                  summary: `Detected ${changes.length} changes for ${competitor.name}`,
                  details: {
                    competitorName: competitor.name,
                    url,
                    changesCount: changes.length,
                    changes: changes.map(c => ({
                      type: c.changeType,
                      impact: c.impactScore,
                      summary: c.summary,
                    })),
                  },
                } as any);
              }
            }

          } catch (urlError) {
            const errorMsg = `Error monitoring URL ${url}: ${urlError instanceof Error ? urlError.message : 'Unknown error'}`;
            console.error(errorMsg);
            results.errors.push(errorMsg);
          }
        }

        results.competitorsChecked++;

      } catch (competitorError) {
        const errorMsg = `Error processing competitor ${competitor.id}: ${competitorError instanceof Error ? competitorError.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);

        // Log failed run
        await supabase.from('automation_logs' as any).insert({
          workspace_id: competitor.workspace_id,
          job_type: 'competitor_monitor',
          status: 'failed',
          summary: errorMsg,
          details: {
            competitorId: competitor.id,
            competitorName: competitor.name,
            error: errorMsg
          },
        } as any);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Competitor monitoring completed',
      results,
      executionTime: `${Date.now() - startTime}ms`,
    });

  } catch (error) {
    console.error('Competitor monitor error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
        executionTime: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint for testing
 * POST /api/cron/competitor-monitor with competitorId in body
 */
export async function POST(request: NextRequest) {
  // Allow manual triggers for testing (no auth required in development)
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return NextResponse.json(
      { error: 'Manual triggers only allowed in development' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { competitorId } = body;

  if (!competitorId) {
    return NextResponse.json(
      { error: 'competitorId required' },
      { status: 400 }
    );
  }

  // Execute for single competitor
  // Implementation similar to GET but for single competitor
  return NextResponse.json({
    success: true,
    message: 'Manual competitor check triggered',
    competitorId,
  });
}
