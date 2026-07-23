import { BarChart3 } from 'lucide-react';
import { useRankingList } from '../hooks/useRanking';
import { PageScaffold } from '../../../components/common/PageScaffold';
import { getRankingRecordTitle } from '../utils/ranking.utils';

export const RankingTable = () => {
  const { data: list = [], isLoading } = useRankingList();

  return (
    <PageScaffold title="Xếp hạng Series" subtitle="Bảng xếp hạng theo điểm" icon={BarChart3}>
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
        {isLoading ? (
          <div className="text-text-muted">Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-left">
                <th className="pb-2">#</th>
                <th className="pb-2">Series</th>
                <th className="pb-2">Phiếu</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={`${r.id ?? r.seriesId ?? i}_${i}`} className="border-t border-border-custom">
                  <td className="py-3 w-10">{r.rankPosition ?? i + 1}</td>
                  <td className="py-3">{getRankingRecordTitle(r)}</td>
                  <td className="py-3 font-semibold">{r.voteCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageScaffold>
  );
};
