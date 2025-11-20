"use server";

import { createSupabaseClient } from "@/lib/database/supabase";

/**
 * Automation Preferences
 */
export interface AutomationPreferences {
  id?: string;
  workspaceId: string;
  email?: string;
  enableDailyDigest: boolean;
  enableWeeklyDigest: boolean;
  enableAlerts: boolean;
  preferredSendTime: string; // HH:MM format
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Scheduled Monitor
 */
export interface ScheduledMonitor {
  id?: string;
  workspaceId: string;
  monitorType: 'keyword' | 'community' | 'competitor';
  config: Record<string, any>;
  frequency: 'hourly' | 'every_6_hours' | 'daily' | 'weekly';
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Automation Log
 */
export interface AutomationLog {
  id: string;
  workspaceId: string;
  jobType: 'daily_scan' | 'weekly_digest' | 'competitor_monitor';
  status: 'success' | 'failed' | 'partial';
  summary: string;
  details: Record<string, any>;
  executedAt: Date;
}

/**
 * Get automation preferences for a workspace
 */
export async function getAutomationPreferences(
  workspaceId: string
): Promise<AutomationPreferences | null> {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data, error } = await supabase
      .from('automation_preferences')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return defaults
        return {
          workspaceId,
          enableDailyDigest: false,
          enableWeeklyDigest: false,
          enableAlerts: true,
          preferredSendTime: '09:00',
          timezone: 'UTC',
        };
      }
      throw error;
    }

    return {
      id: data.id,
      workspaceId: data.workspace_id,
      email: data.email,
      enableDailyDigest: data.enable_daily_digest,
      enableWeeklyDigest: data.enable_weekly_digest,
      enableAlerts: data.enable_alerts,
      preferredSendTime: data.preferred_send_time,
      timezone: data.timezone,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Get automation preferences error:', error);
    throw new Error(`Failed to get automation preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update automation preferences for a workspace
 */
export async function updateAutomationPreferences(
  workspaceId: string,
  preferences: Partial<AutomationPreferences>
): Promise<AutomationPreferences> {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new Error('Database not configured');
    }

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('automation_preferences')
      .select('id')
      .eq('workspace_id', workspaceId)
      .single();

    const updateData = {
      workspace_id: workspaceId,
      email: preferences.email,
      enable_daily_digest: preferences.enableDailyDigest,
      enable_weekly_digest: preferences.enableWeeklyDigest,
      enable_alerts: preferences.enableAlerts,
      preferred_send_time: preferences.preferredSendTime,
      timezone: preferences.timezone,
    };

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('automation_preferences')
        .update(updateData)
        .eq('workspace_id', workspaceId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        workspaceId: data.workspace_id,
        email: data.email,
        enableDailyDigest: data.enable_daily_digest,
        enableWeeklyDigest: data.enable_weekly_digest,
        enableAlerts: data.enable_alerts,
        preferredSendTime: data.preferred_send_time,
        timezone: data.timezone,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('automation_preferences')
        .insert(updateData)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        workspaceId: data.workspace_id,
        email: data.email,
        enableDailyDigest: data.enable_daily_digest,
        enableWeeklyDigest: data.enable_weekly_digest,
        enableAlerts: data.enable_alerts,
        preferredSendTime: data.preferred_send_time,
        timezone: data.timezone,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    }
  } catch (error) {
    console.error('Update automation preferences error:', error);
    throw new Error(`Failed to update automation preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all scheduled monitors for a workspace
 */
export async function getScheduledMonitors(
  workspaceId: string
): Promise<ScheduledMonitor[]> {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data, error } = await supabase
      .from('scheduled_monitors')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(m => ({
      id: m.id,
      workspaceId: m.workspace_id,
      monitorType: m.monitor_type as 'keyword' | 'community' | 'competitor',
      config: m.config,
      frequency: m.frequency as 'hourly' | 'every_6_hours' | 'daily' | 'weekly',
      isActive: m.is_active,
      lastRunAt: m.last_run_at ? new Date(m.last_run_at) : undefined,
      nextRunAt: m.next_run_at ? new Date(m.next_run_at) : undefined,
      createdAt: new Date(m.created_at),
      updatedAt: new Date(m.updated_at),
    }));
  } catch (error) {
    console.error('Get scheduled monitors error:', error);
    throw new Error(`Failed to get scheduled monitors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new scheduled monitor
 */
export async function createScheduledMonitor(
  workspaceId: string,
  monitor: Omit<ScheduledMonitor, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>
): Promise<ScheduledMonitor> {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data, error } = await supabase
      .from('scheduled_monitors')
      .insert({
        workspace_id: workspaceId,
        monitor_type: monitor.monitorType,
        config: monitor.config,
        frequency: monitor.frequency,
        is_active: monitor.isActive,
        last_run_at: monitor.lastRunAt?.toISOString(),
        next_run_at: monitor.nextRunAt?.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      workspaceId: data.workspace_id,
      monitorType: data.monitor_type,
      config: data.config,
      frequency: data.frequency,
      isActive: data.is_active,
      lastRunAt: data.last_run_at ? new Date(data.last_run_at) : undefined,
      nextRunAt: data.next_run_at ? new Date(data.next_run_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Create scheduled monitor error:', error);
    throw new Error(`Failed to create scheduled monitor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a scheduled monitor
 */
export async function deleteScheduledMonitor(monitorId: string): Promise<void> {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { error } = await supabase
      .from('scheduled_monitors')
      .delete()
      .eq('id', monitorId);

    if (error) throw error;
  } catch (error) {
    console.error('Delete scheduled monitor error:', error);
    throw new Error(`Failed to delete scheduled monitor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Toggle monitor active status
 */
export async function toggleMonitor(
  monitorId: string,
  isActive: boolean
): Promise<void> {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { error } = await supabase
      .from('scheduled_monitors')
      .update({ is_active: isActive })
      .eq('id', monitorId);

    if (error) throw error;
  } catch (error) {
    console.error('Toggle monitor error:', error);
    throw new Error(`Failed to toggle monitor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get automation logs for a workspace
 */
export async function getAutomationLogs(
  workspaceId: string,
  limit: number = 50
): Promise<AutomationLog[]> {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(log => ({
      id: log.id,
      workspaceId: log.workspace_id,
      jobType: log.job_type as 'daily_scan' | 'weekly_digest' | 'competitor_monitor',
      status: log.status as 'success' | 'failed' | 'partial',
      summary: log.summary || '',
      details: log.details || {},
      executedAt: new Date(log.executed_at),
    }));
  } catch (error) {
    console.error('Get automation logs error:', error);
    throw new Error(`Failed to get automation logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
