import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import type { Product } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SearchBar } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import Pagination from '../../components/ui/Pagination';
import productApi from '../../api/productApi';

const ITEMS_PER_PAGE = 9;

export default function ProductManagement() {
  const { products: storeProducts, toggleProductActive } = useAppStore();
  const [products, setProducts] = useState(() => storeProducts.filter((p) => p.manufacturerId === 101));

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await productApi.getProducts({ manufacturerId: 101 });
        if (mounted && res?.data) {
          const body = res.data;
          // SDD shape: { success, data: { items: [...], pagination } }
          const list = body.success && body.data?.items
            ? body.data.items
            : Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];
          setProducts((list as Product[]).filter((p) => p.manufacturerId === 101));
        }
      } catch {
        if (mounted) setProducts(storeProducts.filter((p) => p.manufacturerId === 101));
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [storeProducts]);

  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (!showInactive) list = list.filter((p) => p.active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, showInactive]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggle = async (product: Product) => {
    try {
      await productApi.updateProduct(product.id, { name: product.name });
      setProducts((p) => p.map((x) => (x.id === product.id ? { ...x, active: !x.active } : x)));
      toast.success(`${product.name} ${product.active ? 'deactivated' : 'activated'}`);
    } catch {
      toggleProductActive(product.id);
      toast.success(`${product.name} ${product.active ? 'deactivated' : 'activated'}`);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Products</h1>
        <Link to="/manufacturer/products/add">
          <Button><Plus className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar placeholder="Search products..." value={search} onChange={(v: string) => { setSearch(v); setPage(1); }} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-neutral-600">
          <input type="checkbox" checked={showInactive} onChange={(e) => { setShowInactive(e.target.checked); setPage(1); }} className="accent-primary" />
          Show inactive
        </label>
      </div>

      {paginated.length === 0 ? (
        <EmptyState title="No products found" description="Add your first product to start receiving sample requests." actionLabel="Add Product" actionTo="/manufacturer/products/add" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginated.map((product) => (
            <Card key={product.id} className={`p-0 overflow-hidden flex flex-col ${!product.active ? 'opacity-60' : ''}`}>
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
                  <Badge status={product.active ? 'active' : 'inactive'}>{product.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-lg font-semibold text-primary mb-1">₱ {product.price.toFixed(2)} / {product.unit}</p>
                <p className="text-xs text-neutral-400 mb-4">Stock: {product.stock} {product.unit}s</p>
                <div className="mt-auto flex gap-2">
                  <Link to={`/manufacturer/products/edit/${product.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" fullWidth><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(product)} className="shrink-0">
                    {product.active ? <ToggleRight className="h-5 w-5 text-accent" /> : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      )}
    </div>
  );
}
