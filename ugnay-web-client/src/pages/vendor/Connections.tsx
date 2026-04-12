import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, MapPin, ExternalLink } from 'lucide-react';
import connectionApi from '../../api/connectionApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ConnectionItem {
  id: number;
  manufacturerId: number;
  businessName: string;
  category: string;
  businessAddress?: string;
}

export default function Connections() {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await connectionApi.getConnections();
        const body = res?.data;
        if (body?.success && body.data?.items) setConnections(body.data.items);
      } catch { /* empty state */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleUnsave = async (conn: ConnectionItem) => {
    try { await connectionApi.removeConnection(conn.id); } catch { /* ignore */ }
    setConnections((prev) => prev.filter((c) => c.id !== conn.id));
    toast.success(`Removed ${conn.businessName} from saved`);
  };

  return (
    <div>
      <h1 className="text-[32px] font-bold text-neutral-900 mb-6">My Connections</h1>

      {loading ? (
        <LoadingSpinner label="Loading connections…" />
      ) : connections.length === 0 ? (
        <EmptyState title="No saved manufacturers" description="Browse manufacturers and save them to build your connections." actionLabel="Discover Manufacturers" actionTo="/vendor/discover" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connections.map((c) => (
            <Card key={c.id} hover accentBorder className="flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{c.businessName}</h3>
                <Badge status="connected" className="mb-2">{c.category}</Badge>
                {c.businessAddress && (
                  <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3"><MapPin className="h-3 w-3" />{c.businessAddress}</div>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                <Link to={`/vendor/manufacturer/${c.manufacturerId}`} className="flex-1">
                  <Button variant="secondary" fullWidth className="text-xs"><ExternalLink className="h-3.5 w-3.5" /> View Profile</Button>
                </Link>
                <Button variant="ghost" onClick={() => handleUnsave(c)} className="text-xs text-danger"><BookmarkCheck className="h-4 w-4" /> Unsave</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
