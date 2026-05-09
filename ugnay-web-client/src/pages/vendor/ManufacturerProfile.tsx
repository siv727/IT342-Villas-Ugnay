import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck, ChevronRight, Package } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import manufacturerApi from '../../api/manufacturerApi';
import productApi from '../../api/productApi';
import connectionApi from '../../api/connectionApi';
import toast from 'react-hot-toast';

interface ManufacturerDetail {
  id: number;
  businessName: string;
  category: string;
  businessAddress?: string;
  description?: string;
}

interface ProductItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  active?: boolean;
}

const DEFAULT_PRODUCT_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="none"><rect width="600" height="400" fill="#F1F5F9"/><text x="50%" y="48%" text-anchor="middle" fill="#94A3B8" font-size="48" font-family="system-ui">📦</text><text x="50%" y="58%" text-anchor="middle" fill="#94A3B8" font-size="14" font-family="system-ui">No image</text></svg>`);

export default function ManufacturerProfile() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [manufacturer, setManufacturer] = useState<ManufacturerDetail | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await manufacturerApi.getManufacturer(id);
        const body = res?.data;
        setManufacturer(body?.success ? body.data : body);
      } catch { setManufacturer(null); }
      try {
        const res = await productApi.getProducts({ manufacturerId: Number(id) });
        const body = res?.data;
        if (body?.success && body.data?.items) setProducts(body.data.items.filter((p: ProductItem) => p.active !== false));
      } catch { /* empty */ }
      try {
        const res = await connectionApi.getConnections();
        const body = res?.data;
        if (body?.success && body.data?.items) {
          setSaved(body.data.items.some((c: { manufacturerId: number }) => c.manufacturerId === Number(id)));
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleToggleSave = async () => {
    if (saved) {
      try {
        const res = await connectionApi.getConnections();
        const body = res?.data;
        if (body?.success && body.data?.items) {
          const conn = body.data.items.find((c: { manufacturerId: number }) => c.manufacturerId === Number(id));
          if (conn) await connectionApi.removeConnection(conn.id);
        }
      } catch { /* ignore */ }
      setSaved(false);
      toast.success('Removed from saved');
    } else {
      try { await connectionApi.saveManufacturer(Number(id)); } catch { /* ignore */ }
      setSaved(true);
      toast.success('Manufacturer saved');
    }
  };

  if (loading) return <LoadingSpinner label="Loading manufacturer…" />;
  if (!manufacturer) return <EmptyState title="Manufacturer not found" />;

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/vendor/discover" className="hover:text-primary">Discover</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">{manufacturer.businessName}</span>
      </div>

      <div className="bg-primary-light rounded-2xl p-6 lg:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-[32px] font-bold text-neutral-900 mb-2">{manufacturer.businessName}</h1>
            <Badge status="connected" className="mb-3">{manufacturer.category}</Badge>
            {manufacturer.businessAddress && (
              <div className="flex items-center gap-1 text-sm text-neutral-400 mb-4"><MapPin className="h-4 w-4" />{manufacturer.businessAddress}</div>
            )}
            <p className="text-sm text-neutral-700 max-w-2xl">{manufacturer.description}</p>
          </div>
          <Button variant={saved ? 'accent' : 'ghost'} onClick={handleToggleSave} className="shrink-0">
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? 'Saved' : 'Save Manufacturer'}
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Products</h2>
      {products.length === 0 ? (
        <EmptyState title="This manufacturer hasn't listed any products yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => {
            const imgSrc = product.imageUrls?.[0] || product.imageUrl || DEFAULT_PRODUCT_IMAGE;
            return (
              <Card key={product.id} hover className="flex flex-col p-0 overflow-hidden">
                <img src={imgSrc} alt={product.name} className="w-full h-60 object-cover bg-neutral-100" />
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">{product.name}</h3>
                  <p className="text-lg font-semibold text-primary mb-1">₱ {Number(product.price).toFixed(2)} / {product.unit}</p>
                  <Badge status={product.stock > 0 ? 'approved' : 'completed'}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                  <div className="mt-auto pt-4">
                    <Link to={`/vendor/product/${product.id}`}><Button fullWidth disabled={product.stock === 0}>{product.stock > 0 ? 'Request Sample' : 'Out of Stock'}</Button></Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
