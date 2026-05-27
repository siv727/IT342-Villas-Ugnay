import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Package, CreditCard, User, CheckCircle, XCircle, Truck, Upload, Image } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import StatusTimeline from '../../../shared/components/ui/StatusTimeline';
import { ConfirmModal } from '../../../shared/components/ui/Modal';
import Modal from '../../../shared/components/ui/Modal';
import EmptyState from '../../../shared/components/ui/EmptyState';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import sampleRequestApi from '../../../features/sample-request/api';
import fileApi from '../../../features/file-upload/api';
import useSSE from '../../../shared/hooks/useSSE';

const TIMELINE_STEPS = ['Pending', 'Approved', 'Paid', 'Shipped', 'Delivered', 'Completed'];

function resolveStep(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending', Pending: 'Pending',
    APPROVED: 'Approved', Approved: 'Approved',
    PAID: 'Paid', Paid: 'Paid',
    SHIPPED: 'Shipped', 'In Transit': 'Shipped',
    DELIVERED: 'Delivered', Delivered: 'Delivered',
    COMPLETED: 'Completed', Completed: 'Completed',
  };
  return map[status] || 'Pending';
}

interface RequestDetail {
  id: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  deliveryFee?: number;
  paymentId?: string;
  trackingNumber?: string;
  vendorId?: number;
  vendorName?: string;
  vendorEmail?: string;
  deliveryProofUrl?: string;
  items?: { productId: number; productName: string; quantity: number }[];
}

export default function ManufacturerRequestDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveOpen, setApproveOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await sampleRequestApi.getSampleRequest(id);
      const body = res?.data;
      const data = body?.success ? body.data : body;
      setRequest(data);
      if (data?.deliveryProofUrl) setProofUrl(data.deliveryProofUrl);
    } catch {
      setRequest(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchRequest(); }, [fetchRequest]);

  // Real-time updates via SSE
  useSSE((event) => {
    if (String(event.requestId) === id) {
      toast(`Status updated to ${event.status}`, { icon: '🔔' });
      fetchRequest();
    }
  });

  if (loading) return <LoadingSpinner label="Loading request…" />;
  if (!request) return <EmptyState title="Request not found" />;

  const handleApprove = async () => {
    const fee = Number(deliveryFee);
    if (!fee || fee <= 0) {
      toast.error('Please enter a valid delivery fee');
      return;
    }
    try {
      await sampleRequestApi.approveSampleRequest(request.id, fee);
      setRequest({ ...request, status: 'APPROVED', deliveryFee: fee });
      toast.success('Request approved with delivery fee ₱' + fee.toFixed(2));
    } catch {
      toast.error('Failed to approve');
    }
    setApproveOpen(false);
    setDeliveryFee('');
  };

  const handleReject = async () => {
    try {
      await sampleRequestApi.rejectSampleRequest(request.id, 'Rejected via UI');
      setRequest({ ...request, status: 'REJECTED' });
      toast.success('Request rejected');
    } catch {
      toast.error('Failed to reject');
    }
    setRejectOpen(false);
  };

  const handleShip = async () => {
    const tn = trackingNumber.trim() || `TN-${Math.random().toString().slice(2, 9)}`;
    try {
      await sampleRequestApi.updateSampleRequestStatus(request.id, 'SHIPPED', tn);
      setRequest({ ...request, status: 'SHIPPED', trackingNumber: tn });
      toast.success('Shipment created — status updated to SHIPPED');
    } catch {
      toast.error('Failed to ship');
    }
    setShipOpen(false);
    setTrackingNumber('');
  };

  const handleUploadProof = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await fileApi.uploadFile(file, 'DELIVERY_PROOF');
      setProofUrl(result.url);
      // Persist the proof URL to the database
      if (request) {
        await sampleRequestApi.updateDeliveryProof(request.id, result.url);
      }
      toast.success(`Delivery proof "${result.fileName}" uploaded`);
    } catch {
      toast.error('Failed to upload delivery proof');
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await sampleRequestApi.updateSampleRequestStatus(request.id, 'DELIVERED');
      setRequest({ ...request, status: 'DELIVERED' });
      toast.success('Marked as delivered');
    } catch {
      toast.error('Failed to mark delivered');
    }
  };

  const currentStep = resolveStep(request.status);
  const isRejected = request.status === 'REJECTED' || request.status === 'Rejected';
  const isCancelled = request.status === 'CANCELLED' || request.status === 'Cancelled';
  const isPending = request.status === 'PENDING' || request.status === 'Pending';
  const canShip = request.status === 'PAID';
  const canUploadProof = request.status === 'SHIPPED' && !proofUrl;
  const canMarkDelivered = request.status === 'SHIPPED';

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/manufacturer/requests" className="hover:text-primary">Incoming Requests</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">#{request.id}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Request #{request.id}</h1>
          <p className="text-sm text-neutral-400 mt-1">{request.items?.length || 0} item(s)</p>
        </div>
        <Badge status={request.status.toLowerCase()} className="self-start md:self-center">{request.status}</Badge>
      </div>

      {!isCancelled && !isRejected && (
        <div className="mb-8">
          <StatusTimeline steps={TIMELINE_STEPS} currentStep={currentStep} isRejected={false} />
        </div>
      )}

      {isCancelled && (
        <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-4 mb-8 flex items-center gap-3 text-sm text-neutral-600">
          <XCircle className="h-5 w-5 text-danger shrink-0" /> This request was cancelled by the vendor.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-4"><Package className="h-5 w-5 text-primary" /><h3 className="font-semibold text-neutral-900">Request Info</h3></div>
          <dl className="space-y-3 text-sm">
            {request.items?.map((item, i) => (
              <div key={i} className="flex justify-between"><dt className="text-neutral-400">Item {i + 1}</dt><dd className="font-medium">{item.productName} × {item.quantity}</dd></div>
            ))}
            <div className="flex justify-between"><dt className="text-neutral-400">Requested</dt><dd className="font-medium">{new Date(request.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</dd></div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4"><User className="h-5 w-5 text-accent" /><h3 className="font-semibold text-neutral-900">Vendor</h3></div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-neutral-400">Business Name</dt><dd className="font-medium">{request.vendorName || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-400">Email</dt><dd className="font-medium text-xs">{request.vendorEmail || 'N/A'}</dd></div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4"><CreditCard className="h-5 w-5 text-highlight" /><h3 className="font-semibold text-neutral-900">Payment</h3></div>
          <dl className="space-y-3 text-sm">
            {request.deliveryFee != null && Number(request.deliveryFee) > 0 && (
              <div className="flex justify-between"><dt className="text-neutral-400">Delivery Fee</dt><dd className="font-medium">₱ {Number(request.deliveryFee).toFixed(2)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-neutral-400">Payment Status</dt><dd><Badge status={request.paymentId ? 'paid' : 'pending'}>{request.paymentId ? 'Paid' : 'Pending'}</Badge></dd></div>
          </dl>
        </Card>
      </div>

      {request.trackingNumber && (
        <Card className="mb-8">
          <div className="flex items-center gap-2 mb-4"><Truck className="h-5 w-5 text-primary" /><h3 className="font-semibold text-neutral-900">Shipment</h3></div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-neutral-400">Tracking #</dt><dd className="font-mono text-xs font-medium">{request.trackingNumber}</dd></div>
            <div><dt className="text-neutral-400">Status</dt><dd><Badge status={request.status.toLowerCase()}>{request.status}</Badge></dd></div>
          </dl>
          {proofUrl && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Delivery Proof</p>
              <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer hover:opacity-80 transition-opacity">
                <img src={proofUrl} alt="Delivery proof" className="w-full h-36 object-cover rounded-lg border border-neutral-200" />
                <p className="text-xs text-primary mt-1 text-center">Click to view full image</p>
              </a>
            </div>
          )}
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {isPending && (
          <>
            <Button onClick={() => setApproveOpen(true)}><CheckCircle className="h-4 w-4" /> Approve & Set Fee</Button>
            <Button variant="danger" onClick={() => setRejectOpen(true)}><XCircle className="h-4 w-4" /> Reject</Button>
          </>
        )}
        {canShip && (
          <Button variant="accent" onClick={() => setShipOpen(true)}><Truck className="h-4 w-4" /> Ship Order</Button>
        )}
        {canUploadProof && (
          <>
            <Button variant="accent" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> Upload Delivery Proof</Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadProof} />
          </>
        )}
        {canMarkDelivered && (
          <Button variant="accent" onClick={handleMarkDelivered}><CheckCircle className="h-4 w-4" /> Mark Delivered</Button>
        )}
      </div>

      <Modal open={approveOpen} onClose={() => setApproveOpen(false)} title="Approve & Set Delivery Fee">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Enter the delivery fee for this sample request. The vendor will need to pay this before shipment.</p>
          <Input label="Delivery Fee (₱)" type="number" step="0.01" min="1" placeholder="e.g. 150.00" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={handleReject} title="Reject Request?" description="Are you sure you want to reject this sample request?" confirmLabel="Reject" variant="danger" />

      <Modal open={shipOpen} onClose={() => setShipOpen(false)} title="Ship Order">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Enter the tracking number for this shipment (optional — one will be generated if left blank).</p>
          <Input label="Tracking Number" placeholder="e.g. JT-12345678" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShipOpen(false)}>Cancel</Button>
            <Button onClick={handleShip}>Create Shipment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
