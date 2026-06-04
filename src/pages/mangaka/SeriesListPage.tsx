import { BookOpen, Plus } from 'lucide-react';

export const SeriesListPage = () => {
  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <BookOpen size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Series của tôi</h1>
            <p className="page-header__subtitle">Quản lý toàn bộ series manga</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-colors duration-200 border-none cursor-pointer">
          <Plus size={16} />
          Tạo Series mới
        </button>
      </div>
      {/* TODO: Series list/grid with filters, search, pagination */}
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <BookOpen size={48} className="text-text-muted" />
        <p className="text-text-secondary text-sm">Danh sách series sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
};
