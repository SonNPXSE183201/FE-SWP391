import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ImagePlus,
  Clock,
  ChevronRight,
  FileText,
  Loader2,
} from 'lucide-react';

import {
  SERIES_STATUS_CONFIG,
  StatusTimeline,
  SeriesInfoCard,
  NameUploader,
  SubmitChecklist,
  AcceptFundPanel,
  EditorRevisionPanel,
  useNameUpload,
  useSeriesSubmit,
  useAcceptFund,
  useSeriesBudgetEdit,
  useSeriesDetail,
} from '../index';
import type { SeriesStatus } from '../../../types/entities';
import type { SeriesNameUpdateSnapshot } from '../api/series.api';
import { NEMU_BUDGET_LABEL_SHORT, NEMU_MANUSCRIPT_LABEL } from '../constants/seriesCopy';
import { parseEditorRevisionNote } from '../utils/editorRevision.utils';

export const SeriesDetailFeature = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();

  // Fetch series via hook (USE_MOCK handled in API layer)
  const { data: series, isLoading } = useSeriesDetail(seriesId);

  const [statusOverride, setStatusOverride] = useState<SeriesStatus | null>(null);
  const [resubmitNote, setResubmitNote] = useState('');
  const currentStatus = statusOverride ?? series?.status ?? 'Draft';

  const seriesSnapshot: SeriesNameUpdateSnapshot | undefined = series
    ? {
        title: series.title,
        synopsis: series.synopsis,
        genre: series.genre,
        coverImageUrl: series.coverImageUrl,
        estimatedProductionBudget: series.estimatedProductionBudget ?? 0,
      }
    : undefined;

  // Feature hooks — F1.2 Name upload
  const nameUpload = useNameUpload({
    seriesId,
    initialResourceFolderUrl: series?.resourceFolderUrl,
    seriesSnapshot,
  });
  const seriesSubmit = useSeriesSubmit({
    seriesId,
    hasNameManuscript: nameUpload.hasNameManuscript,
    nameFileName: nameUpload.nameFileName,
    onStatusChange: useCallback((status: SeriesStatus) => setStatusOverride(status), []),
  });
  const acceptFund = useAcceptFund({
    seriesId,
    onStatusChange: useCallback((status: SeriesStatus) => setStatusOverride(status), []),
  });
  const budgetEdit = useSeriesBudgetEdit({
    seriesId,
    seriesSnapshot,
    resourceFolderUrl: series?.resourceFolderUrl ?? nameUpload.nameFileUrl,
  });
  const scrollToSubmit = useCallback(() => {
    document.getElementById('submit-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  // ─── Not Found ───
  if (!series) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-16 h-16 rounded-2xl bg-bg-surface flex items-center justify-center">
          <BookOpen size={28} className="text-text-muted" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">Series không tồn tại</p>
          <p className="text-xs text-text-muted mt-1">Không tìm thấy series với ID: {seriesId}</p>
        </div>
        <button
          onClick={() => navigate('/mangaka/series')}
          className="mt-2 px-5 py-2 rounded-xl bg-brand text-white text-sm font-medium border-none cursor-pointer hover:bg-brand-hover transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isDraft = series.status === 'Draft' && currentStatus === 'Draft';
  const hasRevisionRequest = isDraft && !!series.editorNote?.trim();
  const isPendingEditorReview =
    currentStatus === 'PendingApproval' || series.status === 'PendingApproval';
  const isPendingBoardVote =
    currentStatus === 'PendingBoardVote' || series.status === 'PendingBoardVote';
  const isFundPending = currentStatus === 'Approved';
  const statusConfig = hasRevisionRequest
    ? { label: 'Cần chỉnh sửa', color: 'text-amber-400', bg: 'bg-amber-500/10' }
    : SERIES_STATUS_CONFIG[currentStatus];

  const revisionParsed = hasRevisionRequest ? parseEditorRevisionNote(series.editorNote!) : null;

  const needsFieldRevision = (field: 'synopsis' | 'genre' | 'name' | 'budget' | 'cover') =>
    revisionParsed?.checklistIds.includes(field as 'synopsis' | 'genre' | 'name' | 'budget') ?? false;

  // Build checklist items for SubmitChecklist
  const checklistItems = [
    {
      label: 'Ảnh bìa',
      completed: !!series.coverImageUrl,
      needsRevision: needsFieldRevision('cover'),
    },
    {
      label: 'Tóm tắt nội dung',
      completed: !!series.synopsis,
      needsRevision: needsFieldRevision('synopsis'),
    },
    {
      label: NEMU_MANUSCRIPT_LABEL,
      completed: nameUpload.hasNameManuscript,
      needsRevision: needsFieldRevision('name'),
    },
    ...(needsFieldRevision('budget')
      ? [
          {
            label: NEMU_BUDGET_LABEL_SHORT,
            completed: (series.estimatedProductionBudget ?? 0) > 0,
            needsRevision: true,
          },
        ]
      : []),
  ];

  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/mangaka/series')}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span className="hover:text-text-primary cursor-pointer" onClick={() => navigate('/mangaka/series')}>Series</span>
            <ChevronRight size={12} />
            <span className="text-text-primary truncate">{series.title}</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary truncate">{series.title}</h1>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bg}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* ─── Status Timeline ─── */}
      {!hasRevisionRequest && <StatusTimeline currentStatus={currentStatus} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left: Cover Image ─── */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Ảnh bìa</h2>
            </div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-bg-surface border border-border-custom">
              {series.coverImageUrl ? (
                <img src={series.coverImageUrl} alt={series.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted">
                  <ImagePlus size={28} />
                  <span className="text-xs">Chưa có ảnh bìa</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Right: Info & Actions ─── */}
        <div className="lg:col-span-2 space-y-5">
          {hasRevisionRequest && (
            <EditorRevisionPanel
              editorNote={series.editorNote!}
              estimatedBudget={series.estimatedProductionBudget ?? 0}
              onSaveBudget={budgetEdit.saveBudget}
              onScrollToSubmit={scrollToSubmit}
            />
          )}

          {/* Series Info (Feature Component) */}
          <SeriesInfoCard series={series} />

          {/* Upload Name — Draft only (Feature Component) */}
          {isDraft && (
            <NameUploader
              nameFileUrl={nameUpload.nameFileUrl}
              nameFileName={nameUpload.nameFileName}
              isUploading={nameUpload.isUploading}
              isRemoving={nameUpload.isRemoving}
              fileInputRef={nameUpload.fileInputRef}
              onFileChange={nameUpload.handleFileChange}
              onRemoveFile={nameUpload.removeFile}
              onOpenFilePicker={nameUpload.openFilePicker}
            />
          )}

          {/* Submit Checklist — Draft only */}
          {isDraft && (
            <SubmitChecklist
                items={checklistItems}
                isSubmitting={seriesSubmit.isSubmitting}
                canSubmit={nameUpload.hasNameManuscript && !nameUpload.isUploading && !nameUpload.isRemoving}
                onSubmit={() => seriesSubmit.submitForApproval(hasRevisionRequest ? resubmitNote : undefined)}
                isRevisionResubmit={hasRevisionRequest}
                resubmitNote={resubmitNote}
                onResubmitNoteChange={hasRevisionRequest ? setResubmitNote : undefined}
            />
          )}

          {/* After Submit: Pending Editor */}
          {isPendingEditorReview && (
            <div className="space-y-4">
              {series.resourceFolderUrl && (
                <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={18} className="text-brand flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary">{NEMU_MANUSCRIPT_LABEL}</p>
                      <p className="text-xs text-text-muted truncate">Đã nộp kèm hồ sơ xét duyệt</p>
                    </div>
                  </div>
                  <a
                    href={series.resourceFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand hover:underline flex-shrink-0"
                  >
                    Xem PDF
                  </a>
                </div>
              )}
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-warning" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Đang chờ Editor duyệt</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Series đã được gửi cho Editor phụ trách đánh giá. Bạn sẽ nhận thông báo khi có kết quả.
                      Trong thời gian chờ, bạn không thể chỉnh sửa nội dung Series.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Editor đã trình Hội đồng */}
          {isPendingBoardVote && (
            <div className="bg-brand/5 border border-brand/20 rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Đang chờ Hội đồng thẩm định</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Editor đã trình hồ sơ lên Hội đồng. Bạn sẽ nhận thông báo khi có kết quả biểu quyết.
                    Trong thời gian chờ, bạn không thể chỉnh sửa nội dung Series.
                  </p>
                  {series.editorNote?.trim() && (
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                      Ghi chú Editor: {series.editorNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* F02 — Chấp nhận vốn sau Board duyệt (Fund_Pending) */}
          {isFundPending && (
            <div className="mt-8">
              <AcceptFundPanel
                approvedBudget={series.approvedProductionBudget ?? 0}
                hasContract={series.hasContract || false}
                isAccepting={acceptFund.isAccepting}
                onAccept={acceptFund.acceptFund}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
