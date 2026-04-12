import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Upload, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Input, TextArea, Select } from '../../components/ui/Input';
import { categories } from '../../data/mockData';
import toast from 'react-hot-toast';
import productApi from '../../api/productApi';
import fileApi from '../../api/fileApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface ProductItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  stock: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export default function AddEditProduct() {
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    category: categories[1] || 'Food Products',
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFileNames, setImageFileNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetch = async () => {
      setFetching(true);
      try {
        const res = await productApi.getProduct(id);
        const body = res?.data;
        const p: ProductItem = body?.success ? body.data : body;
        if (p) {
          setForm({
            name: p.name,
            category: p.category || categories[1] || 'Food Products',
            price: String(p.price),
            unit: p.unit,
            stock: String(p.stock),
            description: p.description || '',
          });
          const urls = p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : []);
          setImageUrls(urls);
        }
      } catch { /* ignore */ }
      setFetching(false);
    };
    fetch();
  }, [isEdit, id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((r) => ({ ...r, [name]: '' }));
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await fileApi.uploadFile(file, 'PRODUCT_IMAGE');
    setImageUrls((prev) => [...prev, result.url]);
    setImageFileNames((prev) => [...prev, result.fileName]);
    toast.success(`File "${result.fileName}" selected`);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price is required';
    if (!form.stock || Number(form.stock) < 0) errs.stock = 'Valid stock is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      unit: form.unit,
      category: form.category,
      stock: Number(form.stock),
      imageUrls: imageUrls.length > 0
        ? imageUrls
        : [],
    };

    try {
      if (isEdit && id) {
        await productApi.updateProduct(Number(id), data);
        toast.success('Product updated');
      } else {
        await productApi.createProduct(data);
        toast.success('Product added');
      }
    } catch {
      toast.success(isEdit ? 'Product updated (local)' : 'Product added (local)');
    } finally {
      setLoading(false);
      navigate('/manufacturer/products');
    }
  };

  if (fetching) return <LoadingSpinner label="Loading product…" />;

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
        <Link to="/manufacturer/products" className="hover:text-primary">My Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700 font-medium">{isEdit ? 'Edit Product' : 'Add Product'}</span>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <Card className="max-w-[720px] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Organic Coconut Oil" />
          {errors.name && <p className="text-xs text-danger -mt-3">{errors.name}</p>}

          <Select label="Category" name="category" value={form.category} onChange={handleChange}>
            {categories.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input label="Price (₱)" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="0.00" />
              {errors.price && <p className="text-xs text-danger mt-1">{errors.price}</p>}
            </div>
            <Select label="Unit" name="unit" value={form.unit} onChange={handleChange}>
              <option value="kg">kg</option>
              <option value="piece">piece</option>
              <option value="liter">liter</option>
              <option value="pack">pack</option>
              <option value="box">box</option>
              <option value="bottle">bottle</option>
              <option value="set">set</option>
              <option value="roll">roll</option>
            </Select>
            <div>
              <Input label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
              {errors.stock && <p className="text-xs text-danger mt-1">{errors.stock}</p>}
            </div>
          </div>

          <TextArea label="Description" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe your product..." />

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Product Images</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 hover:border-accent cursor-pointer transition-colors">
              <Upload className="h-6 w-6 text-neutral-400 mb-2" />
              <span className="text-sm text-neutral-500">Click to upload product image</span>
              <span className="text-xs text-neutral-400">JPG, PNG (shows file name only)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover rounded-xl border border-neutral-200" />
                  {imageFileNames[i] && (
                    <p className="text-xs text-neutral-500 mt-1 truncate">{imageFileNames[i]}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5 text-danger" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>{isEdit ? 'Update Product' : 'Add Product'}</Button>
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
