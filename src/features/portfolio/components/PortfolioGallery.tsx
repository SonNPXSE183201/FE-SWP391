import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';
import { usePortfolioSamples, useDeletePortfolioSample } from '../hooks/usePortfolio';
import { MotionStagger, MotionItem } from '../../../components/common/animation';
import { AddPortfolioSampleModal } from './AddPortfolioSampleModal';

interface PortfolioGalleryProps {
  assistantId?: number;
  readonly?: boolean;
}

export const PortfolioGallery = ({ assistantId, readonly = false }: PortfolioGalleryProps = {}) => {
  const { data: samples, isLoading } = usePortfolioSamples(assistantId);
  const deleteSampleMutation = useDeletePortfolioSample();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    if (readonly) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi Portfolio?')) return;
    setDeletingId(id);
    try {
      await deleteSampleMutation.mutateAsync(id);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Không thể xóa ảnh lúc này.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <ImageIcon size={20} className="text-brand" />
          Thư viện ảnh mẫu
        </h2>
        {/* TODO: Add upload functionality later */}
        {!readonly && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-lg text-sm font-semibold hover:bg-brand hover:text-white transition-colors border-none cursor-pointer"
          >
            <Plus size={16} />
            Thêm ảnh mới
          </button>
        )}
      </div>

      {!samples || samples.length === 0 ? (
        <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-12 text-center text-text-muted flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-4">
            <ImageIcon size={24} className="text-text-muted/50" />
          </div>
          <p>{readonly ? 'Chưa có ảnh mẫu nào.' : 'Bạn chưa tải lên ảnh mẫu nào.'}</p>
        </div>
      ) : (
        <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {samples.map((sample) => (
              <MotionItem key={sample.id} className="relative group rounded-xl overflow-hidden bg-bg-surface border border-border-custom aspect-[3/4]">
                <img
                  src={sample.imageUrl ?? undefined}
                  alt={sample.title || 'Portfolio sample'}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                  onClick={() => setSelectedImage(sample.imageUrl ?? null)}
                  loading="lazy"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="flex justify-end pointer-events-auto">
                    {!readonly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sample.id) handleDelete(sample.id);
                        }}
                        disabled={deletingId === sample.id}
                        className="p-2 rounded-lg bg-danger/90 text-white hover:bg-danger transition-colors"
                        title="Xóa ảnh"
                      >
                        {deletingId === sample.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-semibold text-sm truncate drop-shadow-md">
                      {sample.title}
                    </h3>
                    <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-brand text-white shadow-sm">
                      {sample.category}
                    </span>
                  </div>
                </div>
              </MotionItem>
            ))}
          </AnimatePresence>
        </MotionStagger>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={selectedImage}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              alt="Expanded portfolio"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AddPortfolioSampleModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
