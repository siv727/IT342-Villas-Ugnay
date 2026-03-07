import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, Package, XCircle, Image } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { ConfirmModal } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { VendorRequest } from '../../data/mockData';

const TIMELINE_STEPS = ['Pending', 'Approved', 'Paid', 'Shipped', 'Completed'];

function resolveTimelineStep(request: VendorRequest) {
  const { status, paymentStatus } = request;
  if (status === 'Completed' || status === 'Delivered') return 'Completed';
  if (status === 'In Transit') return 'Shipped';
  if (status === 'Approved' && paymentStatus === 'Paid') return 'Paid';
  if (status === 'Approved') return 'Approved';
  return 'Pending';
}

export default function RequestDetail() {
  const { id } = useParams();
  const { vendorRequests, updateRequestStatus, shipments } = useAppStore();
  const request = vendorRequests.find((r) => r.id === Number(id));
  const shipment = request ? shipments.find((s) => s.requestId === request.id) : null;
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!request) {
    return <EmptyState title="Request not found" />;
  }

  const handleCancel = () => {
    updateRequestStatus(request.id, 'Cancelled');
    toast.success('Request cancelled');
    setCancelOpen(false);
  };

  const currentStep = resolveTimelineStep(request);
  const isRejected = request.status === 'Rejected';
  const isCancelled = request.status === 'Cancelled';

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/vendor/requests" className="hover:text-primary">My Requests</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">#{request.id}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{request.productName}</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Request #{request.id} &middot; {request.manufacturerName}
          </p>
        </div>
        <Badge status={request.status.toLowerCase().replace(' ', '-')} className="self-start md:self-center">
          {request.status}
        </Badge>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="mb-8">
          <StatusTimeline steps={TIMELINE_STEPS} currentStep={currentStep} isRejected={isRejected} />
        </div>
      )}

      {isCancelled && (
        <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-4 mb-8 flex items-center gap-3 text-sm text-neutral-600">
          <XCircle className="h-5 w-5 text-danger shrink-0" />
          This request was cancelled.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Request Info */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-neutral-900">Request Info</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-400">Quantity</dt>
              <dd className="font-medium">{request.quantity} {request.unit}(s)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-400">Unit Price</dt>
              <dd className="font-medium">&#8369; {request.unitPrice.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-400">Requested</dt>
              <dd className="font-medium">
                {new Date(request.createdAt).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </dd>
            </div>
            {request.notes && (
              <div>
                <dt className="text-neutral-400 mb-1">Notes</dt>
                <dd className="font-medium text-neutral-700">{request.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Payment Status Card */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-neutral-900">Payment</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-400">Method</dt>
              <dd className="font-medium capitalize">{request.paymentMethod}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-400">Sample Fee</dt>
              <dd className="font-medium">&#8369; {request.sampleFee.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-400">Shipping</dt>
              <dd className="font-medium">&#8369; {request.shippingFee.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold text-primary">&#8369; {request.total.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-400">Payment Status</dt>
              <dd>
                <Badge status={request.paymentStatus?.toLowerCase() || 'pending'}>
                  {request.paymentStatus || 'Pending'}
                </Badge>
              </dd>
            </div>
          </dl>
          {request.paymentProof && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1">
                <Image className="h-3.5 w-3.5" /> Payment Proof
              </p>
              <img
                src={request.paymentProof}
                alt="Payment proof"
                className="w-full h-36 object-cover rounded-lg border border-neutral-200"
              />
            </div>
          )}
        </Card>

        {/* Shipment Details */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-highlight" />
            <h3 className="font-semibold text-neutral-900">Shipment</h3>
          </div>
          {shipment ? (
            <>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Courier</dt>
                  <dd className="font-medium">{shipment.courier}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Tracking #</dt>
                  <dd className="font-medium font-mono text-xs">{shipment.trackingNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Status</dt>
                  <dd>
                    <Badge status={shipment.status.toLowerCase().replace(' ', '-')}>
                      {shipment.status}
                    </Badge>
                  </dd>
                </div>
                {shipment.estimatedDelivery && (
                  <div className="flex justify-between">
                    <dt className="text-neutral-400">ETA</dt>
                    <dd className="font-medium">
                      {new Date(shipment.estimatedDelivery).toLocaleDateString('en-PH', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
              </dl>
              {shipment.proofOfDelivery && (
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <p className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1">
                    <Image className="h-3.5 w-3.5" /> Delivery Proof
                  </p>
                  <img
                    src={shipment.proofOfDelivery}
                    alt="Delivery proof"
                    className="w-full h-36 object-cover rounded-lg border border-neutral-200"
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-400">No shipment info yet.</p>
          )}
        </Card>
      </div>

      {/* Actions */}
      {request.status === 'Pending' && (
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            Cancel Request
          </Button>
        </div>
      )}

      <ConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Request?"
        description="Are you sure you want to cancel this sample request? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        variant="danger"
      />
    </div>
  );
}
