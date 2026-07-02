import { Loader2, SendHorizonal, AlertTriangle, CheckCircle2, Circle, RotateCcw, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChapterProductionReadiness } from '../types/chapterProduction';
import { normalizeChapterStatus } from '../../../utils/status';

interface RevisionAnnotation {
  id: string;
  pageId: string;
  pageNumber: number;
  comment: string;
  type: string;
}

interface ChapterSubmitPanelProps {
  chapterId: string;
  readiness: ChapterProductionReadiness | null | undefined;
  isLoading: boolean;
  isError?: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onRetry?: () => void;
  variant?: 'panel' | 'compact';
  chapterStatus?: string;
  revisionAnnotations?: RevisionAnnotation[];
}

export const ChapterSubmitPanel = ({
  chapterId,
  readiness,
  isLoading,
  isError = false,
  isSubmitting,
  onSubmit,
  onRetry,
  variant = 'panel',
  chapterStatus,
  revisionAnnotations = [],
}: ChapterSubmitPanelProps) => {
  const isRevision = normalizeChapterStatus(chapterStatus) === 'Revision';
  const canSubmit = readiness?.canSubmit ?? false;

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting || isLoading || isError}
        title={
          isError
            ? 'Không kết nối được API — hãy khởi động lại backend'
            : isRevision
              ? canSubmit ? 'Nộp lại chương sau khi đã sửa lỗi' : 'Hoàn thành sửa lỗi trước khi nộp lại'
              : canSubmit
                ? 'Nộp chương lên biên tập viên để kiểm duyệt'
                : 'Hoàn thành sản xuất trên khung vẽ trước khi nộp'
        }
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200 ${
          canSubmit && !isSubmitting && !isLoading && !isError
            ? isRevision
              ? 'bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 hover:-translate-y-0.5'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5'
            : 'bg-bg-secondary text-text-muted border border-border-custom cursor-not-allowed opacity-70'
        }`}
      >
        {isSubmitting
          ? <Loader2 size={16} className="animate-spin" />
          : isRevision ? <RotateCcw size={16} /> : <SendHorizonal size={16} />}
        {isRevision ? 'Nộp lại chương' : 'Nộp lên biên tập viên'}
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center justify-center gap-2 text-sm text-text-muted">
        <Loader2 size={16} className="animate-spin" />
        Đang kiểm tra tiến độ sản xuất...
      </div>
    );
  }

  if (isError || !readiness) {
    return (
      <div className="bg-bg-secondary border border-amber-500/25 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <SendHorizonal size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">Nộp chương lên biên tập viên</h2>
        </div>
        <p className="text-xs text-amber-300/90">
          Không tải được trạng thái sản xuất từ server. Hãy <strong>khởi động lại backend</strong> (service
          MangaPublishingSystem) rồi thử lại.
        </p>
        <p className="text-xs text-text-muted">
          Sau khi hoàn thành khung vẽ (giao việc → duyệt → bản gộp), bạn nộp chương tại đây để biên tập viên kiểm duyệt.
        </p>
        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-brand/10 text-brand border border-brand/20 cursor-pointer"
            >
              Thử lại
            </button>
          )}
          <Link
            to={`/mangaka/canvas/${chapterId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-bg-surface text-text-primary border border-border-custom hover:border-brand/30"
          >
            → Mở khung vẽ
          </Link>
        </div>
      </div>
    );
  }

  const readyCount = readiness.checks.filter((c) => c.passed).length;
  const totalChecks = readiness.checks.length;
  const progressPercent = readiness.checks.length ? (readyCount / readiness.checks.length) * 100 : 0;

  // Group annotations by page number for revision view
  const annotationsByPage = revisionAnnotations.reduce<Record<number, RevisionAnnotation[]>>((acc, anno) => {
    if (!acc[anno.pageNumber]) acc[anno.pageNumber] = [];
    acc[anno.pageNumber].push(anno);
    return acc;
  }, {});
  const affectedPages = Object.keys(annotationsByPage).map(Number).sort((a, b) => a - b);

  if (isRevision) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-danger/20 bg-bg-secondary">
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-danger/60 via-amber-500/60 to-danger/60" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 pb-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-danger/15 flex items-center justify-center shrink-0">
              <RotateCcw size={18} className="text-danger" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Biên tập viên yêu cầu chỉnh sửa</h2>
              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                Sửa lỗi bên dưới rồi nộp lại. Bấm <span className="text-brand font-medium">Tải lại</span> trên thẻ trang hoặc mở khung vẽ.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-danger/12 text-danger border border-danger/20">
            Yêu cầu sửa
          </span>
        </div>

        {/* Annotations grouped by page */}
        <div className="px-4 sm:px-5 pt-4">
          {revisionAnnotations.length > 0 ? (
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-amber-500/10">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-amber-400" />
                  <span className="text-[11px] font-semibold text-text-primary">Lỗi cần sửa</span>
                </div>
                <span className="text-[10px] font-medium text-amber-300">
                  {revisionAnnotations.length} lỗi · {affectedPages.length} trang
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-border-custom/30">
                {affectedPages.map((pageNum) => {
                  const pageAnnos = annotationsByPage[pageNum];
                  return (
                    <div key={pageNum} className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold px-1">
                          P.{String(pageNum).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-text-muted">({pageAnnos.length})</span>
                      </div>
                      <div className="space-y-1 pl-1">
                        {pageAnnos.map((anno) => (
                          <p key={anno.id} className="text-xs text-text-secondary leading-relaxed flex items-start gap-1.5">
                            <span className="text-amber-400/60 mt-0.5">›</span>
                            {anno.comment}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <p className="text-[11px] text-text-muted leading-relaxed">
                Biên tập viên yêu cầu sửa nhưng chưa ghim lỗi cụ thể. Vui lòng liên hệ để biết chi tiết.
              </p>
            </div>
          )}
        </div>

        {/* Progress + Checklist compact + Actions */}
        <div className="p-4 sm:p-5 pt-4 space-y-3">
          {/* Compact progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-text-muted font-medium">Điều kiện nộp lại</span>
                <span className={canSubmit ? 'text-emerald-400 font-semibold' : 'text-text-muted'}>
                  {readyCount}/{totalChecks} hoàn tất
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    canSubmit ? 'bg-emerald-500' : 'bg-brand'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Inline checklist dots */}
          <div className="flex flex-wrap gap-1.5">
            {readiness.checks.map((item) => (
              <span
                key={item.key}
                title={`${item.label}: ${item.passed ? 'Hoàn tất' : 'Chưa đạt'}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                  item.passed
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-bg-surface text-text-muted border border-border-custom'
                }`}
              >
                {item.passed ? <CheckCircle2 size={10} /> : <Circle size={8} />}
                {item.label}
              </span>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              to={`/mangaka/canvas/${chapterId}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-brand/10 text-brand border border-brand/25 hover:bg-brand/20 transition-all"
            >
              → Mở khung vẽ
            </Link>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-200 ${
                !canSubmit || isSubmitting
                  ? 'bg-bg-surface text-text-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand to-brand-hover text-white shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <RotateCcw size={16} />
                  Nộp lại chương
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border-custom/50 rounded-2xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
      {/* Background elegant gradient hint */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

      <div className="relative flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/10 flex items-center justify-center shrink-0 shadow-inner">
              <SendHorizonal size={22} className="text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Tiến độ nộp chương</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Hoàn tất danh sách kiểm tra bên dưới để có thể nộp chương cho biên tập viên.
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
              canSubmit
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-warning/10 text-warning border border-warning/20'
            }`}
          >
            {canSubmit ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {canSubmit ? 'Sẵn sàng nộp' : 'Chưa thể nộp'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-text-secondary">
              Hoàn thành: <span className="text-text-primary font-bold">{readyCount}/{totalChecks}</span> hạng mục
            </span>
            <span className={`font-bold ${canSubmit ? 'text-emerald-400' : 'text-brand'}`}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-bg-surface border border-border-custom/30 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-700 ease-out relative ${
                canSubmit
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-brand/80 to-brand'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-border-custom/40">
          {/* Left Column: Checklist */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand" />
              Danh sách kiểm tra
            </h3>
            <div className="space-y-2.5">
              {readiness.checks.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-300 ${
                    item.passed
                      ? 'bg-emerald-500/5 border-emerald-500/15'
                      : 'bg-bg-primary/40 border-border-custom/60 shadow-sm'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      item.passed
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                        : 'bg-bg-surface text-text-muted border border-border-custom'
                    }`}
                  >
                    {item.passed ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-text-muted/30" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-bold ${item.passed ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                        item.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-bg-surface text-text-muted'
                      }`}>
                        {item.passed ? 'Đạt' : 'Chưa đạt'}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="text-xs text-text-muted mt-1.5 leading-relaxed pr-4">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Alerts & Actions */}
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2 opacity-0 select-none hidden lg:flex">
              Hành động
            </h3>
            
            {readiness.blockers.length > 0 ? (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4.5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-warning/60" />
                <div className="flex items-start gap-3 pl-2">
                  <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-warning uppercase tracking-wider mb-2.5">
                      Cần xử lý trước khi nộp
                    </h4>
                    <ul className="text-xs text-text-secondary space-y-2">
                      {readiness.blockers.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-warning/50 mt-0.5 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4.5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/60" />
                <div className="flex items-start gap-3 pl-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-emerald-400" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                      Đã sẵn sàng nộp
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Tuyệt vời! Bạn đã hoàn thành tất cả các hạng mục yêu cầu. Hãy nộp chương cho biên tập viên ngay.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-auto pt-6">
              <Link
                to={`/mangaka/canvas/${chapterId}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-bg-surface text-text-primary border border-border-custom hover:border-brand/40 hover:text-brand transition-all duration-200 shadow-sm group"
              >
                <MapPin size={16} className="text-text-muted group-hover:text-brand transition-colors" />
                Mở khung vẽ để xử lý
              </Link>

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`w-full relative inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold border-none transition-all duration-300 overflow-hidden ${
                  !canSubmit || isSubmitting
                    ? 'bg-bg-surface text-text-muted/60 cursor-not-allowed shadow-inner'
                    : 'bg-gradient-to-r from-brand to-brand-hover text-white shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                {canSubmit && !isSubmitting && (
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                )}
                
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang gửi dữ liệu...
                  </>
                ) : (
                  <>
                    <SendHorizonal size={18} className={canSubmit ? "animate-bounce-x" : ""} />
                    {canSubmit ? 'Nộp chương ngay' : 'Chưa đủ điều kiện nộp'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
