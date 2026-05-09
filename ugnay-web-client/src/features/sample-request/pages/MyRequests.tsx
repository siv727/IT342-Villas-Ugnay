import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Pagination from '../../../shared/components/ui/Pagination';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import sampleRequestApi from '../../../features/sample-request/api';

interface RequestItem {
  id: number;
  status: string;
  createdAt: string;
  deliveryFee?: number;
  items?: { productName?: string; quantity?: number }[];
}

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Paid', 'Shipped', 'Delivered', 'Completed', 'Rejected', 'Cancelled'];
const ITEMS_PER_PAGE = 10;

export default function MyRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await sampleRequestApi.getSampleRequests();
        const body = res?.data;
        if (body?.success && body.data?.items) setRequests(body.data.items);
      } catch { /* empty state */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return requests;
    return requests.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase());
  }, [requests, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      <h1 className="text-[32px] font-bold text-neutral-900 mb-6">My Requests</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading requests…" />
      ) : paginated.length === 0 ? (
        <EmptyState
          title="No requests found"
          description={statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} requests.` : "You haven't created any requests yet."}
          actionLabel="Discover Manufacturers"
          actionTo="/vendor/discover"
        />
      ) : (
        <div className="space-y-4">
          {paginated.map((r) => {
            const firstItem = r.items?.[0];
            return (
              <Link key={r.id} to={`/vendor/requests/${r.id}`}>
                <Card hover className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">
                      {firstItem?.productName || `Request #${r.id}`}
                    </h3>
                    <p className="text-sm text-neutral-400">{r.items?.length || 0} item(s)</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(r.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {r.deliveryFee != null && Number(r.deliveryFee) > 0 && (
                      <span className="text-sm font-semibold text-neutral-900">₱ {Number(r.deliveryFee).toFixed(2)}</span>
                    )}
                    <Badge status={r.status.toLowerCase()}>{r.status}</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      )}
    </div>
  );
}
