import { useState, useRef, useMemo, useEffect, type ChangeEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Package, CreditCard, User, CheckCircle, XCircle, Truck, Upload, Image } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { ConfirmModal } from '../../components/ui/Modal';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import sampleRequestApi from '../../api/sampleRequestApi';
import fileApi from '../../api/fileApi';

/**
 * SDD Statuses: PENDING → APPROVED → PAID → SHIPPED → DELIVERED → COMPLETED
 * Manufacturer actions:
 *   - PENDING  → Approve (set delivery fee) / Reject
 *   - APPROVED + PAID → Update to SHIPPED (set tracking number)
 *   - SHIPPED → Upload delivery proof / mark DELIVERED
 */

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

export default function ManufacturerRequestDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const {
    manufacturerRequests: storeRequests,
    approveRequest,
    rejectRequest,
    createShipment,
    shipments,
    uploadProofOfDelivery,
    markDelivered,
    updateRequestStatus,
  } = useAppStore();

  const [request, setRequest] = useState<import('../../data/mockData').VendorRequest | undefined>(undefined);
  const shipment = useMemo(() => {
    if (!request) return null;
    return shipments.find((sh) => sh.requestId === request.id) || null;
  }, [request, shipments]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await sampleRequestApi.getSampleRequest(id as string);
        if (mounted && res?.data) {
          const body = res.data;
          setRequest(body.success ? body.data : body);
        }
      } catch {
        const found = storeRequests.find((r) => r.id === Number(id));
        if (mounted) setRequest(found);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [id, storeRequests]);

  // Approve modal state
  const [approveOpen, setApproveOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!request) return <EmptyState title="Request not found" />;

  const handleApprove = async () => {
    const fee = Number(deliveryFee);
    if (!fee || fee <= 0) {
      toast.error('Please enter a valid delivery fee');
      return;
    }
    try {
      await sampleRequestApi.approveSampleRequest(request.id, fee);
    } catch { /* fallback */ }
    approveRequest(request.id);
    // Update local request with delivery fee
    setRequest({ ...request, status: 'Approved', shippingFee: fee, total: fee });
    setApproveOpen(false);
    setDeliveryFee('');
    toast.success('Request approved with delivery fee ₱' + fee.toFixed(2));
  };

  const handleReject = async () => {
    try {
      await sampleRequestApi.rejectSampleRequest(request.id, 'Rejected via UI');
    } catch { /* fallback */ }
    rejectRequest(request.id);
    setRequest({ ...request, status: 'Rejected' });
    setRejectOpen(false);
    toast.success('Request rejected');
  };

  const handleShip = async () => {
    const tn = trackingNumber.trim() || `TN-${Math.random().toString().slice(2, 9)}`;
    try {
      await sampleRequestApi.updateSampleRequestStatus(request.id, 'SHIPPED', tn);
    } catch { /* fallback */ }
    createShipment({ requestId: request.id, vendorName: request.vendorName, productName: request.productName });
    updateRequestStatus(request.id, 'In Transit');
    setRequest({ ...request, status: 'In Transit' });
    setShipOpen(false);
    setTrackingNumber('');
    toast.success('Shipment created — status updated to SHIPPED');
  };

  const handleUploadProof = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shipment) return;

    // Mock file upload — shows file name
    const result = await fileApi.uploadFile(file, 'DELIVERY_PROOF');
    uploadProofOfDelivery(shipment.id, result.url);
    toast.success(`Delivery proof "${result.fileName}" uploaded`);
  };

  const handleMarkDelivered = async () => {
    if (!shipment) return;
    try {
      await sampleRequestApi.updateSampleRequestStatus(request.id, 'DELIVERED');
    } catch { /* fallback */ }
    markDelivered(shipment.id);
    setRequest({ ...request, status: 'Completed' });
    toast.success('Marked as delivered — request completed');
  };

  const currentStep = resolveStep(request.status);
  const isRejected = request.status === 'Rejected';
  const isCancelled = request.status === 'Cancelled';
  const isPending = request.status === 'Pending' || request.status === 'PENDING';
  const canShip = (request.status === 'Approved' || request.status === 'APPROVED') &&
    (request.paymentStatus === 'Paid' || request.paymentStatus === 'PAID') && !shipment;
  const canUploadProof = (request.status === 'In Transit' || request.status === 'SHIPPED') && shipment && !shipment.proofOfDelivery;
  const canMarkDelivered = (request.status === 'In Transit' || request.status === 'SHIPPED') && shipment;

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/manufacturer/requests" className="hover:text-primary">Incoming Requests</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">#{request.id}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{request.productName}</h1>
          <p className="text-sm text-neutral-400 mt-1">Request #{request.id} · from {request.vendorName}</p>
        </div>
        <Badge status={request.status.toLowerCase().replace(' ', '-')} className="self-start md:self-center">{request.status}</Badge>
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
            <div className="flex justify-between"><dt className="text-neutral-400">Product</dt><dd className="font-medium">{request.productName}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-400">Quantity</dt><dd className="font-medium">{request.quantity} {request.unit}(s)</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-400">Requested</dt><dd className="font-medium">{new Date(request.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</dd></div>
            {request.notes && <div><dt className="text-neutral-400 mb-1">Notes</dt><dd className="text-neutral-700">{request.notes}</dd></div>}
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4"><User className="h-5 w-5 text-accent" /><h3 className="font-semibold text-neutral-900">Vendor</h3></div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-neutral-400">Business</dt><dd className="font-medium">{request.vendorName}</dd></div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4"><CreditCard className="h-5 w-5 text-highlight" /><h3 className="font-semibold text-neutral-900">Payment</h3></div>
          <dl className="space-y-3 text-sm">
            {request.shippingFee > 0 && (
              <div className="flex justify-between"><dt className="text-neutral-400">Delivery Fee</dt><dd className="font-medium">₱ {request.shippingFee.toFixed(2)}</dd></div>
            )}
            {request.total > 0 && (
              <div className="flex justify-between border-t border-neutral-200 pt-2"><dt className="font-semibold">Total</dt><dd className="font-bold text-primary">₱ {request.total.toFixed(2)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-neutral-400">Payment Status</dt><dd><Badge status={request.paymentStatus?.toLowerCase() || 'pending'}>{request.paymentStatus || 'Pending'}</Badge></dd></div>
          </dl>
          {request.paymentProof && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Payment Proof</p>
              <img src={request.paymentProof} alt="Payment proof" className="w-full h-36 object-cover rounded-lg border border-neutral-200" />
            </div>
          )}
        </Card>
      </div>

      {shipment && (
        <Card className="mb-8">
          <div className="flex items-center gap-2 mb-4"><Truck className="h-5 w-5 text-primary" /><h3 className="font-semibold text-neutral-900">Shipment</h3></div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-neutral-400">Courier</dt><dd className="font-medium">{shipment.courier}</dd></div>
            <div><dt className="text-neutral-400">Tracking #</dt><dd className="font-mono text-xs font-medium">{shipment.trackingNumber}</dd></div>
            <div><dt className="text-neutral-400">Status</dt><dd><Badge status={shipment.status.toLowerCase().replace(' ', '-')}>{shipment.status}</Badge></dd></div>
            {shipment.estimatedDelivery && (<div><dt className="text-neutral-400">ETA</dt><dd className="font-medium">{new Date(shipment.estimatedDelivery).toLocaleDateString('en-PH')}</dd></div>)}
          </dl>
          {shipment.proofOfDelivery && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Delivery Proof</p>
              <img src={shipment.proofOfDelivery} alt="Delivery proof" className="w-full h-36 object-cover rounded-lg border border-neutral-200" />
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

      {/* Approve modal — now includes delivery fee input */}
      <Modal open={approveOpen} onClose={() => setApproveOpen(false)} title="Approve & Set Delivery Fee">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Enter the delivery fee for this sample request. The vendor will need to pay this before shipment.</p>
          <Input
            label="Delivery Fee (₱)"
            type="number"
            step="0.01"
            min="1"
            placeholder="e.g. 150.00"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={handleReject} title="Reject Request?" description="Are you sure you want to reject this sample request?" confirmLabel="Reject" variant="danger" />

      {/* Ship modal — includes tracking number */}
      <Modal open={shipOpen} onClose={() => setShipOpen(false)} title="Ship Order">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Enter the tracking number for this shipment (optional — one will be generated if left blank).</p>
          <Input
            label="Tracking Number"
            placeholder="e.g. JT-12345678"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShipOpen(false)}>Cancel</Button>
            <Button onClick={handleShip}>Create Shipment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
