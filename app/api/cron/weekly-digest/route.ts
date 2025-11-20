import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/database/supabase";
import { generateWeeklyDigest, exportDigestEmail } from "@/app/actions/weekly-digest";

/**
 * Weekly Digest Cron Job
 * Runs every Monday at 9am UTC
 *
 * Tasks:
 * 1. Fetch all active workspaces with weekly digest enabled
 * 2. Aggregate intelligence data from the past week
 * 3. Generate AI-powered weekly digest
 * 4. Save digest to database
 * 5. Send email if enabled
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
    digestsGenerated: 0,
    emailsSent: 0,
    errors: [] as string[],
  };

  try {
    // Calculate week boundaries
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch active workspaces
    const { data: workspaces, error: workspaceError } = (await supabase
      .from('workspaces' as any)
      .select('id, name')
      .limit(100)) as any; // Rate limit

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
        const { data: prefs } = (await supabase
          .from('automation_preferences' as any)
          .select('*')
          .eq('workspace_id', workspace.id)
          .single()) as any;

        // Skip if weekly digest is disabled
        if (prefs && !prefs.enable_weekly_digest) {
          continue;
        }

        // Check if digest already exists for this week
        const { data: existingDigest } = (await supabase
          .from('weekly_digests' as any)
          .select('id')
          .eq('workspace_id', workspace.id)
          .eq('week_start', weekStart.toISOString().split('T')[0])
          .single()) as any;

        if (existingDigest) {
          continue; // Skip if already generated
        }

        // Aggregate intelligence data from the past week

        // 1. Fetch communities discovered this week
        const { data: communities } = (await supabase
          .from('icp_communities' as any)
          .select('name, platform, member_count, relevance_score, discovered_at')
          .eq('workspace_id', workspace.id)
          .gte('discovered_at', weekStart.toISOString())
          .lte('discovered_at', weekEnd.toISOString())) as any;

        // 2. Fetch keyword mentions
        const { data: keywordMentionsData } = (await supabase
          .from('keyword_mentions' as any)
          .select(`
            id,
            platform,
            title,
            relevance_score,
            engagement_score,
            detected_at,
            monitored_keywords!inner(keyword, workspace_id)
          `)
          .eq('monitored_keywords.workspace_id', workspace.id)
          .gte('detected_at', weekStart.toISOString())
          .lte('detected_at', weekEnd.toISOString())) as any;

        // 3. Fetch viral content
        const { data: viralContentData } = (await supabase
          .from('viral_content' as any)
          .select('platform, title, engagement_score, why_viral, detected_at')
          .eq('workspace_id', workspace.id)
          .gte('detected_at', weekStart.toISOString())
          .lte('detected_at', weekEnd.toISOString())) as any;

        // 4. Fetch competitor changes
        const { data: competitorChangesData } = (await supabase
          .from('competitor_changes' as any)
          .select(`
            id,
            url,
            change_type,
            summary,
            impact_score,
            detected_at,
            competitors!inner(name, workspace_id)
          `)
          .eq('competitors.workspace_id', workspace.id)
          .gte('detected_at', weekStart.toISOString())
          .lte('detected_at', weekEnd.toISOString())) as any;

        // 5. Fetch completed actions
        const { data: actionsData } = (await supabase
          .from('daily_actions' as any)
          .select('action_type, title, completed_at')
          .eq('workspace_id', workspace.id)
          .eq('status', 'completed')
          .gte('completed_at', weekStart.toISOString())
          .lte('completed_at', weekEnd.toISOString())) as any;

        // Build weekly summary data
        const weeklyData = {
          weekStart,
          weekEnd,
          communities: (communities || []).map((c: any) => ({
            name: c.name,
            platform: c.platform,
            memberCount: c.member_count || 0,
            relevanceScore: c.relevance_score || 0,
            discoveredAt: new Date(c.discovered_at),
          })),
          keywordMentions: (keywordMentionsData || []).map((m: any) => ({
            keyword: m.monitored_keywords.keyword,
            platform: m.platform,
            title: m.title,
            relevanceScore: m.relevance_score || 0,
            engagementScore: m.engagement_score || 0,
            detectedAt: new Date(m.detected_at),
          })),
          viralContent: (viralContentData || []).map((v: any) => ({
            platform: v.platform,
            title: v.title,
            engagementScore: v.engagement_score || 0,
            whyViral: v.why_viral || '',
            detectedAt: new Date(v.detected_at),
          })),
          competitorChanges: (competitorChangesData || []).map((c: any) => ({
            competitorName: c.competitors.name,
            changeType: c.change_type,
            summary: c.summary,
            impactScore: c.impact_score || 0,
            detectedAt: new Date(c.detected_at),
          })),
          actionsCompleted: (actionsData || []).map((a: any) => ({
            type: a.action_type,
            title: a.title,
            completedAt: new Date(a.completed_at),
          })),
        };

        // Generate AI digest
        const digest = await generateWeeklyDigest(workspace.id, weeklyData);

        // Save digest to database
        const { error: insertError } = (await supabase
          .from('weekly_digests' as any)
          .insert({
            workspace_id: workspace.id,
            week_start: weekStart.toISOString().split('T')[0],
            week_end: weekEnd.toISOString().split('T')[0],
            summary_json: {
              summary: digest.summary,
              metrics: digest.metrics,
              topOpportunities: digest.topOpportunities,
              competitiveInsights: digest.competitiveInsights,
              contentTrends: digest.contentTrends,
              nextWeekFocus: digest.nextWeekFocus,
            },
          } as any)) as any;

        if (insertError) {
          throw new Error(`Failed to save digest: ${insertError.message}`);
        }

        results.digestsGenerated++;

        // Send email if enabled
        if (prefs && prefs.email && prefs.enable_weekly_digest) {
          try {
            const emailHtml = await exportDigestEmail(digest);

            // TODO: Integrate with email service (Resend, SendGrid, etc.)
            // await sendEmail({
            //   to: prefs.email,
            //   subject: `Weekly Growth Digest - ${workspace.name}`,
            //   html: emailHtml,
            // });

            results.emailsSent++;
          } catch (emailError) {
            console.error('Email send error:', emailError);
          }
        }

        // Log successful run
        await supabase.from('automation_logs' as any).insert({
          workspace_id: workspace.id,
          job_type: 'weekly_digest',
          status: 'success',
          summary: `Generated digest for week ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
          details: {
            metrics: digest.metrics,
            emailSent: prefs?.email ? true : false,
          },
        } as any);

        results.workspacesProcessed++;

      } catch (workspaceError) {
        const errorMsg = `Error processing workspace ${workspace.id}: ${workspaceError instanceof Error ? workspaceError.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);

        // Log failed run
        await supabase.from('automation_logs' as any).insert({
          workspace_id: workspace.id,
          job_type: 'weekly_digest',
          status: 'failed',
          summary: errorMsg,
          details: { error: errorMsg },
        } as any);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly digest generation completed',
      results,
      executionTime: `${Date.now() - startTime}ms`,
    });

  } catch (error) {
    console.error('Weekly digest error:', error);
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
