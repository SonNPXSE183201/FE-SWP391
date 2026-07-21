import { useAuthStore } from '../../../stores/authStore';
import { useRankingList } from '../hooks/useRanking';
import { Loader2, Minus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MangakaRankingFeature = () => {
  const { user } = useAuthStore();
  const { data: rankings, isLoading } = useRankingList();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-muted">
        <p>Hiện chưa có dữ liệu bảng xếp hạng.</p>
      </div>
    );
  }

  // Calculate trends and axing risks
  // Axing risk: bottom 20% or low votes
  const totalSeries = rankings.length;
  const axingThreshold = Math.ceil(totalSeries * 0.8); // bottom 20%

  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary border border-border-custom rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border-custom flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Bảng xếp hạng Truyện tranh</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-bg-surface text-text-secondary text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Thứ hạng</th>
                <th className="px-6 py-4">Tên bộ truyện</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Tổng số phiếu</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Xu hướng</th>
                <th className="px-6 py-4 text-center">Cảnh báo Axing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {rankings.map((item) => {
                const isMine = item.series?.mangakaId === user?.id;
                const isDanger = item.rankPosition && item.rankPosition >= axingThreshold;
                
                return (
                  <tr 
                    key={item.id} 
                    className={`
                      hover:bg-bg-surface/50 transition-colors cursor-pointer
                      ${isMine ? 'bg-brand/5' : ''}
                    `}
                    onClick={() => navigate(`/mangaka/series/${item.seriesId}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${item.rankPosition && item.rankPosition <= 3 ? 'text-brand' : 'text-text-primary'}`}>
                          #{item.rankPosition}
                        </span>
                        {isMine && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand text-white uppercase tracking-wider">
                            Của bạn
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary hover:text-brand transition-colors">
                        {item.series?.title || 'Không rõ'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-text-primary">
                      {item.voteCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <Minus size={16} className="text-text-muted" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isDanger && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium" title="Nguy cơ Hủy xuất bản">
                          <AlertTriangle size={14} />
                          <span>Nguy hiểm</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
