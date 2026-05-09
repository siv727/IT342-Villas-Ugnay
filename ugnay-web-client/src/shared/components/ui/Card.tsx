import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accentBorder?: boolean;
}

export default function Card({ children, className = '', hover = false, accentBorder = false, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6
        ${hover ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow duration-200' : ''}
        ${accentBorder ? 'border-l-4 border-accent' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  iconColor?: string;
}

export function StatCard({ icon: Icon, value, label, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-neutral-50 ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-xs text-neutral-400">{label}</p>
      </div>
    </Card>
  );
}
