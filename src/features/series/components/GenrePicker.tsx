import { useMemo, useState } from 'react';
import { Check, Search, Tags, X } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { filterGenresByQuery, GENRE_OPTIONS, getGenreLabel } from '../constants/genres';
import { GENRE_PICKER_HELP } from '../constants/seriesCopy';

type GenrePickerProps = {
  selected: string[];
  onToggle: (genre: string) => void;
  onClear?: () => void;
  error?: string;
};

export const GenrePicker = ({
  selected,
  onToggle,
  onClear,
  error,
}: GenrePickerProps) => {
  const [query, setQuery] = useState('');
  const filteredGroups = useMemo(() => filterGenresByQuery(query), [query]);
  const hasSelection = selected.length > 0;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        error ? 'border-danger/40 bg-danger/[0.03]' : 'border-border-custom bg-bg-surface/40'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Tags size={14} className="text-brand shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs font-medium text-text-secondary">
              Thể loại <span className="text-danger">*</span>
            </p>
            <HelpTip
              title="Chọn thể loại"
              ariaLabel="Hướng dẫn chọn thể loại"
              placement="bottom-start"
              width="20rem"
              autoCloseMs={0}
              size="sm"
              content={
                <ul className="list-disc pl-4 space-y-1">
                  {GENRE_PICKER_HELP.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              }
            />
          </div>
        </div>
        <span
          className={`self-start sm:self-auto text-[10px] font-semibold px-2 py-0.5 rounded-full tabular-nums ${
            hasSelection ? 'bg-brand/15 text-brand' : 'bg-bg-primary text-text-muted'
          }`}
        >
          {selected.length}/{GENRE_OPTIONS.length} đã chọn
        </span>
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm thể loại (vd. hành động, shōnen)..."
          className="w-full pl-9 pr-3 py-2 bg-bg-primary border border-border-custom rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/15"
        />
      </div>

      {hasSelection && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {selected.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => onToggle(genre)}
              className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-lg bg-brand text-white text-[11px] font-medium border-none cursor-pointer hover:bg-brand/90 transition-colors"
              aria-label={`Bỏ chọn ${getGenreLabel(genre)}`}
            >
              {getGenreLabel(genre)}
              <X size={12} className="opacity-80" />
            </button>
          ))}
          {selected.length > 1 && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] text-text-muted hover:text-danger bg-transparent border-none cursor-pointer px-1 py-0.5"
            >
              Xóa hết
            </button>
          )}
        </div>
      )}

      <div className="space-y-4 max-h-[280px] overflow-y-auto pr-0.5 scrollbar-thin">
        {filteredGroups.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">Không tìm thấy thể loại phù hợp</p>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id}>
              <div className="mb-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{group.label}</p>
                  <HelpTip
                    title={group.label}
                    ariaLabel={`Giải thích ${group.label}`}
                    placement="bottom-start"
                    width="16rem"
                    autoCloseMs={0}
                    size="sm"
                    content={group.hint}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={group.label}>
                {group.genres.map((genre) => {
                  const isSelected = selected.includes(genre.value);
                  return (
                    <button
                      key={genre.value}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={genre.label}
                      onClick={() => onToggle(genre.value)}
                      className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer
                        ${
                          isSelected
                            ? 'bg-brand text-white border-brand shadow-sm shadow-brand/20 scale-[1.02]'
                            : 'bg-bg-primary text-text-secondary border-border-custom hover:border-brand/35 hover:text-text-primary hover:bg-bg-surface'
                        }
                      `}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/20' : 'border border-border-custom bg-bg-surface'
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </span>
                      {genre.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="text-[11px] text-danger mt-3 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-danger" />
          {error}
        </p>
      )}
    </div>
  );
};
