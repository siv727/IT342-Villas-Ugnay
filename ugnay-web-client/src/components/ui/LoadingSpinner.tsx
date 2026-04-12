import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export default function LoadingSpinner({ label = 'Loading…', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
    </div>
  );
}
