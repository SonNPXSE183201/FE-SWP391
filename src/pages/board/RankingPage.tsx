import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RankingFeature, RankingDataEntryFeature } from '../../features/ranking';

type Tab = 'ranking' | 'data-entry';

const isTab = (value: string | null): value is Tab =>
  value === 'ranking' || value === 'data-entry';

export const RankingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<Tab>(isTab(tabParam) ? tabParam : 'ranking');

  const selectTab = (next: Tab) => {
    setTab(next);
    setSearchParams(next === 'data-entry' ? { tab: 'data-entry' } : {}, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border-custom">
        {([
          { id: 'ranking' as const, label: 'Bảng xếp hạng' },
          { id: 'data-entry' as const, label: 'Nhập liệu (F4.4)' },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => selectTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer ${
              tab === t.id ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'ranking' ? <RankingFeature /> : <RankingDataEntryFeature />}
    </div>
  );
};
