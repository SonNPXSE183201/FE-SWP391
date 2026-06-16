import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Eye } from 'lucide-react';
import type { Series } from '../../../types/entities';
import { SERIES_STATUS_CONFIG } from '../constants';
import { CoverPlaceholder } from './CoverPlaceholder';

// ─── Grid Card ───────────────────────────────────────────────
export const SeriesCard = ({ series, index }: { series: Series; index: number }) => {
  const navigate = useNavigate();
  const status = SERIES_STATUS_CONFIG[series.status] || { label: String(series.status), color: 'text-text-muted', bg: 'bg-bg-surface' };
  const updatedDate = new Date(series.updatedAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div
      onClick={() => navigate(`/mangaka/series/${series.id}`)}
      className="group bg-bg-secondary border border-border-custom rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-brand/30 hover:shadow-md-custom hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {series.coverImageUrl ? (
          <img src={series.coverImageUrl} alt={series.title} className="w-full h-full object-cover" />
        ) : (
          <CoverPlaceholder title={series.title} index={index} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-80" />

        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.color} backdrop-blur-sm`}>
            {status.label}
          </span>
        </div>

        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-[11px] text-white/80 font-medium">
            <FileText size={12} />
            {series.chapterCount} chương
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors duration-200 line-clamp-1">
          {series.title}
        </h3>
        <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
          {series.synopsis}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {series.genre.slice(0, 3).map((g) => (
            <span key={g} className="px-2 py-0.5 rounded-md bg-brand/8 text-brand/80 text-[10px] font-medium border border-brand/10">
              {g}
            </span>
          ))}
          {series.genre.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-bg-surface text-text-muted text-[10px] font-medium">
              +{series.genre.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border-custom">
          <Clock size={12} className="text-text-muted" />
          <span className="text-[11px] text-text-muted">Cập nhật {updatedDate}</span>
        </div>
      </div>
    </div>
  );
};

// ─── List Row ────────────────────────────────────────────────
export const SeriesRow = ({ series, index }: { series: Series; index: number }) => {
  const navigate = useNavigate();
  const status = SERIES_STATUS_CONFIG[series.status] || { label: String(series.status), color: 'text-text-muted', bg: 'bg-bg-surface' };
  const updatedDate = new Date(series.updatedAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div
      onClick={() => navigate(`/mangaka/series/${series.id}`)}
      className="group flex items-center gap-4 bg-bg-secondary border border-border-custom rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-brand/30 hover:bg-bg-surface/50"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="w-14 h-[72px] rounded-lg overflow-hidden flex-shrink-0">
        {series.coverImageUrl ? (
          <img src={series.coverImageUrl} alt={series.title} className="w-full h-full object-cover" />
        ) : (
          <CoverPlaceholder title={series.title} index={index} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors truncate">
            {series.title}
          </h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color} flex-shrink-0`}>
            {status.label}
          </span>
        </div>
        <p className="text-xs text-text-muted mt-1 line-clamp-1">{series.synopsis}</p>
        <div className="flex items-center gap-3 mt-2">
          {series.genre.slice(0, 3).map((g) => (
            <span key={g} className="text-[10px] text-brand/70 font-medium">{g}</span>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        <div className="text-center">
          <div className="text-sm font-semibold text-text-primary">{series.chapterCount}</div>
          <div className="text-[10px] text-text-muted">Chương</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-text-muted">{updatedDate}</div>
          <div className="text-[10px] text-text-muted">Cập nhật</div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <button className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors">
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
};
