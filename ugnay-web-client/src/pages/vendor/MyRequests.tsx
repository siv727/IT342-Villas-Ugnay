import { Link } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import useAppStore from '../../stores/appStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import type { VendorRequest } from '../../data/mockData';

export default function MyRequests() {
  const { vendorRequests } = useAppStore();

  if (!vendorRequests || vendorRequests.length === 0) {
    return <EmptyState title="You haven't created any requests yet." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Requests</h1>
      <div className="grid gap-4">
        {vendorRequests.map((r: VendorRequest) => (
          <Card key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-500">#{r.id} · {r.productName}</div>
              <div className="font-medium">{r.vendorName} · {r.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/vendor/requests/${r.id}`}>
                <Button>View</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
