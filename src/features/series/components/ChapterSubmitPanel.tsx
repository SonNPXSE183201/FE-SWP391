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
    <div className="bg-bg-secondary border border-border-custom/40 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group/panel">
      {/* Background elegant gradient hints */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-[80px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3 transition-opacity duration-700 opacity-50 group-hover/panel:opacity-100" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      <div className="relative flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-bg-surface to-bg-primary border border-border-custom/50 flex items-center justify-center shrink-0 shadow-sm relative">
              <div className="absolute inset-0 bg-brand/10 rounded-2xl opacity-0 group-hover/panel:opacity-100 transition-opacity duration-500" />
              <SendHorizonal size={24} className="text-brand relative z-10" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Tiến độ nộp chương</h2>
              <p className="text-sm text-text-muted mt-1 max-w-md leading-relaxed">
                Hoàn tất danh sách kiểm tra bên dưới để có thể nộp chương cho biên tập viên.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-300 ${
                canSubmit
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-bg-surface text-text-secondary border border-border-custom'
              }`}
            >
              {canSubmit ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Sẵn sàng nộp
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-text-muted" />
                  Chưa thể nộp
                </>
              )}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 bg-bg-primary/30 p-5 rounded-2xl border border-border-custom/30">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Tiến độ hoàn thành</span>
              <div className="text-sm text-text-secondary">
                <span className="text-text-primary font-bold text-lg">{readyCount}</span>
                <span className="mx-1.5 opacity-50">/</span>
                <span>{totalChecks} hạng mục</span>
              </div>
            </div>
            <div className={`text-3xl font-black tracking-tighter ${canSubmit ? 'text-emerald-400' : 'text-brand/80'}`}>
              {Math.round(progressPercent)}<span className="text-lg opacity-60">%</span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-bg-surface border border-border-custom/40 overflow-hidden shadow-inner relative">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${
                canSubmit
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                  : 'bg-gradient-to-r from-brand/80 to-brand shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Checklist */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 size={16} className="text-brand" />
              Danh sách kiểm tra
            </h3>
            <div className="space-y-3">
              {readiness.checks.map((item) => (
                <div
                  key={item.key}
                  className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                    item.passed
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_4px_20px_rgba(52,211,153,0.05)]'
                      : 'bg-bg-primary/50 border-border-custom/50 hover:border-border-custom hover:shadow-lg'
                  }`}
                >
                  <div
                    className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      item.passed
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)] scale-110'
                        : 'bg-bg-surface text-text-muted border border-border-custom group-hover:bg-bg-secondary'
                    }`}
                  >
                    {item.passed ? <CheckCircle2 size={16} strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40 transition-colors group-hover:bg-text-muted/60" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className={`text-sm font-bold transition-colors ${item.passed ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                        {item.label}
                      </span>
                      <span className={`inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                        item.passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-bg-surface text-text-muted border border-border-custom/50'
                      }`}>
                        {item.passed ? 'Đạt' : 'Chưa đạt'}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="text-xs text-text-muted mt-2 leading-relaxed pr-4">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Alerts & Actions */}
          <div className="lg:col-span-2 flex flex-col">
            {readiness.blockers.length > 0 ? (
              <div className="rounded-2xl border border-warning/20 bg-warning/5 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-warning/30 flex flex-col h-full">
                <div className="h-1.5 w-full bg-gradient-to-r from-warning/60 to-warning/30" />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                      <AlertTriangle size={16} className="text-warning" />
                    </div>
                    <h4 className="text-sm font-bold text-warning uppercase tracking-wider">
                      Cần xử lý trước khi nộp
                    </h4>
                  </div>
                  <ul className="text-sm text-text-secondary space-y-3 pl-1 flex-1">
                    {readiness.blockers.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-3 leading-relaxed">
                        <span className="text-warning mt-1.5 w-1.5 h-1.5 rounded-full bg-warning/60 shrink-0 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={`/mangaka/canvas/${chapterId}`}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-bg-surface text-text-primary border border-border-custom hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-all duration-200 shadow-sm group"
                  >
                    <MapPin size={18} className="text-text-muted group-hover:text-brand transition-colors" />
                    Mở khung vẽ để xử lý
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-emerald-500/30 flex flex-col h-full">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/60 to-emerald-500/30" />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                      <CheckCircle2 size={16} className="text-emerald-400" strokeWidth={3} />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      Đã sẵn sàng nộp
                    </h4>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">
                    Tuyệt vời! Bạn đã hoàn thành tất cả các hạng mục yêu cầu. Hãy nộp chương cho biên tập viên ngay bây giờ.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-5 mt-auto">
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`w-full relative inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-bold border-none transition-all duration-300 overflow-hidden ${
                  !canSubmit || isSubmitting
                    ? 'bg-bg-surface text-text-muted/60 cursor-not-allowed shadow-inner border border-border-custom'
                    : 'bg-gradient-to-r from-brand via-brand-hover to-brand text-white shadow-xl shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-1 cursor-pointer bg-[length:200%_auto] hover:bg-[position:right_center]'
                }`}
              >
                {canSubmit && !isSubmitting && (
                  <>
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -inset-1 bg-brand/30 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  </>
                )}
                
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Đang gửi dữ liệu...
                    </>
                  ) : (
                    <>
                      <SendHorizonal size={20} className={canSubmit ? "animate-bounce-x" : ""} />
                      {canSubmit ? 'Nộp chương ngay' : 'Chưa đủ điều kiện nộp'}
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
