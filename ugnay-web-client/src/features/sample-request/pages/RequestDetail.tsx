import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Package, CreditCard, Truck, XCircle, Loader2, CheckCircle, Image } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import Card from '../../../shared/components/ui/Card';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import StatusTimeline from '../../../shared/components/ui/StatusTimeline';
import { ConfirmModal } from '../../../shared/components/ui/Modal';
import sampleRequestApi from '../../../features/sample-request/api';
import paymentApi from '../../../features/payment/api';
import toast from 'react-hot-toast';
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
  deliveryProofUrl?: string;
  items?: { productId: number; productName: string; quantity: number }[];
}

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await sampleRequestApi.getSampleRequest(id);
      const body = res?.data;
      setRequest(body?.success ? body.data : body);
    } catch {
      setRequest(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchRequest();
    setPaySuccess(false);
  }, [fetchRequest]);

  // Real-time updates via SSE
  useSSE((event) => {
    if (String(event.requestId) === id) {
      toast(`Status updated to ${event.status}`, { icon: '🔔' });
      fetchRequest();
    }
  });

  if (loading) return <LoadingSpinner label="Loading request…" />;
  if (!request) return <EmptyState title="Request not found" />;

  const isRejected = request.status === 'REJECTED' || request.status === 'Rejected';
  const isCancelled = request.status === 'CANCELLED' || request.status === 'Cancelled';
  const canCancel = request.status === 'PENDING' || request.status === 'Pending';
  const canPay = request.status === 'APPROVED' || request.status === 'Approved';
  const canComplete = request.status === 'DELIVERED' || request.status === 'Delivered';
  const currentStep = resolveStep(request.status);

  const handleCancel = async () => {
    try {
      await sampleRequestApi.cancelSampleRequest(request.id);
      setRequest({ ...request, status: 'CANCELLED' });
      toast.success('Request cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
    setCancelOpen(false);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const intent = await paymentApi.createPaymentIntent({
        sampleRequestId: request.id,
        paymentMethod: 'GCASH',
      });
      // Redirect to PayMongo's hosted checkout page
      // After payment, PayMongo redirects back to our success URL
      // which triggers the confirm flow automatically
      if (intent.checkoutUrl) {
        window.location.href = intent.checkoutUrl;
      } else {
        toast.error('Failed to get checkout URL');
        setPaying(false);
      }
    } catch {
      toast.error('Payment failed. Please try again.');
      setPaying(false);
    }
  };

  const handleComplete = async () => {
    try {
      await sampleRequestApi.completeSampleRequest(request.id);
      setRequest({ ...request, status: 'COMPLETED' });
      toast.success('Request marked as completed!');
    } catch {
      toast.error('Failed to complete request');
    }
    setCompleteOpen(false);
  };

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/vendor/requests" className="hover:text-primary">My Requests</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">#{request.id}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Request #{request.id}</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {request.items?.length || 0} item(s)
          </p>
        </div>
        <Badge status={request.status.toLowerCase()} className="self-start md:self-center">
          {request.status}
        </Badge>
      </div>

      {!isCancelled && !isRejected && (
        <div className="mb-8">
          <StatusTimeline steps={TIMELINE_STEPS} currentStep={currentStep} isRejected={false} />
        </div>
      )}

      {isCancelled && (
        <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-4 mb-8 flex items-center gap-3 text-sm text-neutral-600">
          <XCircle className="h-5 w-5 text-danger shrink-0" />
          This request was cancelled.
        </div>
      )}

      {isRejected && (
        <div className="bg-[#FEE2E2] border border-[#DC2626]/20 rounded-xl p-4 mb-8 flex items-center gap-3 text-sm text-[#DC2626]">
          <XCircle className="h-5 w-5 shrink-0" />
          This request was rejected by the manufacturer.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-neutral-900">Request Info</h3>
          </div>
          <dl className="space-y-3 text-sm">
            {request.items?.map((item, i) => (
              <div key={i} className="flex justify-between"><dt className="text-neutral-400">Item {i + 1}</dt><dd className="font-medium">{item.productName} × {item.quantity}</dd></div>
            ))}
            <div className="flex justify-between"><dt className="text-neutral-400">Requested</dt><dd className="font-medium">{new Date(request.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</dd></div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-highlight" />
            <h3 className="font-semibold text-neutral-900">Payment</h3>
          </div>
          <dl className="space-y-3 text-sm">
            {request.deliveryFee != null && Number(request.deliveryFee) > 0 && (
              <div className="flex justify-between"><dt className="text-neutral-400">Delivery Fee</dt><dd className="font-medium">₱ {Number(request.deliveryFee).toFixed(2)}</dd></div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-400">Payment Status</dt>
              <dd><Badge status={request.paymentId ? 'paid' : 'pending'}>{request.paymentId ? 'Paid' : 'Pending'}</Badge></dd>
            </div>
          </dl>
          {canPay && !request.deliveryFee && (
            <p className="text-xs text-neutral-400 mt-3">Waiting for manufacturer to set delivery fee.</p>
          )}
        </Card>

        {request.trackingNumber && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-neutral-900">Shipment</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-400">Tracking #</dt><dd className="font-mono text-xs font-medium">{request.trackingNumber}</dd></div>
            </dl>
            {request.deliveryProofUrl && (
              <div className="mt-4 border-t border-neutral-200 pt-4">
                <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Delivery Proof</p>
                <a href={request.deliveryProofUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer hover:opacity-80 transition-opacity">
                  <img src={request.deliveryProofUrl} alt="Delivery proof" className="w-full h-36 object-cover rounded-lg border border-neutral-200" />
                  <p className="text-xs text-primary mt-1 text-center">Click to view full image</p>
                </a>
              </div>
            )}
          </Card>
        )}
      </div>

      {canPay && !paySuccess && request.deliveryFee != null && Number(request.deliveryFee) > 0 && (
        <Card className="mb-6 bg-primary-light border border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Request Approved!</h3>
              <p className="text-sm text-neutral-600">Pay the delivery fee to proceed with your sample request.</p>
            </div>
            <Button onClick={handlePay} disabled={paying} className="shrink-0">
              {paying ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing Payment…</span>
              ) : (
                'Pay Delivery Fee'
              )}
            </Button>
          </div>
        </Card>
      )}

      {paySuccess && (
        <Card className="mb-6 bg-[#D4F7E0] border border-accent/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-accent" />
            <div>
              <h3 className="font-semibold text-neutral-900">Payment Successful!</h3>
              <p className="text-sm text-neutral-600">Your request status has been updated to PAID. The manufacturer will ship your sample soon.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        {canCancel && (
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            <XCircle className="h-4 w-4" /> Cancel Request
          </Button>
        )}
        {canComplete && (
          <Button variant="accent" onClick={() => setCompleteOpen(true)}>
            <CheckCircle className="h-4 w-4" /> Complete Order
          </Button>
        )}
      </div>

      <ConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Request?"
        description="Are you sure you want to cancel this sample request? This cannot be undone."
        confirmLabel="Cancel Request"
        variant="danger"
      />

      <ConfirmModal
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={handleComplete}
        title="Complete Order?"
        description="Confirm that you have received the sample and want to mark this order as completed."
        confirmLabel="Complete Order"
        variant="accent"
      />
    </div>
  );
}
