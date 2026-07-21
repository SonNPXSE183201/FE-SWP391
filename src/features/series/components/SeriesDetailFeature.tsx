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
  ScrollText,
  Eye,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

import {
  getSeriesStatusConfig,
  StatusTimeline,
  SeriesInfoCard,
  NameUploader,
  SubmitChecklist,
  AcceptFundPanel,
  EditorRevisionPanel,
  SeriesTeamPanel,
  useNameUpload,
  useSeriesSubmit,
  useAcceptFund,
  useSeriesBudgetEdit,
  useSeriesDetail,
} from '../index';
import { useRankingList } from '../../ranking/hooks/useRanking';
import type { SeriesStatus } from '../../../types/status.types';
import type { SeriesNameUpdateSnapshot } from '../api/series.api';
import { NEMU_BUDGET_LABEL_SHORT, NEMU_MANUSCRIPT_LABEL } from '../../../constants/seriesCopy';
import { parseEditorRevisionNote } from '../utils/editorRevision.utils';
import { parseGenreList, resolveSeriesCover } from '../utils/series.utils';
import { MotionStagger, MotionItem } from '../../../components/common/animation';
import { motion } from 'framer-motion';

const SERIES_STATUS_ORDER: Partial<Record<SeriesStatus, number>> = {
  Draft: 0,
  PendingApproval: 1,
  PendingBoardVote: 2,
  Approved: 3,
  Fund_Pending: 4,
  'In Production': 5,
  Published: 6,
};

export const SeriesDetailFeature = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();

  // Fetch series via API hook
  const { data: series, isLoading } = useSeriesDetail(seriesId);
  
  const { data: rankings } = useRankingList();
  const seriesRanking = rankings?.find((r) => r.seriesId?.toString() === seriesId);
  
  const totalSeries = rankings?.length || 0;
  const axingThreshold = totalSeries > 0 ? Math.ceil(totalSeries * 0.8) : 999;
  const isAxingWarning = seriesRanking && seriesRanking.rankPosition && seriesRanking.rankPosition >= axingThreshold;

  const [statusOverride, setStatusOverride] = useState<SeriesStatus | null>(null);
  const [resubmitNote, setResubmitNote] = useState('');
  const serverStatus = series?.status ?? 'Draft';
  const currentStatus =
    statusOverride
      && (SERIES_STATUS_ORDER[statusOverride] ?? 0) > (SERIES_STATUS_ORDER[serverStatus] ?? 0)
      ? statusOverride
      : serverStatus;

  const seriesSnapshot: SeriesNameUpdateSnapshot | undefined = series
    ? {
        title: series.title ?? '',
        synopsis: series.synopsis ?? '',
        genre: parseGenreList(series.genre),
        coverImageUrl: resolveSeriesCover(series),
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
      <motion.div
        className="flex flex-col items-center justify-center gap-4 py-20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
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
      </motion.div>
    );
  }

  const isDraft = series.status === 'Draft' && currentStatus === 'Draft';
  const hasRevisionRequest = isDraft && !!series.editorNote?.trim();
  const isPendingEditorReview = currentStatus === 'PendingApproval';
  const isPendingBoardVote = currentStatus === 'PendingBoardVote';
  const isFundPending = currentStatus === 'Approved' || currentStatus === 'Fund_Pending';
  const canManageTeam = currentStatus === 'Published' || currentStatus === 'In Production';
  const statusConfig = hasRevisionRequest
    ? { label: 'Cần chỉnh sửa', color: 'text-amber-400', bg: 'bg-amber-500/10' }
    : getSeriesStatusConfig(currentStatus);

  const revisionParsed = hasRevisionRequest ? parseEditorRevisionNote(series.editorNote!) : null;
  const coverUrl = resolveSeriesCover(series);

  const needsFieldRevision = (field: 'synopsis' | 'genre' | 'name' | 'budget' | 'cover') =>
    revisionParsed?.checklistIds.includes(field as 'synopsis' | 'genre' | 'name' | 'budget') ?? false;

  // Build checklist items for SubmitChecklist
  const checklistItems = [
    {
      label: 'Ảnh bìa',
      completed: !!coverUrl,
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
    <div>
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

      {/* ─── Axing Warning Banner ─── */}
      {isAxingWarning && (
        <div className="mb-6 bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-danger flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="text-danger font-bold text-sm">Cảnh báo nguy cơ Hủy xuất bản (Axing)</h3>
            <p className="text-sm text-text-secondary mt-1">
              Bộ truyện của bạn đang ở nhóm chót Bảng xếp hạng (Hạng #{seriesRanking?.rankPosition} / {totalSeries}). Nếu tình trạng này kéo dài, Hội đồng có thể sẽ quyết định ngừng xuất bản. Hãy cố gắng cải thiện chất lượng ở các chương tiếp theo!
            </p>
          </div>
        </div>
      )}

      {/* ─── Status Timeline ─── */}
      {!hasRevisionRequest && <StatusTimeline currentStatus={currentStatus} />}

      <MotionStagger className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left: Cover Image ─── */}
        <MotionItem className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Ảnh bìa</h2>
            </div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-bg-surface border border-border-custom">
              {coverUrl ? (
                <img src={coverUrl} alt={series.title ?? ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted">
                  <ImagePlus size={28} />
                  <span className="text-xs">Chưa có ảnh bìa</span>
                </div>
              )}
            </div>
          </div>
        </MotionItem>

        {/* ─── Right: Info & Actions ─── */}
        <MotionItem className="lg:col-span-2 space-y-5">
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

          {/* Ranking Widget */}
          {seriesRanking && (
            <div className="bg-bg-secondary border border-brand/20 rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-bg-surface/50 transition-colors" onClick={() => navigate('/mangaka/ranking')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <BarChart3 size={20} className="text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Bảng xếp hạng độc giả</p>
                  <p className="text-xs text-text-muted mt-0.5">Thứ hạng hiện tại của bộ truyện</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-brand">#{seriesRanking.rankPosition}</div>
                <div className="text-[11px] text-text-muted mt-0.5">{seriesRanking.voteCount?.toLocaleString()} phiếu bầu</div>
              </div>
            </div>
          )}

          {canManageTeam && seriesId && (
            <SeriesTeamPanel seriesId={seriesId} seriesTitle={series.title ?? ''} />
          )}

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
                onSubmit={() => seriesSubmit.submitForApproval(resubmitNote)}
                isRevisionResubmit={hasRevisionRequest}
                resubmitNote={resubmitNote}
                onResubmitNoteChange={setResubmitNote}
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
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-warning/5 border border-warning/20 rounded-xl p-5"
              >
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
              </motion.div>
            </div>
          )}

          {/* Editor đã trình Hội đồng */}
          {isPendingBoardVote && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-brand/5 border border-brand/20 rounded-xl p-5"
            >
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
            </motion.div>
          )}

          {/* F02 — Chấp nhận vốn sau Board duyệt (Fund_Pending) */}
          {isFundPending && (
            <div className="mt-8">
              <AcceptFundPanel
                estimatedBudget={series.estimatedProductionBudget ?? 0}
                approvedBudget={series.approvedProductionBudget ?? 0}
                hasContract={series.hasContract || false}
                contractId={series.contractId}
                contractStatus={series.contractStatus}
                baseGenkouryoPrice={series.baseGenkouryoPrice}
                contractSignedDate={series.contractSignedDate}
                contractFileUrl={(series as { contractFileUrl?: string | null }).contractFileUrl}
                isSigning={acceptFund.isSigning}
                isRejecting={acceptFund.isRejecting}
                onSign={acceptFund.signContract}
                onReject={acceptFund.rejectContract}
              />
            </div>
          )}

          {/* Hợp đồng đã ký kết và có hiệu lực */}
          {series.hasContract && ['signed', 'active'].includes((series.contractStatus ?? '').trim().toLowerCase()) && (
            <div className="mt-8 bg-bg-secondary border border-emerald-500/20 rounded-xl p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <ScrollText size={16} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-text-primary">Hợp đồng đã ký kết</h2>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Bản hợp đồng chính thức đã được hai bên ký điện tử và đang có hiệu lực. Bạn có thể xem hoặc tải về bản PDF bất cứ lúc nào dưới đây.
              </p>
              {(series as { contractFileUrl?: string | null }).contractFileUrl && (
                <div className="mt-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ScrollText size={18} className="text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">Bản hợp đồng PDF (Đã ký)</p>
                      <p className="text-xs text-text-muted mt-0.5">Mã hợp đồng: #{series.contractId}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open((series as { contractFileUrl?: string | null }).contractFileUrl!, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium border-none cursor-pointer hover:bg-emerald-500 transition-colors"
                  >
                    <Eye size={14} />
                    Xem hợp đồng đã ký
                  </button>
                </div>
              )}
            </div>
          )}
        </MotionItem>
      </MotionStagger>
    </div>
  );
};
