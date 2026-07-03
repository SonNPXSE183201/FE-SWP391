import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  ImagePlus,
  Banknote,
  Tags,
  Send,
  MessageSquare,
  ClipboardCheck,
  User,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  Check,
} from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { useReviewSeriesDetail, useSubmitToBoard, useRequireRevision } from '../hooks/useReview';
import type { SeriesReviewDto } from '../api/review.api';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { formatVND, formatVNDInput } from '../../../utils/currency';

const CHECKLIST_ITEMS = [
  { id: 'synopsis', label: 'Nội dung tóm tắt rõ ràng, hấp dẫn' },
  { id: 'genre', label: 'Thể loại phù hợp thị trường mục tiêu' },
  { id: 'name', label: 'Phác thảo (Name) đạt chất lượng cơ bản' },
  { id: 'budget', label: 'Ngân sách yêu cầu hợp lý' },
] as const;

type ChecklistId = (typeof CHECKLIST_ITEMS)[number]['id'];


const STATUS_LABELS: Record<string, string> = {
  Pending_Approval: 'Chờ Review',
  Pending_Board_Vote: 'Chờ Hội đồng',
  Draft: 'Bản nháp',
};

export const ReviewSeriesFeature = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  const [editorNotes, setEditorNotes] = useState('');
  const [checklist, setChecklist] = useState<Record<ChecklistId, boolean>>({
    synopsis: false,
    genre: false,
    name: false,
    budget: false,
  });
  const [suggestedBudget, setSuggestedBudget] = useState('');

  const { data: series, isLoading } = useReviewSeriesDetail(seriesId ?? '');
  const typedSeries = series as SeriesReviewDto | null | undefined;
  const submitToBoard = useSubmitToBoard();
  const requireRevision = useRequireRevision();

  const originalBudget = typedSeries?.estimatedProductionBudget ?? 0;
  const checkedCount = CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length;
  const allChecked = checkedCount === CHECKLIST_ITEMS.length;
  const uncheckedItems = CHECKLIST_ITEMS.filter((item) => !checklist[item.id]);
  const nonBudgetUnchecked = uncheckedItems.filter((item) => item.id !== 'budget');

  const suggestedBudgetNum = suggestedBudget ? Number(suggestedBudget.replace(/[^0-9]/g, '')) : 0;
  const budgetFailed = !checklist.budget;
  const onlyBudgetFailed = budgetFailed && nonBudgetUnchecked.length === 0;

  const coverUrl = typedSeries?.coverArtworkUrl ? resolveMediaUrl(typedSeries.coverArtworkUrl) : '';

  const toggleChecklist = (id: ChecklistId) => {
    setChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === 'budget' && !next.budget) {
        setSuggestedBudget('');
      }
      return next;
    });
  };

  const handleSubmitEvaluation = () => {
    if (!editorNotes.trim()) {
      toast.error('Vui lòng nhập nhận xét.');
      return;
    }

    if (allChecked) {
      submitToBoard.mutate(
        { seriesId: seriesId ?? '', notes: editorNotes },
        {
          onSuccess: () => {
            toast.success('Đã trình hồ sơ lên Hội đồng!');
            navigate('/editor/review');
          },
          onError: () => toast.error('Có lỗi xảy ra. Vui lòng thử lại.'),
        },
      );
      return;
    }

    if (onlyBudgetFailed) {
      if (suggestedBudgetNum <= 0) {
        toast.error('Vui lòng nhập ngân sách biên tập viên đề xuất.');
        return;
      }
      submitToBoard.mutate(
        {
          seriesId: seriesId ?? '',
          notes: editorNotes.trim(),
          editorRecommendedBudget: suggestedBudgetNum,
        },
        {
          onSuccess: () => {
            toast.success('Đã trình hồ sơ lên Hội đồng kèm đề xuất ngân sách!');
            navigate('/editor/review');
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
          },
        },
      );
      return;
    }

    requireRevision.mutate(
      {
        seriesId: seriesId ?? '',
        comment: editorNotes.trim(),
        suggestedBudget: undefined,
        failedChecklistItems: uncheckedItems.map((item) => item.id),
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi phản hồi cho Mangaka.');
          navigate('/editor/review');
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  if (!typedSeries) {
    return <div className="text-center py-10 text-text-muted">Không tìm thấy thông tin series.</div>;
  }

  const genreList = (typedSeries.genre ?? '').split(',').map((g) => g.trim()).filter(Boolean);
  const isSubmitting = submitToBoard.isPending || requireRevision.isPending;
  const statusLabel = STATUS_LABELS[typedSeries.status ?? ''] ?? typedSeries.status;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/editor/review')}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-primary truncate">Duyệt hồ sơ bộ truyện</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {typedSeries.title} · Mã {seriesId}
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
          {statusLabel}
        </span>
      </div>

      {typedSeries.mangakaSubmissionNote?.trim() && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand mb-1.5">
            <MessageSquare size={13} />
            Ghi chú của Tác giả
          </div>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {typedSeries.mangakaSubmissionNote}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left — Series detail */}
        <div className="flex flex-col gap-5 h-full min-h-0">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Thông tin Series</h2>
            </div>

            <div className="flex gap-5">
              <div className="w-28 h-[150px] rounded-xl overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                {coverUrl ? (
                  <img src={coverUrl} alt={typedSeries.title ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <ImagePlus size={28} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{typedSeries.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <User size={12} className="text-text-muted" />
                      {typedSeries.mangakaName}
                    </span>
                    <span className="text-text-muted">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-text-muted" />
                      {new Date(typedSeries.createAt ?? '').toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {genreList.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <Tags size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Tóm tắt nội dung</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed flex-1">{typedSeries.synopsis || '—'}</p>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <Banknote size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Tài chính & Phác thảo</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 h-full">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Vốn yêu cầu</p>
                <p className="text-xl font-bold text-text-primary mt-1">{formatVND(originalBudget)}</p>
                <p className="text-[11px] text-text-muted mt-1">Mangaka đề xuất</p>
              </div>
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 h-full">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Số chương</p>
                <p className="text-xl font-bold text-text-primary mt-1">{typedSeries.chapterCount ?? 0}</p>
                <p className="text-[11px] text-text-muted mt-1">
                  {(typedSeries.chapters ?? []).length > 0
                    ? `Mới nhất: ${typedSeries.chapters![typedSeries.chapters!.length - 1].title ?? 'không có'}`
                    : 'Chưa có chương nào'}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-border-custom bg-bg-surface">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Bản phác thảo</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {typedSeries.resourceFolderUrl
                        ? 'Mangaka đã nộp tệp phác thảo chương mẫu.'
                        : 'Chưa có bản phác thảo được nộp kèm hồ sơ.'}
                    </p>
                  </div>
                </div>
                {typedSeries.resourceFolderUrl ? (
                  <a
                    href={resolveMediaUrl(typedSeries.resourceFolderUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand text-xs font-medium no-underline flex-shrink-0"
                  >
                    <ExternalLink size={14} />
                    Xem tệp
                  </a>
                ) : (
                  <span className="text-[10px] text-danger font-medium flex-shrink-0">Thiếu tệp</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Editor panel */}
        <div className="flex flex-col h-full min-h-0">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex-1 flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Đánh giá biên tập</h2>
                <HelpTip
                  content={
                    <>
                      Tick các mục đạt yêu cầu. Nếu <strong className="text-text-primary">đủ 4/4</strong>, hồ sơ
                      trình thẳng lên Hội đồng. Nếu chỉ mục ngân sách chưa đạt, nhập mức biên tập viên đề xuất — hồ sơ vẫn
                      được trình Hội đồng mà không bắt Mangaka nộp lại. Các mục khác chưa đạt sẽ gửi về Mangaka chỉnh sửa.
                    </>
                  }
                  ariaLabel="Hướng dẫn đánh giá"
                />
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  allChecked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-warning/10 text-warning'
                }`}
              >
                {checkedCount}/{CHECKLIST_ITEMS.length}
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden shrink-0 mt-4">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }}
              />
            </div>

            <div className="space-y-1 shrink-0 mt-4">
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">
                Danh mục kiểm tra
              </p>
              {CHECKLIST_ITEMS.map((item) => {
                const checked = checklist[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                        : 'bg-bg-surface border-border-custom hover:border-brand/30'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                        checked ? 'bg-brand border-brand text-white' : 'border-border-custom bg-bg-secondary'
                      }`}
                    >
                      {checked && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span className={`text-xs ${checked ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {budgetFailed && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3 animate-fade-in shrink-0 mt-4">
                <div className="flex items-center gap-2">
                  <Banknote size={14} className="text-amber-400" />
                  <p className="text-xs font-semibold text-text-primary">Ngân sách biên tập viên đề xuất</p>
                  <span className="text-danger text-[10px]">*</span>
                </div>
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  Ngân sách hiện tại vượt định mức hoặc chưa phù hợp với quy mô dự án. Nhập mức đề xuất và lý do —
                  hồ sơ vẫn được đẩy lên Hội đồng.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 rounded-lg bg-bg-surface border border-border-custom">
                    <p className="text-[10px] text-text-muted">Mangaka đề xuất</p>
                    <p className="text-sm font-semibold text-text-primary whitespace-nowrap">{formatVND(originalBudget)}</p>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={suggestedBudget ? formatVNDInput(suggestedBudget) : ''}
                    onChange={(e) => setSuggestedBudget(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Nhập mức biên tập viên đề xuất"
                    className="px-3 py-2 bg-bg-surface border border-border-custom rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand/50"
                  />
                </div>
                {suggestedBudgetNum > 0 && (
                  <p className="text-[11px] text-brand font-medium">
                    Hội đồng sẽ thấy: {formatVND(suggestedBudgetNum)}
                  </p>
                )}
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 mt-4">
              <label className="block text-xs font-medium text-text-secondary mb-1.5 shrink-0">
                <MessageSquare size={12} className="inline mr-1" />
                Nhận xét <span className="text-danger">*</span>
              </label>
              <textarea
                value={editorNotes}
                onChange={(e) => setEditorNotes(e.target.value)}
                placeholder={
                  allChecked
                    ? 'Nhận xét tổng quan trước khi trình Hội đồng...'
                    : onlyBudgetFailed
                      ? 'Lý do điều chỉnh ngân sách (vd. cắt giảm chi phí thuê trợ lý)...'
                      : 'Mô tả chi tiết phần Mangaka cần chỉnh sửa...'
                }
                maxLength={1000}
                className="flex-1 min-h-[7rem] w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-none"
              />
              <p className="text-[10px] text-text-muted mt-1 text-right shrink-0">{editorNotes.length}/1000</p>
            </div>

            <div className="pt-3 space-y-2 shrink-0 mt-auto">
              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={isSubmitting}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all disabled:opacity-50 ${
                  allChecked || onlyBudgetFailed
                    ? 'bg-brand hover:bg-brand-hover text-white shadow-brand'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Gửi đánh giá
              </button>
              <p className="text-[10px] text-center text-text-muted">
                {allChecked
                  ? 'Hồ sơ đạt yêu cầu — sẽ trình lên Hội đồng'
                  : `${uncheckedItems.length} mục chưa đạt — phản hồi gửi về Mangaka`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
