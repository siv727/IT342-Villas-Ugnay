import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck } from 'lucide-react';
import { categories } from '../../data/mockData';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import manufacturerApi from '../../api/manufacturerApi';
import connectionApi from '../../api/connectionApi';
import toast from 'react-hot-toast';

interface ManufacturerItem {
  id: number;
  businessName: string;
  category: string;
  businessAddress?: string;
  description?: string;
}

export default function Discover() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [manufacturers, setManufacturers] = useState<ManufacturerItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, size: PAGE_SIZE };
        if (category && category !== 'All') params.category = category;
        if (debouncedSearch) params.q = debouncedSearch;
        const res = await manufacturerApi.getManufacturers(params);
        if (mounted && res?.data) {
          const body = res.data;
          if (body.success && body.data?.items) {
            setManufacturers(body.data.items);
            const total = body.data.pagination?.total ?? body.data.items.length;
            setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
          }
        }
      } catch { if (mounted) setManufacturers([]); }
      finally { if (mounted) setLoading(false); }
    };
    fetch();
    return () => { mounted = false; };
  }, [category, debouncedSearch, page]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await connectionApi.getConnections();
        const body = res?.data;
        if (body?.success && body.data?.items) {
          setSavedIds(new Set<number>(body.data.items.map((c: { manufacturerId: number }) => c.manufacturerId)));
        }
      } catch { /* ignore */ }
    };
    fetchConnections();
  }, []);

  const handleToggleSave = async (mfr: ManufacturerItem) => {
    if (savedIds.has(mfr.id)) {
      try {
        const res = await connectionApi.getConnections();
        const body = res?.data;
        if (body?.success && body.data?.items) {
          const conn = body.data.items.find((c: { manufacturerId: number }) => c.manufacturerId === mfr.id);
          if (conn) await connectionApi.removeConnection(conn.id);
        }
      } catch { /* ignore */ }
      setSavedIds((prev) => { const s = new Set(prev); s.delete(mfr.id); return s; });
      toast.success(`Removed ${mfr.businessName} from saved`);
    } else {
      try { await connectionApi.saveManufacturer(mfr.id); } catch { /* ignore */ }
      setSavedIds((prev) => new Set(prev).add(mfr.id));
      toast.success(`Saved ${mfr.businessName}`);
    }
  };

  return (
    <div>
      <h1 className="text-[32px] font-bold text-neutral-900 mb-6">Discover Manufacturers</h1>

      <div className="space-y-4 mb-8">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by business name or category..." className="max-w-xl" />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                category === c ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-700 border-[#CBD5E1] hover:border-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading manufacturers…" />
      ) : manufacturers.length === 0 ? (
        <EmptyState title="No manufacturers found" description="Try adjusting your filters" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {manufacturers.map((m) => (
            <Card key={m.id} hover accentBorder className="flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{m.businessName}</h3>
                <Badge status="connected" className="mb-2">{m.category}</Badge>
                {m.businessAddress && (
                  <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3"><MapPin className="h-3 w-3" />{m.businessAddress}</div>
                )}
                <p className="text-sm text-neutral-700 line-clamp-2">{m.description}</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                <Link to={`/vendor/manufacturer/${m.id}`} className="flex-1">
                  <Button variant="secondary" fullWidth className="text-xs">View Profile</Button>
                </Link>
                <Button variant={savedIds.has(m.id) ? 'accent' : 'ghost'} onClick={() => handleToggleSave(m)} className="text-xs">
                  {savedIds.has(m.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {savedIds.has(m.id) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {totalPages > 1 && <div className="mt-6"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>}
    </div>
  );
}
