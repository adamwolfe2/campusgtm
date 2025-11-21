import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllAmbassadorStats } from '@/app/actions/attribution';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

export default async function AmbassadorAdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Check if user has admin/CEO role
  // TODO: Get workspaceId from user's current workspace
  const workspaceId = 'default-workspace'; // Replace with actual workspace logic

  // Get all ambassador stats
  const allStats = await getAllAmbassadorStats(workspaceId);

  // Calculate totals
  const totals = allStats.reduce(
    (acc, stat) => ({
      clicks: acc.clicks + stat.total_clicks,
      signups: acc.signups + stat.total_signups,
      conversions: acc.conversions + stat.total_conversions,
      revenue: acc.revenue + stat.total_revenue,
    }),
    { clicks: 0, signups: 0, conversions: 0, revenue: 0 }
  );

  const avgConversionRate =
    allStats.length > 0
      ? allStats.reduce((sum, s) => sum + (s.conversion_rate || 0), 0) / allStats.length
      : 0;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ambassador Program Dashboard</h1>
        <p className="text-muted-foreground">
          Track performance across all growth ambassadors
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {allStats.length} ambassadors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.signups.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgConversionRate.toFixed(1)}% avg conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.conversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.signups > 0
                ? ((totals.conversions / totals.signups) * 100).toFixed(1)
                : 0}
              % of signups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${totals.conversions > 0 ? (totals.revenue / totals.conversions).toFixed(2) : 0} avg per conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ambassador Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Ambassador Leaderboard</CardTitle>
          <CardDescription>Ranked by total revenue generated</CardDescription>
        </CardHeader>
        <CardContent>
          {allStats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No ambassador data yet. Start inviting growth ambassadors!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Signups</TableHead>
                  <TableHead className="text-right">Conv %</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStats.map((stat, index) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {stat.referral_code}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">{stat.total_clicks}</TableCell>
                    <TableCell className="text-right">{stat.total_signups}</TableCell>
                    <TableCell className="text-right">
                      {stat.conversion_rate?.toFixed(1) || 0}%
                    </TableCell>
                    <TableCell className="text-right">{stat.total_conversions}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${stat.total_revenue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.total_conversions > 0 ? (
                        <Badge variant="default">Active</Badge>
                      ) : stat.total_signups > 0 ? (
                        <Badge variant="secondary">Converting</Badge>
                      ) : stat.total_clicks > 0 ? (
                        <Badge variant="outline">Clicks Only</Badge>
                      ) : (
                        <Badge variant="outline">New</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {allStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Most Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const top = [...allStats].sort((a, b) => b.total_clicks - a.total_clicks)[0];
                return top ? (
                  <div>
                    <p className="text-2xl font-bold">{top.total_clicks}</p>
                    <p className="text-sm text-muted-foreground">{top.referral_code}</p>
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Best Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const top = [...allStats]
                  .filter(s => s.total_clicks > 10) // Min 10 clicks for fair comparison
                  .sort((a, b) => (b.conversion_rate || 0) - (a.conversion_rate || 0))[0];
                return top ? (
                  <div>
                    <p className="text-2xl font-bold">{top.conversion_rate?.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">{top.referral_code}</p>
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Highest Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const top = [...allStats].sort((a, b) => b.total_revenue - a.total_revenue)[0];
                return top ? (
                  <div>
                    <p className="text-2xl font-bold">${top.total_revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{top.referral_code}</p>
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
