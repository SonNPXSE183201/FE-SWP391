import { CheckCircle2 } from 'lucide-react';

export function AcceptanceCriteriaViewer({ criteria }: { criteria: string }) {
  if (!criteria) return null;

  return (
    <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 mb-2">
      <p className="text-xs font-bold text-brand mb-3 flex items-center gap-1.5">
        <CheckCircle2 size={15} />
        Tiêu chí nghiệm thu (Vui lòng đảm bảo tuân thủ trước khi nộp bài)
      </p>
      <div className="space-y-2.5 text-sm text-text-primary">
        {criteria.split('\n').map((line, idx) => {
          if (line.startsWith('### ')) {
            return <p key={idx} className="font-bold mt-4 mb-1 text-text-primary">{line.replace('### ', '')}</p>;
          }
          if (line.startsWith('**') && line.includes('**')) {
             return <p key={idx} className="font-bold text-brand mt-2">{line.replace(/\*\*/g, '')}</p>;
          }
          if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
            const isChecked = line.startsWith('- [x] ');
            const text = line.replace(/- \[[ x]\] /, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckCircle2 size={15} className="text-success" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-[4px] border-2 border-text-muted/40 mt-[2px]" />
                  )}
                </div>
                <span className="leading-snug text-[13px] text-text-secondary break-words overflow-hidden whitespace-normal">{text}</span>
              </div>
            );
          }
          if (line.trim() === '') return null;
          return <p key={idx} className="text-[13px] leading-relaxed text-text-secondary break-words overflow-hidden whitespace-normal">{line}</p>;
        })}
      </div>
    </div>
  );
}
