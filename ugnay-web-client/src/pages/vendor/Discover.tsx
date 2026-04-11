import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { psgcData, categories } from '../../data/mockData';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SearchBar, Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import manufacturerApi from '../../api/manufacturerApi';

export default function Discover() {
  const { manufacturers: storeManufacturers, toggleSaveManufacturer } = useAppStore();
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('All');
  const [manufacturers, setManufacturers] = useState(storeManufacturers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  // debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const cities: string[] = province ? psgcData[province] || [] : [];

  const filtered = useMemo(() => {
    return manufacturers.filter((m) => {
      const matchSearch = !search ||
        m.businessName.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase());
      const matchProvince = !province || m.province === province;
      const matchCity = !city || m.city === city;
      const matchCategory = category === 'All' || m.category === category;
      return matchSearch && matchProvince && matchCity && matchCategory;
    });
  }, [manufacturers, search, province, city, category]);

  // update debounced search when user types
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, unknown> = { page, limit };
        if (province) params.province = province;
        if (city) params.city = city;
        if (category && category !== 'All') params.category = category;
        if (debouncedSearch) params.q = debouncedSearch;
        const res = await manufacturerApi.getManufacturers(params);
        if (mounted && res && res.data) {
          // API may return paginated shape { data, total, page, limit }
          if (res.data.data && Array.isArray(res.data.data)) {
            setManufacturers(res.data.data);
            setTotalPages(Math.ceil((res.data.total || res.data.totalItems || res.data.count || res.data.data.length) / limit));
          } else {
            setManufacturers(res.data);
            setTotalPages(Math.ceil((res.data.length || 0) / limit));
          }
        }
      } catch {
        // fallback to local store
        setError('Could not load from API, using local data');
        setManufacturers(storeManufacturers);
        setTotalPages(Math.ceil(storeManufacturers.length / limit));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, [province, city, category, debouncedSearch, storeManufacturers, page, limit]);

  return (
    <div>
      {loading && <div className="mb-4 text-sm text-neutral-500">Loading manufacturers…</div>}
      {error && <div className="mb-4 text-sm text-danger">{error}</div>}
      <h1 className="text-[32px] font-bold text-neutral-900 mb-6">Discover Manufacturers</h1>

      {/* Search & filters */}
      <div className="space-y-4 mb-8">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by business name or category..."
          className="max-w-xl"
        />
        <div className="flex flex-wrap gap-3">
          <Select value={province} onChange={(e) => { setProvince(e.target.value); setCity(''); }} className="w-44">
            <option value="">All Provinces</option>
            {Object.keys(psgcData).map((p) => (<option key={p} value={p}>{p}</option>))}
          </Select>
          <Select value={city} onChange={(e) => setCity(e.target.value)} className="w-44" disabled={!province}>
            <option value="">All Cities</option>
            {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
                ${category === c
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-700 border-[#CBD5E1] hover:border-primary'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No manufacturers found"
          description="Try adjusting your filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <Card key={m.id} hover accentBorder className="flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{m.businessName}</h3>
                <Badge status="connected" className="mb-2">{m.category}</Badge>
                <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3">
                  <MapPin className="h-3 w-3" />
                  {m.city}, {m.province}
                </div>
                <p className="text-sm text-neutral-700 line-clamp-2">{m.description}</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                <Link to={`/vendor/manufacturer/${m.id}`} className="flex-1">
                  <Button variant="secondary" fullWidth className="text-xs">View Profile</Button>
                </Link>
                <Button
                  variant={m.saved ? 'accent' : 'ghost'}
                  onClick={() => toggleSaveManufacturer(m.id)}
                  className="text-xs"
                >
                  {m.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {m.saved ? 'Saved' : 'Save'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
