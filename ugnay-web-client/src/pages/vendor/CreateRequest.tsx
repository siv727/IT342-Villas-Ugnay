import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Shield } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { TextArea, Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

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

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const sampleFee = product ? product.price * quantity : 0;
  const shippingFee = 150;
  const total = sampleFee + shippingFee;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    setTimeout(() => {
      addRequest({
        productId: product.id,
        productName: product.name,
        manufacturerId: product.manufacturerId,
        manufacturerName: manufacturer?.businessName || '',
        vendorName: `User #${user?.userId || ''}`,
        quantity,
        unit: product.unit,
        unitPrice: product.price,
        sampleFee,
        shippingFee,
        total,
        paymentMethod,
        notes,
      });
      toast.success('Sample request submitted!');
      setLoading(false);
      navigate('/vendor/requests');
    }, 1500);
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
      {/* Breadcrumb */}
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
        <Card className="flex items-center gap-4 mb-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
            <p className="text-sm text-neutral-400">{manufacturer?.businessName}</p>
            <p className="text-sm font-semibold text-primary">
              &#8369; {product.price.toFixed(2)} / {product.unit}
            </p>
          </div>
        </Card>

        {/* Quantity stepper */}
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

        {/* Payment method */}
        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cod">Cash on Delivery</option>
          <option value="gcash">GCash</option>
          <option value="bank">Bank Transfer</option>
        </Select>

        {/* Notes */}
        <TextArea
          label="Notes (optional)"
          placeholder="Any special instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-6"
        />

        {/* Cost breakdown */}
        <Card className="mb-6 bg-neutral-50">
          <h3 className="font-semibold text-neutral-900 mb-3">Cost Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Sample fee ({quantity} &times; &#8369;{product.price.toFixed(2)})</span>
              <span className="font-medium">&#8369; {sampleFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Estimated shipping</span>
              <span className="font-medium">&#8369; {shippingFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">&#8369; {total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* PayMongo trust badge */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
          <Shield className="h-4 w-4 text-accent" />
          Payments secured by PayMongo
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Submit Request
        </Button>
      </form>
    </div>
  );
}
