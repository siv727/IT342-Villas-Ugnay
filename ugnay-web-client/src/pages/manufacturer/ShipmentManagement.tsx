import EmptyState from '../../components/ui/EmptyState';
import useAppStore from '../../stores/appStore';
import Card from '../../components/ui/Card';
import type { Shipment } from '../../data/mockData';

export default function ShipmentManagement() {
  const { shipments } = useAppStore();

  if (!shipments || shipments.length === 0) return <EmptyState title="No shipments yet" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shipments</h1>
      <div className="grid gap-4">
        {shipments.map((s: Shipment) => (
          <Card key={s.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-neutral-500">#{s.id} · {s.productName}</div>
                <div className="font-medium">{s.courier} · {s.status}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
