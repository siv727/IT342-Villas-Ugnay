import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import productApi from '../../api/productApi';
import manufacturerApi from '../../api/manufacturerApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface ProductItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  category?: string;
  manufacturerId: number;
  imageUrl?: string;
  imageUrls?: string[];
  active?: boolean;
}

interface ManufacturerInfo { id: number; businessName: string; }

const DEFAULT_PRODUCT_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" fill="none"><rect width="600" height="420" fill="#F1F5F9"/><text x="50%" y="48%" text-anchor="middle" fill="#94A3B8" font-size="48" font-family="system-ui">📦</text><text x="50%" y="58%" text-anchor="middle" fill="#94A3B8" font-size="14" font-family="system-ui">No image available</text></svg>`);

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [manufacturer, setManufacturer] = useState<ManufacturerInfo | null>(null);
  const [moreProducts, setMoreProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await productApi.getProduct(id);
        const body = res?.data;
        const p = body?.success ? body.data : body;
        setProduct(p);
        if (p?.manufacturerId) {
          try {
            const mRes = await manufacturerApi.getManufacturer(String(p.manufacturerId));
            const mBody = mRes?.data;
            setManufacturer(mBody?.success ? mBody.data : mBody);
          } catch { /* ignore */ }
          try {
            const pRes = await productApi.getProducts({ manufacturerId: p.manufacturerId });
            const pBody = pRes?.data;
            if (pBody?.success && pBody.data?.items) {
              setMoreProducts(pBody.data.items.filter((x: ProductItem) => x.id !== p.id && x.active !== false).slice(0, 4));
            }
          } catch { /* ignore */ }
        }
      } catch { setProduct(null); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading product…" />;
  if (!product) return <EmptyState title="Product not found" />;

  const mainImage = product.imageUrls?.[0] || product.imageUrl || DEFAULT_PRODUCT_IMAGE;

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/vendor/discover" className="hover:text-primary">Discover</Link>
        <ChevronRight className="h-3 w-3" />
        {manufacturer && (
          <>
            <Link to={`/vendor/manufacturer/${manufacturer.id}`} className="hover:text-primary">{manufacturer.businessName}</Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-neutral-700 font-medium">{product.name}</span>
      </div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="lg:w-[55%] shrink-0">
          <img src={mainImage} alt={product.name} className="w-full h-[420px] object-cover rounded-2xl shadow-md bg-neutral-100" />
        </div>
        <div className="lg:w-[45%] flex flex-col">
          <h1 className="text-2xl lg:text-[28px] font-bold text-neutral-900 mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mb-1">₱ {Number(product.price).toFixed(2)}</p>
          <p className="text-xs text-neutral-400 mb-4">per {product.unit}</p>
          <Badge status={product.stock > 0 ? 'approved' : 'completed'} className="mb-4 self-start">
            {product.stock > 0 ? `In Stock — ${product.stock} ${product.unit}s` : 'Out of Stock'}
          </Badge>
          {product.category && <div className="text-sm text-neutral-700 mb-2"><strong className="text-neutral-900">Category:</strong> {product.category}</div>}
          {manufacturer && (
            <div className="text-sm text-neutral-700 mb-4">
              <strong className="text-neutral-900">Manufacturer:</strong>{' '}
              <Link to={`/vendor/manufacturer/${manufacturer.id}`} className="text-primary hover:underline">{manufacturer.businessName}</Link>
            </div>
          )}
          <p className="text-sm text-neutral-600 mb-8 leading-relaxed">{product.description}</p>
          <div className="mt-auto flex flex-col gap-3">
            <Link to={`/vendor/request/create?product=${product.id}`}><Button fullWidth disabled={product.stock === 0}>Request Sample</Button></Link>
            {manufacturer && <Link to={`/vendor/manufacturer/${manufacturer.id}`}><Button variant="secondary" fullWidth>View Manufacturer</Button></Link>}
          </div>
        </div>
      </div>

      {moreProducts.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">More from {manufacturer?.businessName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {moreProducts.map((p) => {
              const img = p.imageUrls?.[0] || p.imageUrl || DEFAULT_PRODUCT_IMAGE;
              return (
                <Card key={p.id} hover className="p-0 overflow-hidden">
                  <img src={img} alt={p.name} className="w-full h-40 object-cover bg-neutral-100" />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-neutral-900 mb-1">{p.name}</h3>
                    <p className="text-sm font-semibold text-primary mb-2">₱ {Number(p.price).toFixed(2)} / {p.unit}</p>
                    <Link to={`/vendor/product/${p.id}`}><Button variant="secondary" size="sm" fullWidth>View</Button></Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
