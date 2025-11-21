/**
 * Tracking Links Service
 * Manages ambassador tracking links and analytics
 */

import { supabase } from './supabase';
import type { Database } from './types';

type TrackingLink = Database['public']['Tables']['tracking_links']['Row'];
type TrackingLinkInsert = Database['public']['Tables']['tracking_links']['Insert'];
type TrackingLinkUpdate = Database['public']['Tables']['tracking_links']['Update'];
type LinkClick = Database['public']['Tables']['link_clicks']['Row'];
type LinkSignup = Database['public']['Tables']['link_signups']['Row'];

export interface TrackingLinkWithStats extends TrackingLink {
  clicks: number;
  signups: number;
  conversionRate: number;
}

/**
 * Generate a random short code for tracking links
 */
function generateShortCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new tracking link
 */
export async function createTrackingLink(
  userId: string,
  fullUrl: string,
  options?: {
    title?: string;
    description?: string;
    ambassadorProgramId?: string;
    shortCode?: string;
  }
): Promise<TrackingLink> {
  // Generate short code if not provided
  let shortCode = options?.shortCode || generateShortCode();

  // Check if short code already exists, regenerate if needed
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('tracking_links')
      .select('id')
      .eq('short_code', shortCode)
      .single();

    if (!existing) break;

    shortCode = generateShortCode();
    attempts++;
  }

  if (attempts >= 10) {
    throw new Error('Failed to generate unique short code');
  }

  const linkData: TrackingLinkInsert = {
    user_id: userId,
    short_code: shortCode,
    full_url: fullUrl,
    title: options?.title || null,
    description: options?.description || null,
    ambassador_program_id: options?.ambassadorProgramId || null,
  };

  const { data, error } = await supabase
    .from('tracking_links')
    .insert(linkData)
    .select()
    .single();

  if (error) {
    console.error('[TrackingService] Error creating tracking link:', error);
    throw new Error('Failed to create tracking link');
  }

  return data;
}

/**
 * Get all tracking links for a user
 */
export async function getTrackingLinks(
  userId: string,
  options?: {
    ambassadorProgramId?: string;
    includeInactive?: boolean;
  }
): Promise<TrackingLink[]> {
  let query = supabase
    .from('tracking_links')
    .select('*')
    .eq('user_id', userId);

  if (options?.ambassadorProgramId) {
    query = query.eq('ambassador_program_id', options.ambassadorProgramId);
  }

  if (!options?.includeInactive) {
    query = query.eq('is_active', true);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[TrackingService] Error fetching tracking links:', error);
    throw new Error('Failed to fetch tracking links');
  }

  return data || [];
}

/**
 * Get a single tracking link by short code
 */
export async function getTrackingLinkByShortCode(
  shortCode: string
): Promise<TrackingLink | null> {
  const { data, error } = await supabase
    .from('tracking_links')
    .select('*')
    .eq('short_code', shortCode)
    .single();

  if (error) {
    console.error('[TrackingService] Error fetching tracking link:', error);
    return null;
  }

  return data;
}

/**
 * Update a tracking link
 */
export async function updateTrackingLink(
  linkId: string,
  updates: TrackingLinkUpdate
): Promise<TrackingLink> {
  const { data, error } = await supabase
    .from('tracking_links')
    .update(updates)
    .eq('id', linkId)
    .select()
    .single();

  if (error) {
    console.error('[TrackingService] Error updating tracking link:', error);
    throw new Error('Failed to update tracking link');
  }

  return data;
}

/**
 * Delete a tracking link
 */
export async function deleteTrackingLink(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('tracking_links')
    .delete()
    .eq('id', linkId);

  if (error) {
    console.error('[TrackingService] Error deleting tracking link:', error);
    throw new Error('Failed to delete tracking link');
  }
}

/**
 * Record a click on a tracking link
 */
export async function recordLinkClick(
  linkId: string,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  }
): Promise<LinkClick> {
  const { data, error } = await supabase
    .from('link_clicks')
    .insert({
      link_id: linkId,
      ip_address: metadata?.ipAddress || null,
      user_agent: metadata?.userAgent || null,
      referrer: metadata?.referrer || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[TrackingService] Error recording click:', error);
    throw new Error('Failed to record click');
  }

  return data;
}

/**
 * Record a signup/conversion from a tracking link
 */
export async function recordLinkSignup(
  linkId: string,
  signupData: {
    email?: string;
    fullName?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<LinkSignup> {
  const { data, error } = await supabase
    .from('link_signups')
    .insert({
      link_id: linkId,
      email: signupData.email || null,
      full_name: signupData.fullName || null,
      metadata: signupData.metadata || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[TrackingService] Error recording signup:', error);
    throw new Error('Failed to record signup');
  }

  return data;
}

/**
 * Get tracking link statistics
 */
export async function getTrackingLinkStats(
  linkId: string
): Promise<{
  clicks: number;
  signups: number;
  conversionRate: number;
  recentClicks: LinkClick[];
  recentSignups: LinkSignup[];
}> {
  // Get click count
  const { count: clickCount } = await supabase
    .from('link_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('link_id', linkId);

  // Get signup count
  const { count: signupCount } = await supabase
    .from('link_signups')
    .select('*', { count: 'exact', head: true })
    .eq('link_id', linkId);

  // Get recent clicks (last 10)
  const { data: recentClicks } = await supabase
    .from('link_clicks')
    .select('*')
    .eq('link_id', linkId)
    .order('clicked_at', { ascending: false })
    .limit(10);

  // Get recent signups (last 10)
  const { data: recentSignups } = await supabase
    .from('link_signups')
    .select('*')
    .eq('link_id', linkId)
    .order('signed_up_at', { ascending: false })
    .limit(10);

  const clicks = clickCount || 0;
  const signups = signupCount || 0;
  const conversionRate = clicks > 0 ? (signups / clicks) * 100 : 0;

  return {
    clicks,
    signups,
    conversionRate,
    recentClicks: recentClicks || [],
    recentSignups: recentSignups || [],
  };
}

/**
 * Get all tracking links with statistics for a user
 */
export async function getTrackingLinksWithStats(
  userId: string,
  options?: {
    ambassadorProgramId?: string;
    includeInactive?: boolean;
  }
): Promise<TrackingLinkWithStats[]> {
  const links = await getTrackingLinks(userId, options);

  const linksWithStats = await Promise.all(
    links.map(async (link) => {
      const stats = await getTrackingLinkStats(link.id);
      return {
        ...link,
        clicks: stats.clicks,
        signups: stats.signups,
        conversionRate: stats.conversionRate,
      };
    })
  );

  return linksWithStats;
}

/**
 * Get signups for a specific tracking link
 */
export async function getLinkSignups(
  linkId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<LinkSignup[]> {
  let query = supabase
    .from('link_signups')
    .select('*')
    .eq('link_id', linkId)
    .order('signed_up_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[TrackingService] Error fetching signups:', error);
    throw new Error('Failed to fetch signups');
  }

  return data || [];
}
