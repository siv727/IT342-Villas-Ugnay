import type { ReactNode } from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({ icon, title, description, action, actionLabel, actionTo }: EmptyStateProps) {
  const iconContent = icon || <Package className="h-8 w-8 text-neutral-400" />;
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] py-12 text-center">
      <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
        {iconContent}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-400 mb-6 max-w-sm">{description}</p>}
      {action}
      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
