import { BriefcaseBusiness } from 'lucide-react';

export const AssistantProfilePage = () => (
  <div>
    <div className="page-header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <BriefcaseBusiness size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="page-header__title">Hồ sơ nghề nghiệp</h1>
          <p className="page-header__subtitle">Thẻ kỹ năng, thống kê và đánh giá</p>
        </div>
      </div>
    </div>
    {/* TODO: Skill tags, stats, rating display (F2.15) */}
    <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
      <BriefcaseBusiness size={48} className="text-text-muted" />
      <p className="text-text-secondary text-sm">Hồ sơ nghề nghiệp sẽ hiển thị ở đây</p>
    </div>
  </div>
);
