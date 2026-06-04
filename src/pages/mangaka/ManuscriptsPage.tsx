import { FileText } from 'lucide-react';

export const ManuscriptsPage = () => {
  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <FileText size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý bản thảo</h1>
            <p className="page-header__subtitle">Upload và theo dõi trạng thái bản thảo chapters</p>
          </div>
        </div>
      </div>
      {/* TODO: Chapter list by series, upload flow, status tracking */}
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <FileText size={48} className="text-text-muted" />
        <p className="text-text-secondary text-sm">Bản thảo chapters sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
};
