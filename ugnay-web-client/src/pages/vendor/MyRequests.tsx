import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, SlidersHorizontal } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'In Transit', 'Completed', 'Rejected', 'Cancelled'];
const ITEMS_PER_PAGE = 10;

export default function MyRequests() {
  const { vendorRequests } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...vendorRequests];
    if (statusFilter !== 'All') {
      list = list.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase());
    }
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortDesc ? db - da : da - db;
    });
    return list;
  }, [vendorRequests, statusFilter, sortDesc]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Sample Requests</h1>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sort toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setSortDesc((v) => !v)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-primary"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Date: {sortDesc ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Cards */}
      {paginated.length === 0 ? (
        <EmptyState
          title="No requests found"
          description={statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} requests.` : undefined}
        />
      ) : (
        <div className="space-y-4">
          {paginated.map((req) => (
            <Link key={req.id} to={`/vendor/requests/${req.id}`}>
              <Card hover className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 truncate">{req.productName}</h3>
                  <p className="text-sm text-neutral-400">{req.manufacturerName}</p>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(req.createdAt).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-neutral-900">
                    &#8369; {req.total.toFixed(2)}
                  </span>
                  <Badge status={req.status.toLowerCase().replace(' ', '-')}>
                    {req.status}
                  </Badge>
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
