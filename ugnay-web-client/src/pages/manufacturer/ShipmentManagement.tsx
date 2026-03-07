import { useState } from 'react';
import { Truck, Package, Calendar, Upload, CheckCircle } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { Select, FileUpload } from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';
import type { Shipment } from '../../data/mockData';

const STATUS_FILTERS = ['All', 'Processing', 'In Transit', 'Delivered'];
const ITEMS_PER_PAGE = 8;

export default function ShipmentManagement() {
  const { shipments, updateShipmentStatus, uploadProofOfDelivery, markDelivered } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Update modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState('');

  // POD modal
  const [podOpen, setPodOpen] = useState(false);
  const [podShipment, setPodShipment] = useState<Shipment | null>(null);

  const filtered =
    statusFilter === 'All'
      ? shipments
      : shipments.filter((s) => s.status === statusFilter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openUpdate = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setUpdateOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedShipment && newStatus) {
      updateShipmentStatus(selectedShipment.id, newStatus);
      toast.success('Shipment status updated');
      setUpdateOpen(false);
    }
  };

  const openPod = (shipment: Shipment) => {
    setPodShipment(shipment);
    setPodOpen(true);
  };

  const handleUploadPod = () => {
    if (podShipment) {
      uploadProofOfDelivery(podShipment.id, 'proof_of_delivery.jpg');
      markDelivered(podShipment.id);
      toast.success('Proof uploaded & marked as delivered');
      setPodOpen(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Shipment Management</h1>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-10 w-10 text-neutral-300" />}
          title="No shipments found"
          description="Shipments will appear here once you create them from approved requests."
        />
      ) : (
        <div className="space-y-4">
          {paginated.map((ship) => (
            <Card key={ship.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-neutral-900 truncate">{ship.productName}</h3>
                </div>
                <p className="text-sm text-neutral-400 mb-1">To: {ship.vendorName}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> {ship.courier}
                  </span>
                  <span className="font-mono">{ship.trackingNumber}</span>
                  {ship.estimatedDelivery && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      ETA: {new Date(ship.estimatedDelivery).toLocaleDateString('en-PH', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge status={ship.status.toLowerCase().replace(' ', '-')}>
                  {ship.status}
                </Badge>

                {ship.status !== 'Delivered' && (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openUpdate(ship)}>
                      Update
                    </Button>
                    {ship.status === 'In Transit' && (
                      <Button variant="accent" size="sm" onClick={() => openPod(ship)}>
                        <CheckCircle className="h-3.5 w-3.5" /> Deliver
                      </Button>
                    )}
                  </div>
                )}

                {ship.proofOfDelivery && (
                  <span className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> POD uploaded
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Update Status Modal */}
      <Modal open={updateOpen} onClose={() => setUpdateOpen(false)} title="Update Shipment Status">
        <div className="space-y-4">
          <Select
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Processing">Processing</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </Select>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Update</Button>
          </div>
        </div>
      </Modal>

      {/* Proof of Delivery Modal */}
      <Modal open={podOpen} onClose={() => setPodOpen(false)} title="Upload Proof of Delivery">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Upload a photo or document as proof of delivery for this shipment.
          </p>
          <FileUpload label="Proof of Delivery" accept="image/*,.pdf" onChange={() => {}} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPodOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={handleUploadPod}>
              <Upload className="h-4 w-4" /> Upload &amp; Mark Delivered
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
