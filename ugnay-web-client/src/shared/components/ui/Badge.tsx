import type { ReactNode } from 'react';

const badgeStyles: Record<string, string> = {
  pending: 'bg-highlight-light text-warning',
  approved: 'bg-[#EDE9FE] text-[#7C3AED]',
  rejected: 'bg-[#FEE2E2] text-error',
  'in-transit': 'bg-primary-light text-primary',
  shipped: 'bg-[#DBEAFE] text-[#2563EB]',
  completed: 'bg-accent-light text-success',
  paid: 'bg-accent-light text-success',
  unpaid: 'bg-highlight-light text-warning',
  failed: 'bg-[#FEE2E2] text-error',
  connected: 'bg-accent-light text-accent',
  featured: 'bg-highlight-light text-neutral-900',
  cancelled: 'bg-neutral-100 text-neutral-400',
  active: 'bg-accent-light text-success',
  inactive: 'bg-neutral-100 text-neutral-400',
  processing: 'bg-highlight-light text-warning',
  delivered: 'bg-[#CCFBF1] text-[#0D9488]',
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${style} ${className}`}>
      {children || status}
    </span>
  );
}
