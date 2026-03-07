import { Link } from 'react-router-dom';
import { Package, ClipboardList, Truck, DollarSign, ArrowRight } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import useAuthStore from '../../stores/authStore';
import { StatCard } from '../../components/ui/Card';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function ManufacturerDashboard() {
  const { user } = useAuthStore();
  const { products, manufacturerRequests, shipments } = useAppStore();

  const myProducts = products.filter((p) => p.manufacturerId === 101);
  const activeProducts = myProducts.filter((p) => p.active).length;
  const pendingRequests = manufacturerRequests.filter((r) => r.status === 'Pending').length;
  const activeShipments = shipments.filter((s) => s.status !== 'Delivered').length;
  const totalRevenue = manufacturerRequests
    .filter((r) => r.paymentStatus === 'Paid')
    .reduce((sum, r) => sum + r.total, 0);

  const recentRequests = [...manufacturerRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-[32px] font-bold text-neutral-900">
          Welcome back, {user?.role === 'manufacturer' ? 'Manufacturer' : 'User'} &#128075;
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Active Products" value={activeProducts} />
        <StatCard icon={ClipboardList} label="Pending Requests" value={pendingRequests} />
        <StatCard icon={Truck} label="Active Shipments" value={activeShipments} />
        <StatCard icon={DollarSign} label="Revenue" value={`₱${totalRevenue.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent incoming requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Requests</h2>
            <Link to="/manufacturer/requests" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-neutral-400">No incoming requests yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentRequests.map((req) => (
                <li key={req.id}>
                  <Link
                    to={`/manufacturer/requests/${req.id}`}
                    className="flex items-center justify-between hover:bg-neutral-50 p-2 rounded-lg transition-colors -mx-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{req.productName}</p>
                      <p className="text-xs text-neutral-400">{req.vendorName}</p>
                    </div>
                    <Badge status={req.status.toLowerCase().replace(' ', '-')}>
                      {req.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/manufacturer/products/add">
              <Button variant="accent" fullWidth className="mb-3">
                <Package className="h-4 w-4" /> Add New Product
              </Button>
            </Link>
            <Link to="/manufacturer/requests">
              <Button variant="secondary" fullWidth className="mb-3">
                <ClipboardList className="h-4 w-4" /> View Requests
              </Button>
            </Link>
            <Link to="/manufacturer/shipments">
              <Button variant="secondary" fullWidth>
                <Truck className="h-4 w-4" /> Manage Shipments
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
