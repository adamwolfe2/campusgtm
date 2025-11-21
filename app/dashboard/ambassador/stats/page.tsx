import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { getAmbassadorStats, getReferralCode } from '@/app/actions/attribution';

export default async function AmbassadorStatsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Get workspaceId from user's current workspace
  const workspaceId = 'default-workspace'; // Replace with actual workspace logic

  // Get referral code and stats
  const refCode = await getReferralCode(userId, workspaceId);
  const stats = await getAmbassadorStats(userId, workspaceId);

  const shareableLink = refCode
    ? `${process.env.NEXT_PUBLIC_APP_URL}?ref=${refCode.code}`
    : null;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Performance</h1>
        <p className="text-muted-foreground">
          Track your referral link performance and earnings
        </p>
      </div>

      {/* Shareable Link */}
      {shareableLink && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link to track signups and earn commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                value={shareableLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareableLink);
                  // TODO: Add toast notification
                }}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" asChild>
                <a href={shareableLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test
                </a>
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Your code: <code className="font-mono bg-muted px-2 py-1 rounded">{refCode.code}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clicks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              People who clicked your link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_signups || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.conversion_rate?.toFixed(1) || 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_conversions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.signup_to_paid_rate?.toFixed(1) || 0}% of signups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.total_revenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total attributed revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>How visitors progress through your funnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Clicks</span>
                <span className="font-medium">{stats?.total_clicks || 0}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Signups</span>
                <span className="font-medium">{stats?.total_signups || 0}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${stats?.conversion_rate || 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Paid Conversions</span>
                <span className="font-medium">{stats?.total_conversions || 0}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${stats?.signup_to_paid_rate || 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time to Convert</CardTitle>
            <CardDescription>Average time from click to action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Click → Signup</p>
                <p className="text-xs text-muted-foreground">Average conversion time</p>
              </div>
              <div className="text-2xl font-bold">
                {stats?.avg_days_to_signup?.toFixed(1) || '0'} days
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Signup → Paid</p>
                <p className="text-xs text-muted-foreground">Average upgrade time</p>
              </div>
              <div className="text-2xl font-bold">
                {stats?.avg_days_to_conversion?.toFixed(1) || '0'} days
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest tracked events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.last_click_at && (
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium">Last Click</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(stats.last_click_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {stats?.last_signup_at && (
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Last Signup</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(stats.last_signup_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {stats?.last_conversion_at && (
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div>
                  <p className="text-sm font-medium">Last Conversion</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(stats.last_conversion_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {!stats?.last_click_at && !stats?.last_signup_at && !stats?.last_conversion_at && (
              <p className="text-sm text-muted-foreground">
                No activity yet. Start sharing your link to track results!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
