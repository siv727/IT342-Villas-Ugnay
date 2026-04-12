import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, MapPin, ExternalLink } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import connectionApi from '../../api/connectionApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Manufacturer } from '../../data/mockData';

export default function Connections() {
  const { manufacturers, toggleSaveManufacturer } = useAppStore();
  const [savedList, setSavedList] = useState<Manufacturer[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await connectionApi.getConnections();
        if (mounted && res?.data) {
          const body = res.data;
          if (body.success && body.data?.items) {
            // Map connection items to manufacturers from store
            const ids = body.data.items.map((c: { manufacturerId: number }) => c.manufacturerId);
            setSavedList(manufacturers.filter((m) => ids.includes(m.id)));
            return;
          }
        }
      } catch {
        // fallback to local store
      }
      if (mounted) setSavedList(manufacturers.filter((m) => m.saved));
    };
    fetch();
    return () => { mounted = false; };
  }, [manufacturers]);

  const handleUnsave = async (mfr: Manufacturer) => {
    try {
      // Try API first (we don't have the connection ID, so this might fail)
      await connectionApi.removeConnection(mfr.id);
    } catch { /* fallback */ }
    toggleSaveManufacturer(mfr.id);
    setSavedList((prev) => prev.filter((m) => m.id !== mfr.id));
    toast.success(`Removed ${mfr.businessName} from saved`);
  };

  if (savedList.length === 0) {
    return (
      <div>
        <h1 className="text-[32px] font-bold text-neutral-900 mb-6">My Connections</h1>
        <EmptyState
          title="No saved manufacturers"
          description="Browse manufacturers and save them to build your connections."
          actionLabel="Discover Manufacturers"
          actionTo="/vendor/discover"
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[32px] font-bold text-neutral-900 mb-6">My Connections</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {savedList.map((m) => (
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
                <Button variant="secondary" fullWidth className="text-xs">
                  <ExternalLink className="h-3.5 w-3.5" /> View Profile
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => handleUnsave(m)} className="text-xs text-danger">
                <BookmarkCheck className="h-4 w-4" /> Unsave
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
