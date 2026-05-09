import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ToggleLeft, ToggleRight, Pencil, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SearchBar } from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import Pagination from '../../components/ui/Pagination';
import productApi from '../../api/productApi';

interface ProductItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  stock: number;
  category?: string;
  manufacturerId: number;
  imageUrl?: string;
  imageUrls?: string[];
  active: boolean;
}

const DEFAULT_PRODUCT_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" fill="none"><rect width="600" height="300" fill="#F1F5F9"/><text x="50%" y="48%" text-anchor="middle" fill="#94A3B8" font-size="40" font-family="system-ui">📦</text><text x="50%" y="60%" text-anchor="middle" fill="#94A3B8" font-size="13" font-family="system-ui">No image</text></svg>`);

const ITEMS_PER_PAGE = 9;

export default function ProductManagement() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getMyProducts();
      const body = res?.data;
      if (body?.success && body.data?.items) setProducts(body.data.items);
    } catch { /* empty state */ }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (!showInactive) list = list.filter((p) => p.active !== false);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, showInactive]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggle = async (product: ProductItem) => {
    try { await productApi.updateProduct(product.id, { name: product.name }); } catch { /* ignore */ }
    setProducts((p) => p.map((x) => (x.id === product.id ? { ...x, active: !x.active } : x)));
    toast.success(`${product.name} ${product.active ? 'deactivated' : 'activated'}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Products</h1>
        <Link to="/manufacturer/products/add"><Button><Plus className="h-4 w-4" /> Add Product</Button></Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><SearchBar placeholder="Search products..." value={search} onChange={(v: string) => { setSearch(v); setPage(1); }} /></div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-neutral-600">
          <input type="checkbox" checked={showInactive} onChange={(e) => { setShowInactive(e.target.checked); setPage(1); }} className="accent-primary" /> Show inactive
        </label>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading products…" />
      ) : paginated.length === 0 ? (
        <EmptyState title="No products found" description="Add your first product to start receiving sample requests." actionLabel="Add Product" actionTo="/manufacturer/products/add" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginated.map((product) => {
            const imgSrc = product.imageUrls?.[0] || product.imageUrl || DEFAULT_PRODUCT_IMAGE;
            return (
              <Card key={product.id} className={`p-0 overflow-hidden flex flex-col ${!product.active ? 'opacity-60' : ''}`}>
                <img src={imgSrc} alt={product.name} className="w-full h-48 object-cover bg-neutral-100" />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
                    <Badge status={product.active ? 'active' : 'inactive'}>{product.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-lg font-semibold text-primary mb-1">₱ {Number(product.price).toFixed(2)} / {product.unit}</p>
                  <p className="text-xs text-neutral-400 mb-4">Stock: {product.stock} {product.unit}s</p>
                  <div className="mt-auto flex gap-2">
                    <Link to={`/manufacturer/products/edit/${product.id}`} className="flex-1"><Button variant="secondary" size="sm" fullWidth><Pencil className="h-3.5 w-3.5" /> Edit</Button></Link>
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(product)} className="shrink-0">
                      {product.active ? <ToggleRight className="h-5 w-5 text-accent" /> : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {totalPages > 1 && <div className="mt-6"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>}
    </div>
  );
}
