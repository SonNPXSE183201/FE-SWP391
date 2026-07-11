import { BookOpen, AlignLeft, Tags, Banknote, FileText } from 'lucide-react';

import type { SeriesDto } from '../../../api/generated/types';

import { getGenreLabel } from '../../../constants/genres';

import { MANGAKA_PROPOSED_LABEL, NEMU_BUDGET_LABEL_SHORT } from '../../../constants/seriesCopy';

import { parseGenreList } from '../utils/series.utils';



interface SeriesInfoCardProps {

  series: SeriesDto;

  chapterCount?: number;

}



export const SeriesInfoCard = ({ series, chapterCount }: SeriesInfoCardProps) => {

  const genres = parseGenreList(series.genre);



  return (

    <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">

      <div className="flex items-center gap-2 mb-4">

        <BookOpen size={16} className="text-brand" />

        <h2 className="text-sm font-semibold text-text-primary">Thông tin Series</h2>

      </div>



      <div className="space-y-4">

        {/* Title */}

        <div>

          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Tiêu đề</p>

          <p className="text-base font-semibold text-text-primary">{series.title}</p>

        </div>



        {/* Synopsis */}

        <div>

          <div className="flex items-center gap-1 mb-1">

            <AlignLeft size={10} className="text-text-muted" />

            <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Tóm tắt nội dung</p>

          </div>

          <p className="text-sm text-text-secondary leading-relaxed">{series.synopsis}</p>

        </div>



        {/* Genres */}

        <div>

          <div className="flex items-center gap-1 mb-1.5">

            <Tags size={10} className="text-text-muted" />

            <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Thể loại</p>

          </div>

          <div className="flex flex-wrap gap-1.5">

            {genres.map((g) => (

              <span key={g} className="px-2.5 py-1 rounded-lg bg-brand/10 text-brand text-[11px] font-medium border border-brand/15">

                {getGenreLabel(g)}

              </span>

            ))}

          </div>

        </div>



        {/* Budget & Stats */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">

          <div className="bg-bg-surface border border-border-custom rounded-xl px-4 py-3 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">

              <Banknote size={16} className="text-brand" />

            </div>

            <div>

              <p className="text-[10px] text-text-muted">{NEMU_BUDGET_LABEL_SHORT}</p>

              <p className="text-sm font-semibold text-text-primary">

                {series.status === 'Approved' && (series.approvedProductionBudget ?? 0) > 0

                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(

                      series.approvedProductionBudget ?? 0,

                    )

                  : series.status === 'Published'

                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(

                        series.approvedProductionBudget ?? series.estimatedProductionBudget ?? 0,

                      )

                    : (series.estimatedProductionBudget ?? 0) > 0

                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(

                          series.estimatedProductionBudget ?? 0,

                        )

                      : 'Chưa đề xuất'}

              </p>

              {series.status === 'Draft' && (series.estimatedProductionBudget ?? 0) > 0 && (

                <p className="text-[10px] text-text-muted mt-0.5">{MANGAKA_PROPOSED_LABEL}</p>

              )}

            </div>

          </div>

          <div className="bg-bg-surface border border-border-custom rounded-xl px-4 py-3 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">

              <FileText size={16} className="text-info" />

            </div>

            <div>

              <p className="text-[10px] text-text-muted">Số chương</p>

              <p className="text-sm font-semibold text-text-primary">{chapterCount ?? 0}</p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};

