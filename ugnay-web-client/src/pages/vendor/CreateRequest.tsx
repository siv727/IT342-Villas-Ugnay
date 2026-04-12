import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Shield, Loader2, CheckCircle } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { TextArea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import sampleRequestApi from '../../api/sampleRequestApi';

/**
 * SDD Sample Request Flow (§2.2 Journey 2):
 * 1. Vendor selects product + quantity → submits request (status: PENDING)
 * 2. Manufacturer approves & sets delivery fee (status: APPROVED)
 * 3. Vendor pays delivery fee via PayMongo (status: PAID)
 *
 * This page handles step 1 only. Payment happens later from RequestDetail.
 */

export default function CreateRequest() {
  const [searchParams] = useSearchParams();
  const productId = Number(searchParams.get('product'));
  const navigate = useNavigate();
  const { products, manufacturers, addRequest } = useAppStore();
  const product = products.find((p) => p.id === productId);
  const manufacturer = product
    ? manufacturers.find((m) => m.id === product.manufacturerId)
    : null;

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!product || !manufacturer) return;
    setLoading(true);

    // SDD payload: { manufacturerId, items: [{ productId, quantity }] }
    const payload = {
      manufacturerId: manufacturer.id,
      items: [{ productId: product.id, quantity }],
    };

    try {
      await sampleRequestApi.createSampleRequest(payload);
    } catch {
      // API unavailable — fall through to local store
    }

    // Also add to local store for immediate UI feedback
    addRequest({
      productId: product.id,
      productName: product.name,
      manufacturerId: manufacturer.id,
      manufacturerName: manufacturer.businessName,
      quantity,
      unit: product.unit,
      unitPrice: product.price,
      sampleFee: 0,
      shippingFee: 0,
      total: 0,
      notes,
      paymentMethod: '',
    });

    setLoading(false);
    setSuccessOpen(true);
  };

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Product not found. Please select a product first.</p>
        <Link to="/vendor/discover" className="text-primary hover:underline text-sm mt-2 inline-block">
          Go to Discover
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/vendor/discover" className="hover:text-primary">Discover</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/vendor/product/${product.id}`} className="hover:text-primary">{product.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">Request Sample</span>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Request Sample</h1>

      <form onSubmit={handleSubmit} className="max-w-[720px] mx-auto">
        {/* Product summary */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
              <p className="text-sm text-neutral-400">{manufacturer?.businessName}</p>
              <p className="text-sm font-semibold text-primary">₱ {product.price.toFixed(2)} / {product.unit}</p>
            </div>
          </div>
        </Card>

        {/* Quantity */}
        <div className="mb-6">
          <label className="text-sm font-medium text-neutral-700 mb-2 block">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="text-xs text-neutral-400">max {product.stock} {product.unit}(s)</span>
          </div>
        </div>

        <TextArea
          label="Notes (optional)"
          placeholder="Any special instructions for the manufacturer..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-6"
        />

        {/* Info notice */}
        <Card className="mb-6 bg-neutral-50">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div className="text-sm text-neutral-600">
              <p className="font-medium text-neutral-900 mb-1">How it works</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>You submit the request — status becomes <strong>PENDING</strong></li>
                <li>Manufacturer reviews, approves & sets a delivery fee</li>
                <li>You pay the delivery fee via PayMongo</li>
                <li>Manufacturer ships the sample to you</li>
              </ol>
            </div>
          </div>
        </Card>

        <Button type="submit" loading={loading} fullWidth>
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</span>
          ) : (
            'Submit Sample Request'
          )}
        </Button>
      </form>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} title="Request Submitted">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">Your sample request has been submitted!</span>
          </div>
          <p className="text-sm text-neutral-700">
            The manufacturer will review your request and set a delivery fee.
            You'll be able to pay once it's approved.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => { setSuccessOpen(false); navigate('/vendor/requests'); }}>
              View My Requests
            </Button>
            <Button onClick={() => { setSuccessOpen(false); navigate('/vendor/discover'); }}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
