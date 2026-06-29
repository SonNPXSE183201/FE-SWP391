import { ExternalLink, FileText, MessageSquareQuote, User } from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { NEMU_MANUSCRIPT_LABEL } from '../../series/constants/seriesCopy';
import type { VotingSeriesDto } from '../api/voting.api';

type BoardSeriesDossierProps = {
  series: Pick<
    VotingSeriesDto,
    'resourceFolderUrl' | 'editorNote' | 'editorName' | 'mangakaSubmissionNote'
  >;
  variant?: 'full' | 'compact';
};

export const BoardSeriesDossier = ({ series, variant = 'full' }: BoardSeriesDossierProps) => {
  const manuscriptUrl = series.resourceFolderUrl
    ? resolveMediaUrl(series.resourceFolderUrl)
    : '';
  const editorNote = series.editorNote?.trim();
  const mangakaNote = series.mangakaSubmissionNote?.trim();
  const isCompact = variant === 'compact';

  if (!manuscriptUrl && !editorNote && !mangakaNote) {
    return (
      <p className="text-xs text-text-muted italic">
        Chưa có bản phác thảo hoặc nhận xét Editor kèm hồ sơ.
      </p>
    );
  }

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-4'}>
      {manuscriptUrl && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand/5 ${
            isCompact ? 'px-3 py-2.5' : 'px-4 py-3'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText size={isCompact ? 16 : 18} className="text-brand shrink-0" />
            <div className="min-w-0">
              <p className={`font-medium text-text-primary ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {NEMU_MANUSCRIPT_LABEL}
              </p>
              {!isCompact && (
                <p className="text-[11px] text-text-muted mt-0.5">
                  File PDF do Mangaka nộp — nên xem trước khi biểu quyết
                </p>
              )}
            </div>
          </div>
          <a
            href={manuscriptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 font-medium text-brand hover:text-brand-hover shrink-0 ${
              isCompact ? 'text-[11px]' : 'text-xs'
            }`}
          >
            Xem PDF
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {editorNote && (
        <div
          className={`rounded-xl border border-border-custom bg-bg-surface/50 ${
            isCompact ? 'px-3 py-2.5' : 'px-4 py-3'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand mb-1.5">
            <MessageSquareQuote size={13} />
            Đánh giá của Editor
            {series.editorName && (
              <span className="text-text-muted font-normal inline-flex items-center gap-1">
                · <User size={10} /> {series.editorName}
              </span>
            )}
          </div>
          <p
            className={`text-text-primary leading-relaxed whitespace-pre-wrap ${
              isCompact ? 'text-xs line-clamp-4' : 'text-sm'
            }`}
          >
            {editorNote}
          </p>
        </div>
      )}

      {mangakaNote && (
        <div
          className={`rounded-xl border border-border-custom bg-bg-primary/40 ${
            isCompact ? 'px-3 py-2.5' : 'px-4 py-3'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary mb-1.5">
            <MessageSquareQuote size={13} />
            Ghi chú của Tác giả
          </div>
          <p
            className={`text-text-secondary leading-relaxed whitespace-pre-wrap ${
              isCompact ? 'text-xs line-clamp-3' : 'text-sm'
            }`}
          >
            {mangakaNote}
          </p>
        </div>
      )}
    </div>
  );
};
