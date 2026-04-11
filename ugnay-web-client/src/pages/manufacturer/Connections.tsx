import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '../../stores/appStore';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function Connections() {
  const { manufacturerRequests } = useAppStore();

  const vendors = useMemo(() => {
    const map = new Map<string, { name: string; count: number; lastRequest: string }>();
    manufacturerRequests.forEach((r) => {
      const name = r.vendorName || 'Unknown Vendor';
      const existing = map.get(name);
      const created = r.createdAt || '';
      if (!existing) map.set(name, { name, count: 1, lastRequest: created });
      else {
        existing.count += 1;
        if (created && created > existing.lastRequest) existing.lastRequest = created;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [manufacturerRequests]);

  if (vendors.length === 0) return <EmptyState title="No connections yet" description="No vendor connections for your products." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Connections</h1>
        <Link to="/manufacturer/requests"><Button variant="secondary">View Requests</Button></Link>
      </div>

      <div className="grid gap-4">
        {vendors.map((v) => (
          <Card key={v.name} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-neutral-900">{v.name}</div>
              <div className="text-sm text-neutral-500">Last request: {v.lastRequest || '—'}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{v.count}</div>
              <div className="text-xs text-neutral-500">requests</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
