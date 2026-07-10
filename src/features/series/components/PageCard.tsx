import { ZoomIn, Layers, Loader2, MapPin, Upload } from 'lucide-react';

import type { PageDto } from '../../../api/generated/types';

import { getPageStatusConfig } from '../constants';

import { PagePlaceholder } from './PagePlaceholder';

import { usePagePreviewUrl } from '../hooks/usePagePreviewUrl';



interface PageCardProps {

  page: PageDto;

  onClick: () => void;

  editorAnnotationCount?: number;

  canReplaceImage?: boolean;

  onReplaceImage?: () => void;

}



export const PageCard = ({

  page,

  onClick,

  editorAnnotationCount = 0,

  canReplaceImage = false,

  onReplaceImage,

}: PageCardProps) => {

  const statusCfg = getPageStatusConfig(page.status);

  const { displayUrl, isLoading, hasLiveComposite } = usePagePreviewUrl(page);

  const hasComposite = !!page.compositeImageUrl || hasLiveComposite;



  return (

    <div

      onClick={onClick}

      className="group relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-brand/30 hover:shadow-md-custom hover:-translate-y-0.5"

    >

      {/* Image / Placeholder */}

      <div className="relative aspect-[3/4] overflow-hidden">

        {isLoading ? (

          <div className="flex h-full w-full items-center justify-center bg-bg-surface">

            <Loader2 size={22} className="animate-spin text-brand" />

          </div>

        ) : displayUrl ? (

          <img

            src={displayUrl}

            alt={`Trang ${page.pageNumber}`}

            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"

          />

        ) : (

          <PagePlaceholder pageNumber={page.pageNumber ?? 0} />

        )}



        {hasComposite && (

          <div className="absolute bottom-2 left-2">

            <span className="inline-flex items-center gap-1 bg-success/80 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">

              <Layers size={10} />

              Đã gộp

            </span>

          </div>

        )}



        {/* Hover overlay */}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">

          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">

            <ZoomIn size={14} className="text-white" />

            <span className="text-white text-xs font-medium">Xem lớn</span>

          </div>

        </div>



        {/* Page number badge */}

        <div className="absolute top-2 left-2">

          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">

            P.{String(page.pageNumber).padStart(2, '0')}

          </span>

        </div>



        {editorAnnotationCount > 0 && (

          <div className="absolute top-2 right-2">

            <span className="inline-flex items-center gap-1 bg-amber-500/85 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">

              <MapPin size={10} />

              {editorAnnotationCount} lỗi

            </span>

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2.5 space-y-2">

        <span className="block text-xs font-semibold text-text-primary">

          Trang {page.pageNumber}

        </span>

        <div className="flex items-center justify-between gap-2">

          {canReplaceImage && onReplaceImage && (

            <button

              type="button"

              onClick={(e) => {

                e.stopPropagation();

                onReplaceImage();

              }}

              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20 cursor-pointer"

              title="Tải lại ảnh trang đã sửa"

            >

              <Upload size={10} />

              Tải lại

            </button>

          )}

          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>

            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />

            {statusCfg.label}

          </span>

        </div>

      </div>

    </div>

  );

};

