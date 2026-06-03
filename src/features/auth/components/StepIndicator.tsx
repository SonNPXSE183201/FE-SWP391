interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export const StepIndicator = ({ currentStep, totalSteps, labels }: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2.5 flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0
                ${i < currentStep
                  ? 'bg-success text-white shadow-lg shadow-success/30'
                  : i === currentStep
                    ? 'bg-gradient-to-br from-brand to-brand-hover text-white shadow-lg shadow-brand/30 ring-2 ring-brand/30'
                    : 'bg-bg-surface text-text-muted border border-border-custom'
                }`}
            >
              {i < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-medium transition-colors duration-200 hidden sm:block
                ${i <= currentStep ? 'text-text-primary' : 'text-text-muted'
                }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`h-0.5 flex-1 rounded-full transition-all duration-500 min-w-[20px]
                ${i < currentStep ? 'bg-success' : 'bg-border-custom'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
