import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, MapPin, Trash2 } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ConfirmModal } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Manufacturer } from '../../data/mockData';

export default function Connections() {
  const { manufacturers, toggleSaveManufacturer } = useAppStore();
  const saved = manufacturers.filter((m) => m.saved);
  const [unsaveTarget, setUnsaveTarget] = useState<Manufacturer | null>(null);

  const confirmUnsave = () => {
    if (unsaveTarget) {
      toggleSaveManufacturer(unsaveTarget.id);
      toast.success(`Removed ${unsaveTarget.businessName} from connections`);
      setUnsaveTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Connections</h1>
        <span className="text-sm text-neutral-400">{saved.length} saved</span>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={<BookmarkCheck className="h-8 w-8 text-neutral-400" />}
          title="No saved manufacturers"
          description="Browse the Discover page and save manufacturers you'd like to work with."
          actionLabel="Discover Manufacturers"
          actionTo="/vendor/discover"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {saved.map((mf) => (
            <Card key={mf.id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <Link
                    to={`/vendor/manufacturer/${mf.id}`}
                    className="font-semibold text-neutral-900 hover:text-primary truncate block"
                  >
                    {mf.businessName}
                  </Link>
                  <Badge status="connected" className="mt-1">{mf.category}</Badge>
                </div>
                <button
                  onClick={() => setUnsaveTarget(mf)}
                  className="text-neutral-300 hover:text-danger transition-colors p-1"
                  aria-label="Remove connection"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-1 text-sm text-neutral-400 mb-2">
                <MapPin className="h-3.5 w-3.5" />
                {mf.city}, {mf.province}
              </div>
              <p className="text-sm text-neutral-600 line-clamp-2 mb-4">{mf.description}</p>
              <div className="mt-auto">
                <Link to={`/vendor/manufacturer/${mf.id}`}>
                  <Button variant="secondary" fullWidth size="sm">View Profile</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!unsaveTarget}
        onClose={() => setUnsaveTarget(null)}
        onConfirm={confirmUnsave}
        title="Remove Connection?"
        description={`Remove ${unsaveTarget?.businessName} from your saved connections?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
