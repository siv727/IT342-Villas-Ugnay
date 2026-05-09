import type { ReactNode } from 'react';

const badgeStyles: Record<string, string> = {
  pending: 'bg-highlight-light text-warning',
  approved: 'bg-accent-light text-success',
  rejected: 'bg-[#FEE2E2] text-error',
  'in-transit': 'bg-primary-light text-primary',
  shipped: 'bg-primary-light text-primary',
  completed: 'bg-neutral-100 text-neutral-700',
  paid: 'bg-accent-light text-success',
  unpaid: 'bg-highlight-light text-warning',
  failed: 'bg-[#FEE2E2] text-error',
  connected: 'bg-accent-light text-accent',
  featured: 'bg-highlight-light text-neutral-900',
  cancelled: 'bg-neutral-100 text-neutral-400',
  active: 'bg-accent-light text-success',
  inactive: 'bg-neutral-100 text-neutral-400',
  processing: 'bg-highlight-light text-warning',
  delivered: 'bg-accent-light text-success',
};

interface BadgeProps {
  status?: string;
  children?: ReactNode;
  className?: string;
}

export default function Badge({ status, children, className = '' }: BadgeProps) {
  const key = status?.toLowerCase().replace(/\s+/g, '-') || 'pending';
  const style = badgeStyles[key] || badgeStyles.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style} ${className}`}>
      {children || status}
    </span>
  );
}
