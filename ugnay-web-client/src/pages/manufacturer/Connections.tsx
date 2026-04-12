import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Users } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import connectionApi from '../../api/connectionApi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import type { Manufacturer } from '../../data/mockData';

export default function MfConnections() {
  const { manufacturers } = useAppStore();
  const [connections, setConnections] = useState<Manufacturer[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await connectionApi.getConnections();
        if (mounted && res?.data) {
          const body = res.data;
          if (body.success && body.data?.items) {
            setConnections(body.data.items);
            return;
          }
        }
      } catch { /* fallback */ }
      // Manufacturer connections — show vendors that have saved them (simplified: show saved manufacturers from store)
      if (mounted) setConnections(manufacturers.filter((m) => m.saved));
    };
    fetch();
    return () => { mounted = false; };
  }, [manufacturers]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-accent" /> My Connections
      </h1>

      {connections.length === 0 ? (
        <EmptyState
          title="No connections yet"
          description="Vendors who save your profile will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connections.map((m) => (
            <Card key={m.id} hover accentBorder className="flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{m.businessName}</h3>
                <Badge status="connected" className="mb-2">{m.category}</Badge>
                <div className="flex items-center gap-1 text-xs text-neutral-400 mb-3">
                  <MapPin className="h-3 w-3" /> {m.city}, {m.province}
                </div>
                <p className="text-sm text-neutral-700 line-clamp-2">{m.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <Link to={`/vendor/manufacturer/${m.id}`}>
                  <Button variant="secondary" fullWidth className="text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
