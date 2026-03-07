import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, manufacturers } = useAppStore();
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return <EmptyState title="Product not found" />;
  }

  const manufacturer = manufacturers.find((m) => m.id === product.manufacturerId);
  const moreProducts = products
    .filter((p) => p.manufacturerId === product.manufacturerId && p.id !== product.id && p.active)
    .slice(0, 4);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/vendor/discover" className="hover:text-primary">Discover</Link>
        <ChevronRight className="h-3 w-3" />
        {manufacturer && (
          <>
            <Link
              to={`/vendor/manufacturer/${manufacturer.id}`}
              className="hover:text-primary"
            >
              {manufacturer.businessName}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-neutral-700 font-medium">{product.name}</span>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-primary hover:underline mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Left — image 55% */}
        <div className="lg:w-[55%] shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[420px] object-cover rounded-2xl shadow-md"
          />
        </div>

        {/* Right — details 45% */}
        <div className="lg:w-[45%] flex flex-col">
          <h1 className="text-2xl lg:text-[28px] font-bold text-neutral-900 mb-2">
            {product.name}
          </h1>

          <p className="text-2xl font-bold text-primary mb-1">
            &#8369; {product.price.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-400 mb-4">per {product.unit}</p>

          <Badge status={product.stock > 0 ? 'approved' : 'completed'} className="mb-4 self-start">
            {product.stock > 0 ? `In Stock — ${product.stock} ${product.unit}s` : 'Out of Stock'}
          </Badge>

          {manufacturer && (
            <div className="text-sm text-neutral-700 mb-2">
              <strong className="text-neutral-900">Category:</strong> {manufacturer.category}
            </div>
          )}

          {manufacturer && (
            <div className="text-sm text-neutral-700 mb-4">
              <strong className="text-neutral-900">Manufacturer:</strong>{' '}
              <Link
                to={`/vendor/manufacturer/${manufacturer.id}`}
                className="text-primary hover:underline"
              >
                {manufacturer.businessName}
              </Link>
            </div>
          )}

          <p className="text-sm text-neutral-600 mb-8 leading-relaxed">{product.description}</p>

          <div className="mt-auto flex flex-col gap-3">
            <Link to={`/vendor/request/create?product=${product.id}`}>
              <Button fullWidth disabled={product.stock === 0}>
                Request Sample
              </Button>
            </Link>
            {manufacturer && (
              <Link to={`/vendor/manufacturer/${manufacturer.id}`}>
                <Button variant="secondary" fullWidth>
                  View Manufacturer
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* More from this Manufacturer */}
      {moreProducts.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            More from {manufacturer?.businessName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {moreProducts.map((p) => (
              <Card key={p.id} hover className="p-0 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-neutral-900 mb-1">{p.name}</h3>
                  <p className="text-sm font-semibold text-primary mb-2">
                    &#8369; {p.price.toFixed(2)} / {p.unit}
                  </p>
                  <Link to={`/vendor/product/${p.id}`}>
                    <Button variant="secondary" size="sm" fullWidth>View</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
