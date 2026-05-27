import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bookmark, CreditCard, CheckCircle } from 'lucide-react';
import useAuthStore from '../../../features/auth/store';
import { StatCard } from '../../../shared/components/ui/Card';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import sampleRequestApi from '../../../features/sample-request/api';
import connectionApi from '../../../features/connection/api';
import useSSE from '../../../shared/hooks/useSSE';
import toast from 'react-hot-toast';

interface RequestItem {
  id: number;
  status: string;
  createdAt: string;
  items?: { productName?: string; quantity?: number }[];
}

export default function VendorDashboard() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sampleRequestApi.getSampleRequests();
      const body = res?.data;
      if (body?.success && body.data?.items) setRequests(body.data.items);
    } catch { /* empty state */ }

    try {
      const res = await connectionApi.getConnections();
      const body = res?.data;
      if (body?.success && body.data?.items) setSavedCount(body.data.items.length);
    } catch { /* empty state */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time updates via SSE
  useSSE((event) => {
    toast(`Request #${event.requestId} → ${event.status}`, { icon: '🔔' });
    fetchData();
  });

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;

  const stats = {
    active: requests.filter((r) => ['PENDING', 'APPROVED', 'SHIPPED'].includes(r.status)).length,
    saved: savedCount,
    pendingPayments: requests.filter((r) => r.status === 'APPROVED').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
  };

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-neutral-900">
          Welcome back, {user?.role === 'vendor' ? 'Vendor' : 'User'}!
        </h1>
        <p className="text-sm text-neutral-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Calendar} value={stats.active} label="Active Requests" iconColor="text-primary" />
        <StatCard icon={Bookmark} value={stats.saved} label="Saved Manufacturers" iconColor="text-accent" />
        <StatCard icon={CreditCard} value={stats.pendingPayments} label="Pending Payments" iconColor="text-warning" />
        <StatCard icon={CheckCircle} value={stats.completed} label="Completed Requests" iconColor="text-success" />
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Sample Requests</h2>
          <Link to="/vendor/requests" className="text-sm text-primary hover:underline font-medium">View all &rarr;</Link>
        </div>
        <div className="space-y-3">
          {recentRequests.length === 0 ? (
            <p className="text-sm text-neutral-400">No requests yet. Start by discovering manufacturers.</p>
          ) : (
            recentRequests.map((req) => {
              const firstItem = req.items?.[0];
              return (
                <Link
                  key={req.id}
                  to={`/vendor/requests/${req.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {firstItem?.productName || `Request #${req.id}`}
                    </p>
                    <p className="text-xs text-neutral-400">{req.items?.length || 0} item(s)</p>
                  </div>
                  <div className="text-right">
                    <Badge status={req.status.toLowerCase()} />
                    <p className="text-xs text-neutral-400 mt-1">{new Date(req.createdAt).toLocaleDateString('en-PH')}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/vendor/discover"><Button>Discover Manufacturers</Button></Link>
        <Link to="/vendor/requests"><Button variant="secondary">View My Requests</Button></Link>
      </div>
    </div>
  );
}
