import { COVER_GRADIENTS } from '../constants';

export const CoverPlaceholder = ({ title, index }: { title: string; index: number }) => (
  <div className={`w-full h-full bg-gradient-to-br ${COVER_GRADIENTS[index % COVER_GRADIENTS.length]} flex items-center justify-center`}>
    <span className="text-3xl font-bold text-white/40 select-none">
      {title.charAt(0)}
    </span>
  </div>
);
