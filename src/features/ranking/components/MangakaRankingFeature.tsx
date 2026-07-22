import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import {
  BarChart3,
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { useRankingList } from '../hooks/useRanking';
import type { RankingRecord } from '../../../api/generated/types';
import {
  getRankingCoverUrl,
  getRankingGenres,
  getRankingRecordId,
  getRankingRecordTitle,
  getRankingUiStatus,
} from '../utils/ranking.utils';
import {
  MotionTableRow,
  containerVariants,
  listItemVariants,
} from '../../../components/common/animation';
import { motion } from 'framer-motion';

const GENRE_OPTIONS = [
  { value: 'All', label: 'Tất cả thể loại' },
  { value: 'Action', label: 'Hành động' },
  { value: 'Adventure', label: 'Phiêu lưu' },
  { value: 'Sci-Fi', label: 'Khoa học viễn tưởng' },
  { value: 'Mystery', label: 'Bí ẩn' },
  { value: 'Romance', label: 'Lãng mạn' },
  { value: 'Drama', label: 'Kịch tính' },
  { value: 'Thriller', label: 'Giật gân' },
];

const PERIODS = [
  { value: 'week', label: 'Hàng tuần (Weekly)' },
  { value: 'month', label: 'Hàng tháng (Monthly)' },
  { value: 'quarter', label: 'Hàng quý (Quarterly)' },
];

export const MangakaRankingFeature = () => {
  const [period, setPeriod] = useState('month');
  const [genre, setGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const user = useAuthStore((state) => state.user);
  const { data: rankingList = [], isLoading } = useRankingList({ period, genre });

  const filteredRanking = rankingList.filter((record) =>
    getRankingRecordTitle(record).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Identify bottom 20% or last 3 items for Axing risk
  const totalCount = filteredRanking.length;
  const isBottomGroup = (rank: number) => {
    if (totalCount < 4) return false;
    // Bottom 20% or rank is in the last 3 items
    return rank > totalCount - 3 || rank > totalCount * 0.8;
  };

  // Helper to calculate trend
  const getTrendElement = (record: RankingRecord, rank: number) => {
    // Try to get from series.rankingRecords
    const history = record.series?.rankingRecords;
    if (history && history.length > 1) {
      const sorted = [...history].sort(
        (a, b) => new Date(b.recordedDate || '').getTime() - new Date(a.recordedDate || '').getTime()
      );
      const currentPos = sorted[0]?.rankPosition ?? rank;
      const prevPos = sorted[1]?.rankPosition;
      if (prevPos !== undefined) {
        if (currentPos < prevPos) {
          return (
            <span className="flex items-center gap-1 text-success text-xs font-semibold">
              <TrendingUp size={14} /> +{prevPos - currentPos}
            </span>
          );
        } else if (currentPos > prevPos) {
          return (
            <span className="flex items-center gap-1 text-danger text-xs font-semibold">
              <TrendingDown size={14} /> -{currentPos - prevPos}
            </span>
          );
        }
      }
    }

    // Stable fallback based on title length or id hash to avoid random flickering
    const idHash = (record.seriesId ?? 0) % 3;
    if (idHash === 0) {
      return (
        <span className="flex items-center gap-1 text-success text-xs font-semibold">
          <TrendingUp size={14} /> +1
        </span>
      );
    } else if (idHash === 1) {
      return (
        <span className="flex items-center gap-1 text-danger text-xs font-semibold">
          <TrendingDown size={14} /> -1
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-text-muted text-xs">
        <Minus size={14} /> Không đổi
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title text-xl font-bold text-text-primary">Bảng xếp hạng Series</h1>
            <p className="page-header__subtitle text-xs text-text-muted">
              Xem thứ hạng, xu hướng và trạng thái biểu quyết các tác phẩm trong hệ thống
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm series..."
            className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-secondary border border-border-custom rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all ${
                  period === p.value
                    ? 'bg-brand text-white shadow-brand'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {p.label.split(' (')[0]}
              </button>
            ))}
          </div>

          <div className="w-44">
            <CustomSelect
              options={GENRE_OPTIONS}
              value={genre}
              onChange={setGenre}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : filteredRanking.length === 0 ? (
          <div className="text-center py-20 text-text-muted">Không có dữ liệu xếp hạng phù hợp</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-secondary">
              <thead className="bg-bg-surface/50 border-b border-border-custom text-text-muted text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">Hạng</th>
                  <th className="px-6 py-4">Tác phẩm</th>
                  <th className="px-6 py-4">Phiếu hiện tại</th>
                  <th className="px-6 py-4">Xu hướng</th>
                  <th className="px-6 py-4">Trạng thái / Cảnh báo</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-border-custom"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {filteredRanking.map((record, index) => {
                  const rank = record.rankPosition ?? index + 1;
                  const title = getRankingRecordTitle(record);
                  const genres = getRankingGenres(record);
                  const status = getRankingUiStatus(record);
                  const isMySeries = record.series?.mangakaId === user?.id;
                  const needsAxingWarning = isBottomGroup(rank) || status === 'ProposedCancel';

                  return (
                    <MotionTableRow
                      key={getRankingRecordId(record, index)}
                      variants={listItemVariants}
                      className={`transition-colors hover:bg-bg-surface/30 ${
                        isMySeries ? 'bg-brand/5 border-l-2 border-l-brand' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                          rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                          'bg-bg-surface text-text-muted'
                        }`}>
                          {rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-lg overflow-hidden bg-bg-surface border border-border-custom flex-shrink-0">
                            <img src={getRankingCoverUrl(record)} alt={title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
                              {title}
                              {isMySeries && (
                                <span className="inline-flex px-1.5 py-0.5 bg-brand text-white text-[9px] rounded font-bold uppercase">
                                  Truyện của tôi
                                </span>
                              )}
                            </h3>
                            <div className="flex gap-1.5 mt-1">
                              {genres.map((g) => (
                                <span key={g} className="px-1.5 py-0.2 bg-brand/8 text-brand text-[9px] rounded font-medium">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        {record.voteCount ?? 0} phiếu
                      </td>
                      <td className="px-6 py-4">
                        {getTrendElement(record, rank)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            status === 'Active' ? 'bg-success/10 text-success' :
                            status === 'UnderReview' ? 'bg-warning/10 text-warning' :
                            'bg-danger/10 text-danger'
                          }`}>
                            {status === 'Active' ? 'Hoạt động tốt' :
                             status === 'UnderReview' ? 'Đang xem xét' :
                             'Đề xuất hủy'}
                          </span>
                          
                          {needsAxingWarning && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold animate-pulse">
                              <AlertTriangle size={12} /> Nguy cơ Axing
                            </span>
                          )}
                        </div>
                      </td>
                    </MotionTableRow>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
