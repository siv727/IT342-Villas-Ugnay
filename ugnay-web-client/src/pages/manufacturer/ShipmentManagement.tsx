import { useState, useMemo, useRef, type ChangeEvent } from 'react';
import { MapPin, Upload, CheckCircle, Image } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import fileApi from '../../api/fileApi';

const STATUS_FILTERS = ['All', 'Processing', 'Shipped', 'Delivered'];

export default function ShipmentManagement() {
  const { shipments, updateShipmentStatus, uploadProofOfDelivery, markDelivered } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return shipments;
    return shipments.filter((s) => s.status === statusFilter);
  }, [shipments, statusFilter]);

  const handleUploadProof = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingId === null) return;

    const result = await fileApi.uploadFile(file, 'DELIVERY_PROOF');
    uploadProofOfDelivery(uploadingId, result.url);
    toast.success(`Delivery proof "${result.fileName}" uploaded`);
    setUploadingId(null);
    e.target.value = '';
  };

  const confirmDeliver = () => {
    if (selectedId === null) return;
    markDelivered(selectedId);
    setDeliverOpen(false);
    setSelectedId(null);
    toast.success('Shipment marked as delivered');
  };

  if (shipments.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Shipment Management</h1>
        <EmptyState title="No shipments yet" description="Shipments appear here when you ship an approved and paid request." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Shipment Management</h1>

      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((s) => (
          <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 truncate">{s.productName}</h3>
              <p className="text-sm text-neutral-400">{s.vendorName}</p>
              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Tracking: <span className="font-mono">{s.trackingNumber}</span>
              </p>
              {s.proofOfDelivery && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1"><Image className="h-3.5 w-3.5" /> Proof</p>
                  <img src={s.proofOfDelivery} alt="Proof" className="w-24 h-16 object-cover rounded-lg border" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge status={s.status.toLowerCase().replace(' ', '-')}>{s.status}</Badge>
              {s.status === 'Processing' && (
                <Button size="sm" onClick={() => { updateShipmentStatus(s.id, 'Shipped'); toast.success('Status → Shipped'); }}>
                  Mark Shipped
                </Button>
              )}
              {s.status === 'Shipped' && !s.proofOfDelivery && (
                <Button size="sm" variant="accent" onClick={() => {
                  setUploadingId(s.id);
                  fileInputRef.current?.click();
                }}>
                  <Upload className="h-3.5 w-3.5" /> Proof
                </Button>
              )}
              {s.status === 'Shipped' && (
                <Button size="sm" variant="accent" onClick={() => { setSelectedId(s.id); setDeliverOpen(true); }}>
                  <CheckCircle className="h-3.5 w-3.5" /> Delivered
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadProof} />

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
