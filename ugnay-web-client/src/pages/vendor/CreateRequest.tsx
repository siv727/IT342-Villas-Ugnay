import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Shield } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { TextArea, Select } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import sampleRequestApi from '../../api/sampleRequestApi';

export default function CreateRequest() {
  const [searchParams] = useSearchParams();
  const productId = Number(searchParams.get('product'));
  const navigate = useNavigate();
  const { products, manufacturers, addRequest } = useAppStore();
  const { user } = useAuthStore();
  const product = products.find((p) => p.id === productId);
  const manufacturer = product
    ? manufacturers.find((m) => m.id === product.manufacturerId)
    : null;

  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const sampleFee = product ? product.price * quantity : 0;
  const shippingFee = 150;
  const total = sampleFee + shippingFee;

  const handleNext = () => setStep((s) => Math.min(3, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!product) return;
    setLoading(true);

    const payload = {
      productId: product.id,
      productName: product.name,
      manufacturerId: product.manufacturerId,
      manufacturerName: manufacturer?.businessName || '',
      vendorId: user?.userId ?? 0,
      vendorName: '',
      quantity,
      unit: product.unit,
      unitPrice: product.price,
      sampleFee,
      shippingFee,
      total,
      paymentMethod,
      notes,
    };

    try {
      // Attempt backend call (will be mocked if unavailable)
      await sampleRequestApi.createSampleRequest(payload).catch(() => undefined);
    } catch {
      // ignore
    }

    // Add to local store
    addRequest(payload);

    // Get newly added request id (store prepends)
    const state = useAppStore.getState();
    const newReq = state.vendorRequests[0];

    // Simulate payment redirect and immediate PAID status
    setTimeout(() => {
      // update status to PAID
      state.updateRequestStatus(newReq.id, 'PAID');
      setLoading(false);
      setSuccessOpen(true);
    }, 1200);
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

        {/* Step content */}
        {step === 1 && (
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Quantity</label>
            <div className="flex items-center gap-3 mb-6">
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
        )}

        {step === 2 && (
          <div>
            <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cod">Cash on Delivery</option>
              <option value="gcash">GCash</option>
              <option value="bank">Bank Transfer</option>
            </Select>

            <TextArea label="Notes (optional)" placeholder="Any special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} className="mb-6" />
          </div>
        )}

        {step === 3 && (
          <Card className="mb-6 bg-neutral-50">
            <h3 className="font-semibold text-neutral-900 mb-3">Review & Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-600">Sample fee ({quantity} × ₱{product.price.toFixed(2)})</span><span className="font-medium">₱ {sampleFee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Estimated shipping</span><span className="font-medium">₱ {shippingFee.toFixed(2)}</span></div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between text-base font-bold"><span>Total</span><span className="text-primary">₱ {total.toFixed(2)}</span></div>
            </div>
          </Card>
        )}

        <div className="flex items-center gap-3 mb-6">
          {step > 1 && <Button variant="ghost" onClick={handleBack}>Back</Button>}
          {step < 3 && <Button onClick={handleNext}>Next</Button>}
          {step === 3 && <Button type="submit" loading={loading}>Submit Request</Button>}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
          <Shield className="h-4 w-4 text-accent" />
          Payments secured by PayMongo
        </div>
      </form>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} title="Payment Successful">
        <div className="space-y-3">
          <p className="text-sm text-neutral-700">Your payment was successful and the request is now marked as PAID. The manufacturer will be notified.</p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => { setSuccessOpen(false); navigate('/vendor/requests'); }}>View Requests</Button>
            <Button onClick={() => { setSuccessOpen(false); navigate('/vendor/discover'); }}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
