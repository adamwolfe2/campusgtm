'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { AmbassadorStats, ReferralCode } from '@/types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Create a referral code for an ambassador
 */
export async function createReferralCode(
  ambassadorId: string,
  workspaceId: string,
  firstName: string,
  companySlug: string
): Promise<{ code: string; shareableLink: string } | null> {
  try {
    // Generate code: john-acme
    const code = `${firstName.toLowerCase()}-${companySlug.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');

    // Check if code already exists
    const { data: existing } = (await supabase
      .from('referral_codes' as any)
      .select('code')
      .eq('code', code)
      .single()) as any;

    if (existing) {
      // Code exists, add a number
      const timestamp = Date.now().toString().slice(-4);
      const uniqueCode = `${code}-${timestamp}`;

      const { error } = (await supabase
        .from('referral_codes' as any)
        .insert({
          ambassador_id: ambassadorId,
          workspace_id: workspaceId,
          code: uniqueCode,
          is_active: true,
        } as any)
        .select()
        .single()) as any;

      if (error) throw error;

      return {
        code: uniqueCode,
        shareableLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${uniqueCode}`,
      };
    }

    // Insert new referral code
    const { error } = (await supabase
      .from('referral_codes' as any)
      .insert({
        ambassador_id: ambassadorId,
        workspace_id: workspaceId,
        code,
        is_active: true,
      } as any)
      .select()
      .single()) as any;

    if (error) throw error;

    return {
      code,
      shareableLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${code}`,
    };
  } catch (error) {
    console.error('Create referral code error:', error);
    return null;
  }
}

/**
 * Get referral code for an ambassador
 */
export async function getReferralCode(
  ambassadorId: string,
  workspaceId: string
): Promise<ReferralCode | null> {
  try {
    const { data, error } = (await supabase
      .from('referral_codes' as any)
      .select('*')
      .eq('ambassador_id', ambassadorId)
      .eq('workspace_id', workspaceId)
      .single()) as any;

    if (error) throw error;

    return data ? {
      id: data.id,
      ambassador_id: data.ambassador_id,
      workspace_id: data.workspace_id,
      code: data.code,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } : null;
  } catch (error) {
    console.error('Get referral code error:', error);
    return null;
  }
}

/**
 * Get ambassador stats
 */
export async function getAmbassadorStats(
  ambassadorId: string,
  workspaceId: string
): Promise<AmbassadorStats | null> {
  try {
    const { data, error } = (await supabase
      .from('ambassador_stats' as any)
      .select('*')
      .eq('ambassador_id', ambassadorId)
      .eq('workspace_id', workspaceId)
      .single()) as any;

    if (error) {
      // Stats don't exist yet - return empty stats
      return {
        id: '',
        ambassador_id: ambassadorId,
        workspace_id: workspaceId,
        referral_code: '',
        total_clicks: 0,
        total_signups: 0,
        total_conversions: 0,
        total_revenue: 0,
        conversion_rate: null,
        signup_to_paid_rate: null,
        avg_days_to_signup: null,
        avg_days_to_conversion: null,
        last_click_at: null,
        last_signup_at: null,
        last_conversion_at: null,
        last_updated: new Date().toISOString(),
      };
    }

    return {
      id: data.id,
      ambassador_id: data.ambassador_id,
      workspace_id: data.workspace_id,
      referral_code: data.referral_code,
      total_clicks: data.total_clicks || 0,
      total_signups: data.total_signups || 0,
      total_conversions: data.total_conversions || 0,
      total_revenue: parseFloat(data.total_revenue || 0),
      conversion_rate: data.conversion_rate ? parseFloat(data.conversion_rate) : null,
      signup_to_paid_rate: data.signup_to_paid_rate ? parseFloat(data.signup_to_paid_rate) : null,
      avg_days_to_signup: data.avg_days_to_signup ? parseFloat(data.avg_days_to_signup) : null,
      avg_days_to_conversion: data.avg_days_to_conversion ? parseFloat(data.avg_days_to_conversion) : null,
      last_click_at: data.last_click_at,
      last_signup_at: data.last_signup_at,
      last_conversion_at: data.last_conversion_at,
      last_updated: data.last_updated,
    };
  } catch (error) {
    console.error('Get ambassador stats error:', error);
    return null;
  }
}

/**
 * Get all ambassador stats for a workspace (CEO dashboard)
 */
export async function getAllAmbassadorStats(
  workspaceId: string
): Promise<AmbassadorStats[]> {
  try {
    const { data, error } = (await supabase
      .from('ambassador_stats' as any)
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('total_revenue', { ascending: false })) as any;

    if (error) throw error;

    return (data || []).map((d: any) => ({
      id: d.id,
      ambassador_id: d.ambassador_id,
      workspace_id: d.workspace_id,
      referral_code: d.referral_code,
      total_clicks: d.total_clicks || 0,
      total_signups: d.total_signups || 0,
      total_conversions: d.total_conversions || 0,
      total_revenue: parseFloat(d.total_revenue || 0),
      conversion_rate: d.conversion_rate ? parseFloat(d.conversion_rate) : null,
      signup_to_paid_rate: d.signup_to_paid_rate ? parseFloat(d.signup_to_paid_rate) : null,
      avg_days_to_signup: d.avg_days_to_signup ? parseFloat(d.avg_days_to_signup) : null,
      avg_days_to_conversion: d.avg_days_to_conversion ? parseFloat(d.avg_days_to_conversion) : null,
      last_click_at: d.last_click_at,
      last_signup_at: d.last_signup_at,
      last_conversion_at: d.last_conversion_at,
      last_updated: d.last_updated,
    }));
  } catch (error) {
    console.error('Get all ambassador stats error:', error);
    return [];
  }
}

/**
 * Track signup attribution (call this when user signs up)
 */
export async function trackSignupAttribution(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  try {
    // Check for referral cookie
    const cookieStore = cookies();
    const refCode = cookieStore.get('cgm_ref')?.value;

    if (!refCode) {
      return false; // No attribution
    }

    // Get referral code details
    const { data: refCodeData } = (await supabase
      .from('referral_codes' as any)
      .select('id, ambassador_id, workspace_id')
      .eq('code', refCode)
      .eq('is_active', true)
      .single()) as any;

    if (!refCodeData) {
      return false; // Invalid code
    }

    // Get most recent click for this code
    const { data: click } = (await supabase
      .from('referral_clicks' as any)
      .select('id, clicked_at')
      .eq('code', refCode)
      .order('clicked_at', { ascending: false })
      .limit(1)
      .single()) as any;

    const daysToConvert = click
      ? Math.floor((Date.now() - new Date(click.clicked_at).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Attribute signup
    const { error } = (await supabase
      .from('attributed_signups' as any)
      .insert({
        user_id: userId,
        referral_code_id: refCodeData.id,
        code: refCode,
        ambassador_id: refCodeData.ambassador_id,
        workspace_id: refCodeData.workspace_id,
        click_id: click?.id,
        days_to_convert: daysToConvert,
      } as any)) as any;

    if (error) {
      console.error('Attribution insert error:', error);
      return false;
    }

    // Update stats (async)
    updateStatsAsync(refCode).catch(console.error);

    // Clear cookie
    cookieStore.delete('cgm_ref');

    return true;
  } catch (error) {
    console.error('Track signup attribution error:', error);
    return false;
  }
}

/**
 * Track conversion (call this when user upgrades to paid)
 */
export async function trackConversion(
  userId: string,
  conversionType: 'trial_start' | 'paid_subscription' | 'one_time_purchase',
  revenueAmount?: number,
  planName?: string,
  billingInterval?: string
): Promise<boolean> {
  try {
    // Get signup attribution
    const { data: signup } = (await supabase
      .from('attributed_signups' as any)
      .select('*')
      .eq('user_id', userId)
      .single()) as any;

    if (!signup) {
      return false; // No attribution to track
    }

    const daysToConvert = Math.floor(
      (Date.now() - new Date(signup.signed_up_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Insert conversion
    const { error } = (await supabase
      .from('attributed_conversions' as any)
      .insert({
        signup_id: signup.id,
        user_id: userId,
        referral_code_id: signup.referral_code_id,
        code: signup.code,
        ambassador_id: signup.ambassador_id,
        workspace_id: signup.workspace_id,
        conversion_type: conversionType,
        revenue_amount: revenueAmount,
        plan_name: planName,
        billing_interval: billingInterval,
        days_to_convert: daysToConvert,
      } as any)) as any;

    if (error) {
      console.error('Conversion insert error:', error);
      return false;
    }

    // Update stats (async)
    updateStatsAsync(signup.code).catch(console.error);

    return true;
  } catch (error) {
    console.error('Track conversion error:', error);
    return false;
  }
}

// Helper: Update stats asynchronously
async function updateStatsAsync(code: string) {
  try {
    await supabase.rpc('update_ambassador_stats_for_code', { p_code: code });
  } catch (error) {
    console.error('Stats update failed:', error);
  }
}
