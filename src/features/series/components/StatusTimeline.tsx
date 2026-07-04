import { CheckCircle2, Clock, Circle } from 'lucide-react';
import type { SeriesStatus } from '../../../types/status.types';
import { SERIES_STATUS_STEPS, getStepState } from '../constants';

interface StatusTimelineProps {
  currentStatus: SeriesStatus;
}

export const StatusTimeline = ({ currentStatus }: StatusTimelineProps) => {
  return (
    <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 mb-6">
      <h2 className="text-sm font-semibold text-text-primary mb-4">Tiến trình xét duyệt</h2>
      <div className="flex items-center gap-0">
        {SERIES_STATUS_STEPS.map((step, idx) => {
          const state = getStepState(currentStatus, step.key);
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${state === 'completed' ? 'bg-success text-white' : ''}
                  ${state === 'current' ? 'bg-brand text-white ring-4 ring-brand/20' : ''}
                  ${state === 'inactive' ? 'bg-bg-surface text-text-muted border border-border-custom' : ''}
                `}>
                  {state === 'completed' ? <CheckCircle2 size={16} /> : state === 'current' ? <Clock size={14} /> : <Circle size={12} />}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${state === 'current' ? 'text-brand' : state === 'completed' ? 'text-success' : 'text-text-muted'}`}>
                  {step.label}
                </span>
              </div>
              {idx < SERIES_STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-18px] ${state === 'completed' ? 'bg-success' : 'bg-border-custom'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
