import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Input, TextArea, Select, FileUpload } from '../../components/ui/Input';
import { categories } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useAppStore();
  const isEdit = !!id;
  const existing = isEdit ? products.find((p) => p.id === Number(id)) : null;

  const [form, setForm] = useState({
    name: '',
    category: categories[0],
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
    image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        category: existing.category || categories[0],
        price: String(existing.price),
        unit: existing.unit,
        stock: String(existing.stock),
        description: existing.description || '',
        image: existing.image || '',
      });
    }
  }, [existing]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price is required';
    if (!form.stock || Number(form.stock) < 0) errs.stock = 'Valid stock is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const data = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        stock: Number(form.stock),
        description: form.description.trim(),
        image: form.image || 'https://images.unsplash.com/photo-1607349913338-fca6f7fc608c?w=600',
        manufacturerId: 101,
      };
      if (isEdit && existing) {
        updateProduct(existing.id, data);
        toast.success('Product updated');
      } else {
        addProduct(data);
        toast.success('Product added');
      }
      setLoading(false);
      navigate('/manufacturer/products');
    }, 1200);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/manufacturer/products" className="hover:text-primary">My Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">{isEdit ? 'Edit Product' : 'Add Product'}</span>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <Card className="max-w-[720px] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Product Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g. Organic Coconut Oil"
          />

          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (₱)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="0.00"
            />
            <Select
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            >
              <option value="kg">kg</option>
              <option value="piece">piece</option>
              <option value="liter">liter</option>
              <option value="pack">pack</option>
              <option value="box">box</option>
              <option value="bottle">bottle</option>
            </Select>
            <Input
              label="Stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              error={errors.stock}
              placeholder="0"
            />
          </div>

          <TextArea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your product..."
          />

          <FileUpload
            label="Product Image"
            accept="image/*"
            onChange={(file) => {
              setForm({ ...form, image: URL.createObjectURL(file) });
            }}
          />

          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              {isEdit ? 'Update Product' : 'Add Product'}
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
