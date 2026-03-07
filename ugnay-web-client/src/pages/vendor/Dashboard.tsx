import { Link } from 'react-router-dom';
import { Calendar, Bookmark, CreditCard, CheckCircle } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useAppStore from '../../stores/appStore';
import { StatCard } from '../../components/ui/Card';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function VendorDashboard() {
  const user = useAuthStore((s) => s.user);
  const requests = useAppStore((s) => s.vendorRequests);
  const manufacturers = useAppStore((s) => s.manufacturers);

  const stats = {
    active: requests.filter((r) => ['Pending', 'Approved', 'In Transit'].includes(r.status)).length,
    saved: manufacturers.filter((m) => m.saved).length,
    pendingPayments: requests.filter((r) => r.status === 'Approved' && r.paymentStatus !== 'Paid').length,
    completed: requests.filter((r) => r.status === 'Completed').length,
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Calendar} value={stats.active} label="Active Requests" iconColor="text-primary" />
        <StatCard icon={Bookmark} value={stats.saved} label="Saved Manufacturers" iconColor="text-accent" />
        <StatCard icon={CreditCard} value={stats.pendingPayments} label="Pending Payments" iconColor="text-warning" />
        <StatCard icon={CheckCircle} value={stats.completed} label="Completed Requests" iconColor="text-success" />
      </div>

      {/* Recent requests */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Sample Requests</h2>
          <Link to="/vendor/requests" className="text-sm text-primary hover:underline font-medium">
            View all &rarr;
          </Link>
        </div>
        <div className="space-y-3">
          {recentRequests.map((req) => (
            <Link
              key={req.id}
              to={`/vendor/requests/${req.id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{req.productName}</p>
                <p className="text-xs text-neutral-400">{req.manufacturerName}</p>
              </div>
              <div className="text-right mx-4 hidden sm:block">
                <p className="text-sm font-semibold text-primary">&peso; {req.total.toLocaleString()}</p>
                <p className="text-xs text-neutral-400">{req.quantity} {req.unit}(s)</p>
              </div>
              <div className="text-right">
                <Badge status={req.status.toLowerCase().replace(' ', '-')} />
                <p className="text-xs text-neutral-400 mt-1">{req.createdAt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/vendor/discover">
          <Button>Discover Manufacturers</Button>
        </Link>
        <Link to="/vendor/requests">
          <Button variant="secondary">View My Requests</Button>
        </Link>
      </div>
    </div>
  );
}
