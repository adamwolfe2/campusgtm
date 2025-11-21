import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      code,
      userAgent,
      referer,
      landingPage,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType,
    } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Get referral_code_id
    const { data: refCode, error: refCodeError } = (await supabase
      .from('referral_codes' as any)
      .select('id')
      .eq('code', code)
      .eq('is_active', true)
      .single()) as any;

    if (refCodeError || !refCode) {
      console.error('Invalid referral code:', code, refCodeError);
      return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    }

    // Parse user agent for browser/OS
    const browser = extractBrowser(userAgent || '');
    const os = extractOS(userAgent || '');

    // Log click
    const { error: insertError } = (await supabase
      .from('referral_clicks' as any)
      .insert({
        referral_code_id: refCode.id,
        code,
        user_agent: userAgent,
        referrer: referer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        landing_page: landingPage,
        device_type: deviceType,
        browser,
        os,
      } as any)) as any;

    if (insertError) {
      console.error('Failed to insert click:', insertError);
      return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }

    // Update ambassador stats (async, don't block response)
    updateStatsAsync(code).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}

// Update stats asynchronously
async function updateStatsAsync(code: string) {
  try {
    await supabase.rpc('update_ambassador_stats_for_code', { p_code: code });
  } catch (error) {
    console.error('Stats update failed:', error);
  }
}

// Extract browser from user agent
function extractBrowser(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Other';
}

// Extract OS from user agent
function extractOS(ua: string): string {
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}
