import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ImagePlus,
  Clock,
  ChevronRight,
  FileText,
  Layers,
} from 'lucide-react';

import {
  MOCK_SERIES,
  MOCK_CHAPTERS,
  SERIES_STATUS_CONFIG,
  StatusTimeline,
  SeriesInfoCard,
  NameUploader,
  SubmitChecklist,
  useNameUpload,
  useSeriesSubmit,
} from '../index';
import type { SeriesStatus } from '../../../types/entities';

export const SeriesDetailFeature = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();

  // Find series from mock data
  const series = MOCK_SERIES.find((s) => s.id === seriesId);

  // Local status state (mock — will be server state via React Query)
  const [currentStatus, setCurrentStatus] = useState<SeriesStatus>(series?.status ?? 'Draft');

  // Chapters belonging to this series
  const chapters = useMemo(
    () => MOCK_CHAPTERS.filter((ch) => ch.seriesId === seriesId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber),
    [seriesId],
  );

  // Feature hooks
  const nameUpload = useNameUpload();
  const seriesSubmit = useSeriesSubmit({
    nameFile: nameUpload.nameFile,
    onStatusChange: useCallback((status: SeriesStatus) => setCurrentStatus(status), []),
  });

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

  const isDraft = currentStatus === 'Draft';
  const statusConfig = SERIES_STATUS_CONFIG[currentStatus];

  // Build checklist items for SubmitChecklist
  const checklistItems = [
    { label: 'Ảnh bìa', completed: !!series.coverImageUrl },
    { label: 'Tóm tắt nội dung', completed: !!series.synopsis },
    { label: 'Bản phác thảo (Name)', completed: !!nameUpload.nameFile },
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

      {/* ─── Status Timeline (Feature Component) ─── */}
      <StatusTimeline currentStatus={currentStatus} />

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
          {/* Series Info (Feature Component) */}
          <SeriesInfoCard series={series} />

          {/* Upload Name — Draft only (Feature Component) */}
          {isDraft && (
            <NameUploader
              nameFile={nameUpload.nameFile}
              nameFileName={nameUpload.nameFileName}
              fileInputRef={nameUpload.fileInputRef}
              onFileChange={nameUpload.handleFileChange}
              onRemoveFile={nameUpload.removeFile}
              onOpenFilePicker={nameUpload.openFilePicker}
            />
          )}

          {/* Submit Checklist — Draft only (Feature Component) */}
          {isDraft && (
            <SubmitChecklist
              items={checklistItems}
              isSubmitting={seriesSubmit.isSubmitting}
              canSubmit={!!nameUpload.nameFile}
              onSubmit={seriesSubmit.submitForApproval}
            />
          )}

          {/* After Submit: Pending Message */}
          {currentStatus === 'PendingApproval' && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-warning" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Đang chờ xét duyệt</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Series đã được gửi cho Editor phụ trách đánh giá. Bạn sẽ nhận được thông báo khi có kết quả.
                    Trong thời gian chờ, bạn không thể chỉnh sửa nội dung Series.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Chapters List ─── */}
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-text-primary">Danh sách Chapter</h2>
            <span className="text-[10px] text-text-muted bg-bg-surface px-2 py-0.5 rounded-full">{chapters.length}</span>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-text-muted">
            <FileText size={28} />
            <p className="text-xs">Chưa có chapter nào trong series này</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => navigate(`/mangaka/manuscripts/${ch.id}`)}
                className="group flex items-center gap-4 p-3.5 rounded-xl border border-border-custom/50 bg-bg-primary hover:border-brand/30 hover:bg-brand/[0.03] transition-all cursor-pointer"
              >
                {/* Chapter number */}
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-sm font-bold text-brand flex-shrink-0">
                  {ch.chapterNumber}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    Ch.{ch.chapterNumber}: {ch.title}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {ch.totalPages} trang
                  </p>
                </div>

                {/* Status badge */}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium flex-shrink-0 ${
                  ch.status === 'Approved' ? 'bg-success/10 text-success' :
                  ch.status === 'InProgress' ? 'bg-info/10 text-info' :
                  ch.status === 'PendingReview' ? 'bg-warning/10 text-warning' :
                  'bg-bg-surface text-text-muted'
                }`}>
                  {ch.status === 'Approved' ? 'Đã duyệt' :
                   ch.status === 'InProgress' ? 'Đang làm' :
                   ch.status === 'PendingReview' ? 'Chờ duyệt' :
                   'Nháp'}
                </span>

                {/* Arrow */}
                <ChevronRight size={16} className="text-text-muted group-hover:text-brand transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
