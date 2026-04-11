import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import useAppStore from '../../stores/appStore';
import Card from '../../components/ui/Card';

export default function RequestDetail() {
  const { id } = useParams();
  const { vendorRequests } = useAppStore();
  const request = useMemo(() => vendorRequests.find((r) => String(r.id) === String(id)), [vendorRequests, id]);

  if (!request) return <EmptyState title="Request not found" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Request #{request.id}</h1>
      <Card>
        <div className="space-y-2">
          <div><strong>Product:</strong> {request.productName}</div>
          <div><strong>Quantity:</strong> {request.quantity}</div>
          <div><strong>Status:</strong> {request.status}</div>
        </div>
      </Card>
    </div>
  );
}
