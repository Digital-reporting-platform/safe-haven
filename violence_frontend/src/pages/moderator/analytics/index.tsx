import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { moderatorWorkflowService } from '@/services/moderatorWorkflowService';

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    totalModerated: number;
    forumByStatus: Array<{ status: string; count: number }>;
    usersByStatus: Array<{ status: string; count: number }>;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const value = await moderatorWorkflowService.getAnalytics();
        setData(value);
      } catch (error: any) {
        console.error('Failed to load moderator analytics', error);
        toast.error(error?.message || 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20 font-sans moderator-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Analytics</h1>
          <p className="text-muted-foreground">Live moderation analytics from backend.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card><CardContent className="pt-6"><p className="text-sm">Total Moderated</p><h2 className="text-2xl font-bold">{data?.totalModerated || 0}</h2></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm">Forum Status Buckets</p><h2 className="text-2xl font-bold">{data?.forumByStatus.length || 0}</h2></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm">User Status Buckets</p><h2 className="text-2xl font-bold">{data?.usersByStatus.length || 0}</h2></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Forum Content by Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {isLoading && <div className="text-muted-foreground text-sm">Loading...</div>}
              {(data?.forumByStatus || []).map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded border p-2">
                  <span>{item.status}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Users by Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {isLoading && <div className="text-muted-foreground text-sm">Loading...</div>}
              {(data?.usersByStatus || []).map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded border p-2">
                  <span>{item.status}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
