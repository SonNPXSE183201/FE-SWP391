import { useState, useCallback } from 'react';
import {
  MapPin,
  ChevronLeft, ChevronRight, AlertCircle,
  Loader2, ImageOff, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { CanvasToolbar } from '../../../components/canvas/CanvasToolbar';
import { MobileCanvasWarning } from '../../../components/canvas/MobileCanvasWarning';
import { useCanvasStore } from '../../../stores/canvasStore';
import {
  useCanvasPages, useAnnotations, useRegions,
  useCreateAnnotation, useDeleteAnnotation,
} from '../hooks/useCanvasData';
import type { AnnotationType } from '../../../types/status.types';
import type { CanvasAnnotation } from '../types/canvas.types';
import { AnimatePresence, motion } from 'framer-motion';
import { canvasPageVariants, canvasShellTransition } from '../../../components/common/animation';

interface AnnotationReviewFeatureProps {
  chapterId?: string;
}

const ANNOTATION_TYPE_CONFIG: Record<AnnotationType, { color: string; bg: string; icon: string; label: string }> = {
  Technical: { color: 'text-red-400', bg: 'bg-red-500/10', icon: '🔴', label: 'Lỗi kỹ thuật' },
  Art: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: '🟡', label: 'Lỗi mỹ thuật' },
  Content: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '🔵', label: 'Lỗi nội dung' },
};

export const AnnotationReviewFeature = ({ chapterId = 'ch-1' }: AnnotationReviewFeatureProps) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [annoComment, setAnnoComment] = useState('');
  const {
    activeTool, zoomLevel, annotationType, selectedAnnotationId,
    setActiveTool, setZoomLevel, setAnnotationType, setSelectedAnnotation,
  } = useCanvasStore();

  // ─── Data ───
  const { data: pages = [], isLoading: pagesLoading } = useCanvasPages(chapterId);
  const currentPage = pages[currentPageIndex];
  const pageId = currentPage?.id ?? '';

  const { data: annotations = [] } = useAnnotations(pageId);
  const { data: regions = [] } = useRegions(pageId);

  const createAnnotation = useCreateAnnotation(pageId);
  const deleteAnnotation = useDeleteAnnotation(pageId);

  // ─── Handlers ───
  const handleAnnotationCreated = useCallback(
    (data: { x: number; y: number; type: AnnotationType; comment: string }) => {
      if (!data.comment.trim()) {
        toast.error('Vui lòng nhập nội dung ghi chú');
        return;
      }
      createAnnotation.mutate(
        { pageId, ...data },
        {
          onSuccess: () => {
            toast.success(`Đã thêm annotation (${ANNOTATION_TYPE_CONFIG[data.type].label})`);
          },
          onError: () => toast.error('Lỗi khi tạo annotation'),
        }
      );
    },
    [createAnnotation, pageId],
  );

  const handleDeleteAnnotation = useCallback((annoId: string) => {
    deleteAnnotation.mutate(annoId, {
      onSuccess: () => {
        toast.success('Đã xoá annotation');
        setSelectedAnnotation(null);
      },
      onError: () => toast.error('Lỗi khi xoá annotation'),
    });
  }, [deleteAnnotation, setSelectedAnnotation]);



  const handleZoomIn = useCallback(() => setZoomLevel(Math.min(zoomLevel * 1.2, 5)), [zoomLevel, setZoomLevel]);
  const handleZoomOut = useCallback(() => setZoomLevel(Math.max(zoomLevel / 1.2, 0.1)), [zoomLevel, setZoomLevel]);
  const handleZoomReset = useCallback(() => setZoomLevel(1), [setZoomLevel]);

  if (pagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!currentPage) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={canvasShellTransition}
      >
        <ImageOff size={48} className="text-text-muted" />
        <p className="text-text-secondary">Không tìm thấy trang nào để review</p>
      </motion.div>
    );
  }

  return (
    <>
      <MobileCanvasWarning />
      <motion.div
        className="hidden md:flex flex-col gap-4 h-[calc(100vh-120px)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={canvasShellTransition}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <MapPin size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                QC Review — Trang {currentPage.pageNumber}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                  <AlertCircle size={10} /> {annotations.length} annotation
                </span>
              </div>
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono text-text-secondary min-w-[60px] text-center">
              {currentPageIndex + 1} / {pages.length}
            </span>
            <button
              onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Canvas */}
          <div className="flex-1 relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={pageId}
                className="w-full h-full"
                variants={canvasPageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
            <CanvasViewer
              imageUrl={currentPage.imageUrl}
              regions={regions}
              annotations={annotations}
              mode={activeTool === 'annotate' ? 'annotate' : 'view'}
              onAnnotationCreated={(data) => handleAnnotationCreated({ ...data, type: annotationType, comment: annoComment })}
              selectedAnnotationId={selectedAnnotationId}
              onAnnotationSelect={setSelectedAnnotation}
              className="w-full h-full"
            />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <CanvasToolbar
                activeTool={activeTool}
                zoomLevel={zoomLevel}
                onToolChange={setActiveTool}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                onZoomFit={handleZoomReset}
                showRegionTool={false}
                showAnnotateTool
              />
            </div>
          </div>

          {/* Sidebar — Annotations */}
          <div className="w-80 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl flex flex-col">
            <div className="p-4 border-b border-border-custom">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <MapPin size={14} className="text-red-400" />
                Danh sách Annotation
              </h3>

              {/* Annotation type selector + comment (when in annotate mode) */}
              {activeTool === 'annotate' && (
                <div className="mt-3 space-y-2">
                  <label className="text-[10px] text-text-muted block">Loại lỗi</label>
                  <div className="flex gap-1.5">
                    {(Object.keys(ANNOTATION_TYPE_CONFIG) as AnnotationType[]).map((type) => {
                      const cfg = ANNOTATION_TYPE_CONFIG[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setAnnotationType(type)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                            annotationType === type
                              ? `${cfg.bg} ${cfg.color} border-current`
                              : 'bg-bg-primary border-border-custom/50 text-text-muted hover:border-border-custom'
                          }`}
                        >
                          <span>{cfg.icon}</span>
                          <span className="hidden lg:inline">{cfg.label.replace('Lỗi ', '')}</span>
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    value={annoComment}
                    onChange={(e) => setAnnoComment(e.target.value)}
                    placeholder="Mô tả lỗi... (bắt buộc)"
                    rows={2}
                    className="w-full px-3 py-2 text-xs bg-bg-primary border border-border-custom rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand/50 resize-none"
                  />
                  <p className="text-[9px] text-text-muted">Click lên ảnh để đặt ghim annotation</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {annotations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-text-muted">
                  <MapPin size={24} />
                  <p className="text-xs text-center">Chưa có annotation nào.<br />Chọn công cụ Annotate để bắt đầu.</p>
                </div>
              ) : (
                annotations.map((anno: CanvasAnnotation) => {
                  const cfg = ANNOTATION_TYPE_CONFIG[anno.type as AnnotationType];
                  return (
                    <div
                      key={anno.id}
                      onClick={() => setSelectedAnnotation(anno.id === selectedAnnotationId ? null : anno.id)}
                      className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                        anno.id === selectedAnnotationId
                          ? 'border-brand/40 bg-brand/5'
                          : 'border-border-custom/50 bg-bg-primary hover:border-brand/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm">{cfg.icon}</span>
                          <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(anno.id); }}
                            className="w-5 h-5 rounded flex items-center justify-center text-danger hover:bg-danger/10 transition-all cursor-pointer bg-transparent border-none"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1.5 line-clamp-2">{anno.comment}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[9px] text-text-muted">{anno.editorName}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
