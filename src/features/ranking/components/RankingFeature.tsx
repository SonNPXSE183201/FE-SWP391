import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Search,
  ThumbsUp,
  ThumbsDown,
  X,
  Loader2,
} from 'lucide-react';
import type { RankingRecord } from '../../../api/generated/types';
import { useRankingList, useSubmitRankingVote } from '../hooks/useRanking';
import {
  getRankingCoverUrl,
  getRankingGenres,
  getRankingRecordId,
  getRankingRecordTitle,
  getRankingUiStatus,
} from '../ranking.utils';

const GENRES = ['All', 'Action', 'Adventure', 'Sci-Fi', 'Mystery', 'Romance', 'Drama', 'Thriller'];
const PERIODS = [
  { value: 'week', label: 'Hàng tuần (Weekly)' },
  { value: 'month', label: 'Hàng tháng (Monthly)' },
  { value: 'quarter', label: 'Hàng quý (Quarterly)' },
];

export const RankingFeature = () => {
  const [period, setPeriod] = useState('month');
  const [genre, setGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RankingRecord | null>(null);
  const [voteAction, setVoteAction] = useState<'maintain' | 'cancel'>('maintain');
  const [comment, setComment] = useState('');

  const { data: rankingList = [], isLoading } = useRankingList({ period, genre });
  const submitVoteMutation = useSubmitRankingVote();

  const handleOpenVote = (record: RankingRecord, action: 'maintain' | 'cancel') => {
    setSelectedRecord(record);
    setVoteAction(action);
    setComment('');
    setShowVoteModal(true);
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      await submitVoteMutation.mutateAsync({
        seriesId: getRankingRecordId(selectedRecord),
        action: voteAction,
        comment,
      });
      toast.success(`Bỏ phiếu thành công cho "${getRankingRecordTitle(selectedRecord)}"!`);
      setShowVoteModal(false);
    } catch {
      toast.error('Gửi phiếu thất bại. Vui lòng thử lại.');
    }
  };

  const filteredRanking = rankingList.filter((record) =>
    getRankingRecordTitle(record).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Bảng xếp hạng Series</h1>
            <p className="page-header__subtitle">Giám sát và bỏ phiếu duy trì / đề xuất hủy tác phẩm</p>
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

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="bg-bg-secondary border border-border-custom rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                Thể loại: {g === 'All' ? 'Tất cả' : g}
              </option>
            ))}
          </select>
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
                  <th className="px-6 py-4">Lượt xem (Views)</th>
                  <th className="px-6 py-4">Phiếu hiện tại</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {filteredRanking.map((record, index) => {
                  const rank = record.rankPosition ?? index + 1;
                  const title = getRankingRecordTitle(record);
                  const genres = getRankingGenres(record);
                  const status = getRankingUiStatus(record);

                  return (
                    <tr key={getRankingRecordId(record, index)} className="hover:bg-bg-surface/30 transition-colors">
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
                            <h3 className="font-semibold text-text-primary text-sm hover:text-brand transition-colors cursor-pointer">
                              {title}
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
                      <td className="px-6 py-4 font-mono font-medium text-text-primary">0</td>
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        {record.voteCount ?? 0} phiếu
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          status === 'Active' ? 'bg-success/10 text-success' :
                          status === 'UnderReview' ? 'bg-warning/10 text-warning' :
                          'bg-danger/10 text-danger'
                        }`}>
                          {status === 'Active' ? 'Hoạt động tốt' :
                           status === 'UnderReview' ? 'Đang xem xét' :
                           'Đề xuất hủy'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenVote(record, 'maintain')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-success/10 hover:bg-success/15 text-success rounded-lg text-xs font-semibold cursor-pointer border-none transition-all"
                          >
                            <ThumbsUp size={12} />
                            Duy trì
                          </button>
                          <button
                            onClick={() => handleOpenVote(record, 'cancel')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-danger/10 hover:bg-danger/15 text-danger rounded-lg text-xs font-semibold cursor-pointer border-none transition-all"
                          >
                            <ThumbsDown size={12} />
                            Đề xuất hủy
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showVoteModal && selectedRecord && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVoteModal(false)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-border-custom pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  Bỏ phiếu xét duyệt
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5">{getRankingRecordTitle(selectedRecord)}</p>
              </div>
              <button
                onClick={() => setShowVoteModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVoteSubmit} className="space-y-4">
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Loại phiếu quyết định</span>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  voteAction === 'maintain' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                }`}>
                  {voteAction === 'maintain' ? 'Ủng hộ DUY TRÌ' : 'Yêu cầu HỦY BỎ'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Ý kiến / Lý do đóng góp <span className="text-danger">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Vui lòng cung cấp phân tích hoặc lý do chi tiết..."
                  rows={4}
                  className="w-full bg-bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand resize-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-border-custom flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  className="px-4 py-2 border border-border-custom bg-transparent hover:bg-bg-surface text-text-secondary rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitVoteMutation.isPending}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer border-none flex items-center gap-1.5 text-white ${
                    voteAction === 'maintain' ? 'bg-success shadow-sm hover:bg-success/90' : 'bg-danger shadow-sm hover:bg-danger/90'
                  }`}
                >
                  {submitVoteMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Xác nhận bỏ phiếu
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
