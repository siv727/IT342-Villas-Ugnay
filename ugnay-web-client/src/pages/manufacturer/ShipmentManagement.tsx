import { useState, useEffect } from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import sampleRequestApi from '../../api/sampleRequestApi';

interface ShipmentItem {
  id: number;
  status: string;
  trackingNumber?: string;
  items?: { productName?: string }[];
}

const STATUS_FILTERS = ['All', 'SHIPPED', 'DELIVERED'];

export default function ShipmentManagement() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await sampleRequestApi.getSampleRequests();
        const body = res?.data;
        if (body?.success && body.data?.items) {
          setShipments(body.data.items.filter((r: ShipmentItem) => ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(r.status)));
        }
      } catch { /* empty state */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = statusFilter === 'All' ? shipments : shipments.filter((s) => s.status === statusFilter);

  const confirmDeliver = async () => {
    if (selectedId === null) return;
    try {
      await sampleRequestApi.updateSampleRequestStatus(selectedId, 'DELIVERED');
      setShipments((prev) => prev.map((s) => s.id === selectedId ? { ...s, status: 'DELIVERED' } : s));
      toast.success('Shipment marked as delivered');
    } catch { toast.error('Failed to mark as delivered'); }
    setDeliverOpen(false);
    setSelectedId(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Shipment Management</h1>

      {loading ? (
        <LoadingSpinner label="Loading shipments…" />
      ) : shipments.length === 0 ? (
        <EmptyState title="No shipments yet" description="Shipments appear here when you ship an approved and paid request." />
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            {STATUS_FILTERS.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {s === 'All' ? 'All' : s}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {filtered.map((s) => {
              const firstItem = s.items?.[0];
              return (
                <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">{firstItem?.productName || `Request #${s.id}`}</h3>
                    <p className="text-sm text-neutral-400">{s.items?.length || 0} item(s)</p>
                    {s.trackingNumber && (
                      <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Tracking: <span className="font-mono">{s.trackingNumber}</span></p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={s.status.toLowerCase()}>{s.status}</Badge>
                    {s.status === 'SHIPPED' && (
                      <Button size="sm" variant="accent" onClick={() => { setSelectedId(s.id); setDeliverOpen(true); }}>
                        <CheckCircle className="h-3.5 w-3.5" /> Delivered
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <ConfirmModal
        open={deliverOpen}
        onClose={() => setDeliverOpen(false)}
        onConfirm={confirmDeliver}
        title="Mark as Delivered?"
        description="This will complete the request. Make sure you have received delivery confirmation."
        confirmLabel="Confirm"
        variant="primary"
      />
    </div>
  );
}
