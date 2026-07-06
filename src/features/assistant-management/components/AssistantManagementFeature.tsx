import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, BookOpen, Globe } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { useMySeries } from '../../series/hooks/useSeries';
import { SeriesTeamSection } from './SeriesTeamSection';
import { SystemAssistantDirectory } from './SystemAssistantDirectory';

type AssistantTab = 'directory' | 'series';

const TABS: { key: AssistantTab; label: string; icon: typeof Globe }[] = [
  { key: 'directory', label: 'Danh bạ hệ thống', icon: Globe },
  { key: 'series', label: 'Team bộ truyện', icon: BookOpen },
];

export const AssistantManagementFeature = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seriesId = searchParams.get('seriesId') ?? '';
  const tabParam = searchParams.get('tab') as AssistantTab | null;

  const [activeTab, setActiveTab] = useState<AssistantTab>(
    tabParam === 'directory' || tabParam === 'series'
      ? tabParam
      : 'directory',
  );

  const { data: mySeries = [] } = useMySeries();

  const seriesOptions = useMemo(
    () => mySeries
      .filter((s) => s.status === 'Published')
      .map((s) => ({ value: String(s.id ?? ''), label: s.title ?? '' })),
    [mySeries],
  );

  useEffect(() => {
    if (tabParam === 'directory' || tabParam === 'series') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync tab from URL search params
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: AssistantTab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  };

  const handleTeamSeriesChange = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'series');
    if (!id) {
      next.delete('seriesId');
    } else {
      next.set('seriesId', id);
    }
    setSearchParams(next);
    setActiveTab('series');
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="page-header flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Users size={20} className="text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-header__title">Quản lý trợ lý</h1>
              <HelpTip
                title="Quản lý trợ lý"
                content={
                  <>
                    <p className="mb-2">Tab Danh bạ: tra cứu và mời trợ lý. Tab Team: xem checklist và thành viên.</p>
                  </>
                }
              />
            </div>
            <p className="page-header__subtitle">
              Duyệt danh bạ hệ thống · Bấm Mời để chọn bộ truyện và vai trò
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1 bg-bg-secondary border border-border-custom rounded-xl p-1 w-fit max-w-full overflow-x-auto shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none whitespace-nowrap ${
                isActive
                  ? 'bg-brand/15 text-brand shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface/50'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex-1 min-h-0">
        {activeTab === 'directory' && (
          <SystemAssistantDirectory />
        )}

        {activeTab === 'series' && (
          <div className="space-y-4">
            {seriesOptions.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="w-full sm:max-w-sm">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                    <BookOpen size={13} />
                    Bộ truyện
                  </label>
                  <CustomSelect
                    options={seriesOptions}
                    value={seriesId}
                    onChange={handleTeamSeriesChange}
                    placeholder="Chọn bộ truyện..."
                    icon={<BookOpen size={14} />}
                  />
                </div>
              </div>
            )}

            {seriesId ? (
              <SeriesTeamSection seriesId={seriesId} />
            ) : (
              <div className="bg-bg-secondary border border-dashed border-border-custom rounded-xl p-12 text-center">
                <BookOpen size={36} className="text-text-muted mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary">Chưa chọn bộ truyện</p>
                <p className="text-xs text-text-muted mt-1.5 max-w-sm mx-auto">
                  Chọn bộ truyện để xem checklist và thành viên team.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
