import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Connections() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Connections</h1>
      <EmptyState title="You have no connections yet." description="Connect with manufacturers to start requesting samples." />
      <div className="mt-6">
        <Card className="p-4">
          <p className="mb-3">Discover manufacturers and send connection requests.</p>
          <Button>Discover Manufacturers</Button>
        </Card>
      </div>
    </div>
  );
}
