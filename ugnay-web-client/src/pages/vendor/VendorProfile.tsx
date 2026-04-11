import useAuthStore from '../../stores/authStore';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import useAppStore from '../../stores/appStore';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import type { VendorRequest, Manufacturer } from '../../data/mockData';

export default function VendorProfile() {
  const { user } = useAuthStore();
  const { vendorRequests, manufacturers } = useAppStore();

  if (!user) return <EmptyState title="Profile not available" />;

  const myRequests: VendorRequest[] = vendorRequests.filter((r) => r.vendorId === user.userId || r.vendorName === (user as any).businessName);
  const savedManufacturers: Manufacturer[] = manufacturers.filter((m) => m.saved);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Link to="/vendor/discover"><Button variant="secondary">Discover Manufacturers</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="space-y-2">
            <div><strong>User ID:</strong> {user.userId}</div>
            <div><strong>Role:</strong> {user.role}</div>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="font-semibold">Recent Requests</div>
            {myRequests.length === 0 ? <div className="text-sm text-neutral-500">No requests yet</div> : (
              <ul className="text-sm">
                {myRequests.slice(0, 5).map((r) => (
                  <li key={r.id} className="py-1">#{r.id} · {r.productName} · <span className="text-neutral-500">{r.status}</span></li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <div className="font-semibold">Saved Manufacturers</div>
            {savedManufacturers.length === 0 ? <div className="text-sm text-neutral-500">No saved manufacturers</div> : (
              <ul className="text-sm">
                {savedManufacturers.map((m) => (
                  <li key={m.id} className="py-1">{m.businessName} · {m.city}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
