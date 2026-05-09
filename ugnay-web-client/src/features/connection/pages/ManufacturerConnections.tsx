import { useState, useEffect } from 'react';
import { MapPin, Users } from 'lucide-react';
import connectionApi from '../../../features/connection/api';
import Badge from '../../../shared/components/ui/Badge';
import Card from '../../../shared/components/ui/Card';
import EmptyState from '../../../shared/components/ui/EmptyState';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

interface ConnectionItem {
  id: number;
  manufacturerId?: number;
  vendorId?: number;
  businessName: string;
  category: string;
  businessAddress?: string;
}

export default function MfConnections() {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-accent" /> My Connections
      </h1>

      {loading ? (
        <LoadingSpinner label="Loading connections…" />
      ) : connections.length === 0 ? (
        <EmptyState title="No connections yet" description="Vendors who save your profile will appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connections.map((c) => (
            <Card key={c.id} hover accentBorder className="flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{c.businessName}</h3>
                <Badge status="connected" className="mb-2">{c.category}</Badge>
                {c.businessAddress && (
                  <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3"><MapPin className="h-3 w-3" /> {c.businessAddress}</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
