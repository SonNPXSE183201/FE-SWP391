import { Loader2, SendHorizonal, AlertTriangle, CheckCircle2, Circle, RotateCcw, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChapterProductionReadiness } from '../types/chapterProduction';
import { HelpTip } from '../../../components/common/HelpTip';
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
  const missingChecks = totalChecks - readyCount;
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
    <div className="bg-bg-secondary border border-brand/20 rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <SendHorizonal size={16} className="text-brand" />
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Nộp chương lên biên tập viên</h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Hoàn tất danh sách kiểm tra bên dưới rồi nộp để biên tập viên kiểm duyệt.
            </p>
          </div>
          <HelpTip
            title="Khi nào được nộp?"
            ariaLabel="Giải thích điều kiện nộp chương"
            placement="bottom-start"
            width="22rem"
            content={(
              <div className="space-y-2">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Chương chỉ nộp được khi không còn công việc trợ lý đang xử lý và mỗi trang đều sẵn sàng nộp.
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Nếu có lỗi từ biên tập viên, bạn có thể tải lại ảnh trang đã sửa hoặc mở khung vẽ để giao trợ lý xử lý.
                </p>
              </div>
            )}
          />
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
            readiness.canSubmit ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'bg-warning/10 text-warning border border-warning/20'
          }`}
        >
          {readiness.canSubmit ? 'Sẵn sàng nộp' : 'Chưa thể nộp'}
        </span>
      </div>

      <div className="rounded-xl border border-border-custom bg-bg-primary/30 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-medium text-text-secondary">
            Tiến độ điều kiện nộp
          </span>
          <span className="text-[11px] font-semibold text-text-primary">
            {readyCount}/{totalChecks} điều kiện
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${canSubmit ? 'bg-emerald-500' : 'bg-brand'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 mt-2 text-[11px]">
          <span className="text-text-muted">
            {readiness.pagesReady}/{readiness.totalPages} trang sẵn sàng
          </span>
          <span className={canSubmit ? 'text-emerald-300' : 'text-warning'}>
            {canSubmit ? 'Đủ điều kiện nộp' : `Còn thiếu ${missingChecks} điều kiện`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="space-y-2">
          {readiness.checks.map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                item.passed
                  ? 'bg-emerald-500/8 border-emerald-500/20'
                  : 'bg-bg-surface border-border-custom'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                  item.passed ? 'bg-success/15 text-success' : 'bg-bg-secondary text-text-muted border border-border-custom'
                }`}
              >
                {item.passed ? <CheckCircle2 size={14} /> : <Circle size={10} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5">
                  <span className={item.passed ? 'text-text-primary' : 'text-text-muted'}>{item.label}</span>
                  {item.detail && (
                    <HelpTip
                      title={item.label}
                      ariaLabel={`Giải thích: ${item.label}`}
                      placement="bottom-start"
                      width="18rem"
                      content={<p className="text-xs text-text-secondary leading-relaxed">{item.detail}</p>}
                    />
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-medium ${item.passed ? 'text-emerald-300' : 'text-text-muted'}`}>
                {item.passed ? 'Hoàn tất' : 'Chưa đạt'}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {readiness.blockers.length > 0 ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                <AlertTriangle size={13} />
                Cần hoàn thành trước khi nộp
                <HelpTip
                  title="Gợi ý xử lý nhanh"
                  ariaLabel="Gợi ý xử lý blocker"
                  placement="bottom-start"
                  width="20rem"
                  content={(
                    <ul className="text-xs text-text-secondary list-disc pl-4 space-y-1">
                      <li>Ưu tiên xử lý các công việc còn mở trong khung vẽ.</li>
                      <li>Nếu tự sửa file ảnh, dùng nút tải lại trên thẻ trang.</li>
                      <li>Sau khi xong, bấm Đánh dấu sẵn sàng cho từng trang.</li>
                    </ul>
                  )}
                />
              </div>
              <ul className="text-[11px] text-amber-200/90 list-disc pl-4 space-y-1">
                {readiness.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-3">
              <p className="text-[11px] font-semibold text-emerald-300">
                Tất cả điều kiện đã hoàn thành.
              </p>
              <p className="text-[11px] text-text-secondary mt-1">
                Bạn có thể nộp chương để biên tập viên bắt đầu kiểm duyệt.
              </p>
            </div>
          )}

          <Link
            to={`/mangaka/canvas/${chapterId}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium bg-brand/15 text-brand border border-brand/30 hover:bg-brand/20 transition-colors"
          >
            → Mở khung vẽ để tiếp tục sản xuất
          </Link>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!readiness.canSubmit || isSubmitting}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
              !readiness.canSubmit || isSubmitting
                ? 'bg-brand/30 text-white/50 cursor-not-allowed'
                : 'bg-brand hover:bg-brand-hover text-white shadow-brand'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <SendHorizonal size={16} />
                Nộp chương lên biên tập viên
              </>
            )}
          </button>
          {!canSubmit && (
            <p className="text-[11px] text-text-muted text-center">
              Hoàn thành toàn bộ điều kiện để mở nút nộp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
