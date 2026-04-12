import { useEffect, useState } from 'react';
import type { Manufacturer, Product } from '../../data/mockData';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import manufacturerApi from '../../api/manufacturerApi';
import productApi from '../../api/productApi';

export default function ManufacturerProfile() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { manufacturers: storeManufacturers, products: storeProducts, toggleSaveManufacturer } = useAppStore();

  const [manufacturer, setManufacturer] = useState<Manufacturer | undefined>(undefined);
  const [mfProducts, setMfProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!id) return;
      try {
        const res = await manufacturerApi.getManufacturer(id);
        if (mounted && res?.data) {
          // SDD shape: { success, data: { id, businessName, ... } }
          const body = res.data;
          setManufacturer(body.success ? body.data : body);
        }
      } catch {
        const found = storeManufacturers.find((m) => m.id === Number(id));
        if (mounted) setManufacturer(found);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [id, storeManufacturers]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!id) return;
      try {
        const res = await productApi.getProducts({ manufacturerId: Number(id) });
        if (mounted && res?.data) {
          const body = res.data;
          // SDD shape: { success, data: { items: [...] } }
          const list = body.success && body.data?.items
            ? body.data.items
            : Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];
          setMfProducts((list as Product[]).filter((p) => p.active !== false));
        }
      } catch {
        const list = storeProducts.filter((p) => p.manufacturerId === Number(id) && p.active);
        if (mounted) setMfProducts(list);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [id, storeProducts]);

  if (!manufacturer) {
    return <EmptyState title="Manufacturer not found" />;
  }

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
            <div className="flex items-center gap-1 text-sm text-neutral-400 mb-4">
              <MapPin className="h-4 w-4" />
              {manufacturer.city}, {manufacturer.province}
            </div>
            <p className="text-sm text-neutral-700 max-w-2xl">{manufacturer.description}</p>
          </div>
          <Button
            variant={manufacturer.saved ? 'accent' : 'ghost'}
            onClick={() => toggleSaveManufacturer(manufacturer.id)}
            className="shrink-0"
          >
            {manufacturer.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {manufacturer.saved ? 'Saved' : 'Save Manufacturer'}
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Products</h2>
      {mfProducts.length === 0 ? (
        <EmptyState title="This manufacturer hasn't listed any products yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mfProducts.map((product) => (
            <Card key={product.id} hover className="flex flex-col p-0 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-60 object-cover" />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">{product.name}</h3>
                <p className="text-lg font-semibold text-primary mb-1">₱ {product.price.toFixed(2)} / {product.unit}</p>
                <p className="text-xs text-neutral-400 mb-2">per {product.unit}</p>
                <Badge status={product.stock > 0 ? 'approved' : 'completed'}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
                <div className="mt-auto pt-4">
                  <Link to={`/vendor/product/${product.id}`}>
                    <Button fullWidth disabled={product.stock === 0}>
                      {product.stock > 0 ? 'Request Sample' : 'Out of Stock'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
