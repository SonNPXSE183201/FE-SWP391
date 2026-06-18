import { useState } from 'react';
import { RankingFeature, RankingDataEntryFeature } from '../../features/ranking';

type Tab = 'ranking' | 'data-entry';

export const RankingPage = () => {
  const [tab, setTab] = useState<Tab>('ranking');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border-custom">
        {([
          { id: 'ranking' as const, label: 'Bảng xếp hạng' },
          { id: 'data-entry' as const, label: 'Nhập liệu (F4.4)' },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
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
