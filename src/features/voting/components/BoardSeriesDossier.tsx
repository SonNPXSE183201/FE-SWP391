import { ExternalLink, FileText, MessageSquareQuote, User } from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { NEMU_MANUSCRIPT_LABEL } from '../../../constants/seriesCopy';
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
      <p className="text-xs text-text-muted italic bg-bg-surface px-4 py-3 rounded-lg border border-border-custom/50">
        Chưa có tài liệu phác thảo hoặc nhận xét nào kèm theo hồ sơ.
      </p>
    );
  }

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-4'}>
      {manuscriptUrl && (
        <div
          className={`group flex items-center justify-between gap-4 rounded-xl border border-brand/20 bg-gradient-to-r from-brand/5 to-transparent hover:from-brand/10 transition-colors ${
            isCompact ? 'px-3 py-2.5' : 'p-4'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-col sm:flex-row">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <p className={`font-bold text-text-primary ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {NEMU_MANUSCRIPT_LABEL}
              </p>
              {!isCompact && (
                <p className="text-[11px] text-text-muted mt-0.5 font-medium">
                  Tài liệu PDF do Tác giả nộp — nên xem trước khi biểu quyết
                </p>
              )}
            </div>
          </div>
          <a
            href={manuscriptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-1.5 font-semibold text-brand bg-brand/10 hover:bg-brand/20 px-3.5 py-2 rounded-lg transition-colors shrink-0 ${
              isCompact ? 'text-[11px]' : 'text-xs'
            }`}
          >
            Xem PDF
            <ExternalLink size={14} strokeWidth={2.5} />
          </a>
        </div>
      )}

      {editorNote && (
        <div
          className={`rounded-xl border border-border-custom bg-bg-surface ${
            isCompact ? 'px-3 py-2.5' : 'p-4 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand mb-2.5 uppercase tracking-wider">
            <MessageSquareQuote size={14} />
            Biên tập viên đánh giá
            {series.editorName && (
              <span className="text-text-muted font-medium inline-flex items-center gap-1 ml-1 normal-case tracking-normal">
                · <User size={12} /> {series.editorName}
              </span>
            )}
          </div>
          <div
            className={`text-text-primary leading-relaxed whitespace-pre-wrap ${
              isCompact ? 'text-xs line-clamp-4' : 'text-sm'
            }`}
          >
            {editorNote}
          </div>
        </div>
      )}

      {mangakaNote && (
        <div
          className={`rounded-xl border border-border-custom bg-bg-primary ${
            isCompact ? 'px-3 py-2.5' : 'p-4 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary mb-2.5 uppercase tracking-wider">
            <MessageSquareQuote size={14} />
            Ghi chú của Tác giả
          </div>
          <div
            className={`text-text-secondary leading-relaxed whitespace-pre-wrap italic ${
              isCompact ? 'text-xs line-clamp-4' : 'text-sm'
            }`}
          >
            {mangakaNote}
          </div>
        </div>
      )}
    </div>
  );
};
