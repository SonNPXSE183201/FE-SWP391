import { Palette } from 'lucide-react';

export const PortfolioPage = () => (
  <div>
    <div className="page-header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <Palette size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="page-header__title">Portfolio</h1>
          <p className="page-header__subtitle">Showcase các tác phẩm đã hoàn thành</p>
        </div>
      </div>
    </div>
    <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
      <Palette size={48} className="text-text-muted" />
      <p className="text-text-secondary text-sm">Portfolio sẽ hiển thị ở đây</p>
    </div>
  </div>
);
