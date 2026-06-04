import { ClipboardList } from 'lucide-react';

export const MangakaTasksPage = () => {
  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý Task</h1>
            <p className="page-header__subtitle">Phân công và theo dõi công việc trợ lý vẽ</p>
          </div>
        </div>
      </div>
      {/* TODO: Task list, create task, review submissions */}
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <ClipboardList size={48} className="text-text-muted" />
        <p className="text-text-secondary text-sm">Danh sách task sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
};
