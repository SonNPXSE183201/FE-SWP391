import { FileText } from 'lucide-react';

interface PagePlaceholderProps {
  pageNumber: number;
}

const gradients = [
  'from-slate-800 to-slate-900',
  'from-zinc-800 to-zinc-900',
  'from-neutral-800 to-neutral-900',
  'from-gray-800 to-gray-900',
];

export const PagePlaceholder = ({ pageNumber }: PagePlaceholderProps) => {
  const gradient = gradients[pageNumber % gradients.length];

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
      <FileText size={28} className="text-white/20" />
      <span className="text-white/30 text-xs font-medium">Trang {pageNumber}</span>
    </div>
  );
};
