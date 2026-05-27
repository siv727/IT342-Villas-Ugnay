import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, Truck, Banknote, ArrowRight } from 'lucide-react';
import useAuthStore from '../../../features/auth/store';
import { StatCard } from '../../../shared/components/ui/Card';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import sampleRequestApi from '../../../features/sample-request/api';
import productApi from '../../../features/product/api';
import useSSE from '../../../shared/hooks/useSSE';
import toast from 'react-hot-toast';

interface RequestItem {
  id: number;
  status: string;
  createdAt: string;
  deliveryFee?: number;
  items?: { productName?: string }[];
}

export default function ManufacturerDashboard() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activeProducts, setActiveProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sampleRequestApi.getSampleRequests();
      const body = res?.data;
      if (body?.success && body.data?.items) setRequests(body.data.items);
    } catch { /* empty state */ }
    try {
      const res = await productApi.getMyProducts();
      const body = res?.data;
      if (body?.success && body.data?.items) setActiveProducts(body.data.items.length);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time updates via SSE
  useSSE((event) => {
    toast(`Request #${event.requestId} → ${event.status}`, { icon: '🔔' });
    fetchData();
  });

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;

  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;
  const activeShipments = requests.filter((r) => r.status === 'SHIPPED').length;
  const totalRevenue = requests
    .filter((r) => ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.deliveryFee) || 0), 0);

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-[32px] font-bold text-neutral-900">Welcome back, {user?.role === 'manufacturer' ? 'Manufacturer' : 'User'} &#128075;</h1>
        <p className="text-sm text-neutral-400 mt-1">{today}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Active Products" value={activeProducts} />
        <StatCard icon={ClipboardList} label="Pending Requests" value={pendingRequests} />
        <StatCard icon={Truck} label="Active Shipments" value={activeShipments} />
        <StatCard icon={Banknote} label="Revenue" value={`₱${totalRevenue.toLocaleString()}`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Requests</h2>
            <Link to="/manufacturer/requests" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-neutral-400">No incoming requests yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentRequests.map((req) => {
                const firstItem = req.items?.[0];
                return (
                  <li key={req.id}>
                    <Link to={`/manufacturer/requests/${req.id}`} className="flex items-center justify-between hover:bg-neutral-50 p-2 rounded-lg transition-colors -mx-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{firstItem?.productName || `Request #${req.id}`}</p>
                        <p className="text-xs text-neutral-400">{req.items?.length || 0} item(s)</p>
                      </div>
                      <Badge status={req.status.toLowerCase()}>{req.status}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/manufacturer/products/add"><Button variant="accent" fullWidth className="mb-3"><Package className="h-4 w-4" /> Add New Product</Button></Link>
            <Link to="/manufacturer/requests"><Button variant="secondary" fullWidth className="mb-3"><ClipboardList className="h-4 w-4" /> View Requests</Button></Link>
            <Link to="/manufacturer/shipments"><Button variant="secondary" fullWidth><Truck className="h-4 w-4" /> Manage Shipments</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
