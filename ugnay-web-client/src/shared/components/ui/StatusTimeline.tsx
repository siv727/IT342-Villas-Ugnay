import { Fragment } from 'react';
import { Check } from 'lucide-react';

const stepStatuses: Record<string, { circle: string; line: string }> = {
  completed: { circle: 'bg-primary text-white', line: 'bg-primary' },
  current: { circle: 'bg-accent text-white', line: 'bg-[#CBD5E1]' },
  upcoming: { circle: 'bg-white border-2 border-[#CBD5E1] text-[#CBD5E1]', line: 'bg-[#CBD5E1]' },
  rejected: { circle: 'bg-error text-white', line: 'bg-error' },
};

interface StatusTimelineProps {
  steps: string[];
  currentStep: string;
  isRejected?: boolean;
}

export default function StatusTimeline({ steps, currentStep, isRejected = false }: StatusTimelineProps) {
  if (isRejected) {
    return (
      <div className="w-full bg-[#FEE2E2] border-l-4 border-error rounded-lg p-4">
        <p className="text-sm font-semibold text-error">This request was rejected by the manufacturer.</p>
      </div>
    );
  }

  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        let status = 'upcoming';
        if (i < currentIndex) status = 'completed';
        else if (i === currentIndex) status = 'current';

        const styles = stepStatuses[status];
        const isLast = i === steps.length - 1;

        return (
          <Fragment key={step}>
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${styles.circle}`}>
                  {status === 'completed' ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {status === 'current' && (
                  <div className="absolute inset-0 rounded-full border-2 border-accent pulse-ring" />
                )}
              </div>
              <span className={`text-[10px] font-medium text-center whitespace-nowrap
                ${status === 'completed' ? 'text-primary' : status === 'current' ? 'text-accent' : 'text-neutral-400'}`}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 ${i < currentIndex ? 'bg-primary' : 'bg-[#CBD5E1]'}`} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
