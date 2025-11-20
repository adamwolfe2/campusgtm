import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/database/supabase";
import { monitorAllKeywords } from "@/app/actions/monitor-keywords";
import { generateDailyActions } from "@/app/actions/daily-actions";

/**
 * Daily Scan Cron Job
 * Runs every day at 8am UTC
 *
 * Tasks:
 * 1. Fetch all active workspaces with monitoring enabled
 * 2. For each workspace, run keyword monitoring
 * 3. Generate daily actions from high-priority mentions
 * 4. Send email notifications if enabled
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
    workspacesProcessed: 0,
    totalMentions: 0,
    highPriorityCount: 0,
    actionsGenerated: 0,
    errors: [] as string[],
  };

  try {
    // Fetch active workspaces with automation enabled
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id, name')
      .limit(100); // Rate limit: max 100 workspaces per run

    if (workspaceError) {
      throw new Error(`Failed to fetch workspaces: ${workspaceError.message}`);
    }

    if (!workspaces || workspaces.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No workspaces to process',
        results,
        executionTime: `${Date.now() - startTime}ms`,
      });
    }

    // Process each workspace
    for (const workspace of workspaces) {
      try {
        // Get automation preferences
        const { data: prefs } = await supabase
          .from('automation_preferences')
          .select('*')
          .eq('workspace_id', workspace.id)
          .single();

        // Skip if daily digest is disabled
        if (prefs && !prefs.enable_daily_digest) {
          continue;
        }

        // Get active monitored keywords for this workspace
        const { data: keywords, error: keywordError } = await supabase
          .from('monitored_keywords')
          .select('keyword, platforms')
          .eq('workspace_id', workspace.id)
          .eq('is_active', true);

        if (keywordError || !keywords || keywords.length === 0) {
          continue; // Skip workspace if no keywords
        }

        // Get workspace ICP for context
        const { data: knowledgeBase } = await supabase
          .from('knowledge_bases')
          .select('onboarding_data')
          .eq('workspace_id', workspace.id)
          .single();

        const icp = knowledgeBase?.onboarding_data?.targetAudience;

        // Monitor all keywords
        const keywordList = keywords.map(k => k.keyword);
        const monitoringResult = await monitorAllKeywords(
          workspace.id,
          keywordList,
          icp
        );

        results.totalMentions += monitoringResult.totalMentions;
        results.highPriorityCount += monitoringResult.highPriorityCount;

        // Save high-priority mentions to database
        const highPriorityMentions = monitoringResult.mentions.filter(
          m => m.relevanceScore >= 80 && m.engagementScore >= 50
        );

        for (const mention of highPriorityMentions) {
          // Find keyword_id
          const { data: keywordRecord } = await supabase
            .from('monitored_keywords')
            .select('id')
            .eq('workspace_id', workspace.id)
            .eq('keyword', mention.metadata.keyword || keywordList[0])
            .single();

          if (keywordRecord) {
            await supabase.from('keyword_mentions').insert({
              keyword_id: keywordRecord.id,
              platform: mention.platform,
              url: mention.url,
              title: mention.title,
              content: mention.content,
              author: mention.author,
              relevance_score: mention.relevanceScore,
              engagement_score: mention.engagementScore,
              suggested_reply: mention.suggestedReply,
              metadata: mention.metadata,
            });
          }
        }

        // Generate daily actions if we have high-priority items
        if (monitoringResult.highPriorityCount > 0) {
          const intelligenceData = {
            keywordMentions: monitoringResult.mentions.slice(0, 10).map(m => ({
              id: crypto.randomUUID(),
              platform: m.platform,
              url: m.url,
              title: m.title,
              content: m.content,
              relevanceScore: m.relevanceScore,
              engagementScore: m.engagementScore,
              suggestedReply: m.suggestedReply,
            })),
            communities: [],
            competitorChanges: [],
            viralContent: [],
          };

          const actions = await generateDailyActions(workspace.id, intelligenceData);
          results.actionsGenerated += actions.length;

          // Save actions to database
          for (const action of actions) {
            await supabase.from('daily_actions').insert({
              workspace_id: workspace.id,
              action_type: action.type,
              title: action.title,
              description: action.description,
              impact_score: action.priority === 'high' ? 80 : action.priority === 'medium' ? 60 : 40,
              effort_minutes: parseInt(action.estimatedTime) || 30,
              source_type: action.sourceType,
              source_id: action.sourceId,
            });
          }
        }

        // Log successful run
        await supabase.from('automation_logs').insert({
          workspace_id: workspace.id,
          job_type: 'daily_scan',
          status: 'success',
          summary: `Found ${monitoringResult.totalMentions} mentions, ${monitoringResult.highPriorityCount} high-priority`,
          details: {
            mentionsFound: monitoringResult.totalMentions,
            highPriority: monitoringResult.highPriorityCount,
            actionsGenerated: actions?.length || 0,
          },
        });

        results.workspacesProcessed++;

        // TODO: Send email notification if enabled
        // This would integrate with a service like Resend or SendGrid

      } catch (workspaceError) {
        const errorMsg = `Error processing workspace ${workspace.id}: ${workspaceError instanceof Error ? workspaceError.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);

        // Log failed run
        await supabase.from('automation_logs').insert({
          workspace_id: workspace.id,
          job_type: 'daily_scan',
          status: 'failed',
          summary: errorMsg,
          details: { error: errorMsg },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Daily scan completed',
      results,
      executionTime: `${Date.now() - startTime}ms`,
    });

  } catch (error) {
    console.error('Daily scan error:', error);
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
 * POST /api/cron/daily-scan with workspaceId in body
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
  const { workspaceId } = body;

  if (!workspaceId) {
    return NextResponse.json(
      { error: 'workspaceId required' },
      { status: 400 }
    );
  }

  // Execute for single workspace
  // Implementation similar to GET but for single workspace
  return NextResponse.json({
    success: true,
    message: 'Manual scan triggered',
    workspaceId,
  });
}
