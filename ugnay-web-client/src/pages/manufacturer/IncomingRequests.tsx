import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  ChevronRight,
} from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Rejected', value: 'rejected' },
];

const PER_PAGE = 6;

export default function IncomingRequests() {
  const { manufacturerRequests } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);

  // show requests TO this manufacturer (101)
  const incoming = useMemo(() => {
    let list = manufacturerRequests.filter((r) => r.manufacturerId === 101);
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          (r.vendorName || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) =>
      sortNewest
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return list;
  }, [manufacturerRequests, statusFilter, search, sortNewest]);

  const totalPages = Math.ceil(incoming.length / PER_PAGE);
  const paged = incoming.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statusIcon = (s: string) => {
    switch (s) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <Package className="h-4 w-4 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Incoming Requests</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => { setStatusFilter(sf.value); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                statusFilter === sf.value
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-xs">
          <SearchBar
            placeholder="Search requests..."
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
          />
        </div>

        <button
          onClick={() => setSortNewest((p) => !p)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {sortNewest ? 'Oldest first' : 'Newest first'}
        </button>
      </div>

      {/* List */}
      {paged.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10 text-neutral-300" />}
          title="No incoming requests"
          description="You don't have any requests matching this filter."
        />
      ) : (
        <div className="grid gap-4">
          {paged.map((r) => (
            <Link
              key={r.id}
              to={`/manufacturer/requests/${r.id}`}
              className="block"
            >
              <Card className="flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {statusIcon(r.status)}
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">{r.productName}</p>
                    <p className="text-xs text-neutral-500">
                      From {r.vendorName} &middot; {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-neutral-800">
                    {r.quantity} {r.unit}
                  </span>
                  <Badge status={r.status}>{r.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Card>
            </Link>
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
